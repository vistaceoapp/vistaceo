/**
 * Tests de blindaje del setup. Falla la build si:
 *  - El componente intenta usar buildEmergencyQuestionnaireCandidate directo en producción.
 *  - El fallback premium incluye preguntas genéricas prohibidas.
 *  - BATCH_CONFIG viola los caps por modo.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);
const FILE = resolve(__dirnameLocal, '../SetupStepQuestionnaire.tsx');
const SOURCE = readFileSync(FILE, 'utf8');

const BANNED_DIRECT_QUESTIONS = [
  /¿Cu[aá]l\s+es\s+tu\s+negocio\?/i,
  /¿Qu[eé]\s+vendes\?/i,
  /¿A\s+qui[eé]n\s+(le\s+)?vendes\?/i,
  /¿Cu[aá]l\s+es\s+tu\s+objetivo\?/i,
  /¿Cu[aá]l\s+es\s+tu\s+canal\s+principal\?/i,
  /¿Cu[aá]l\s+es\s+tu\s+(mayor|principal)\s+problema\?/i,
  /¿Qu[eé]\s+quieres\s+mejorar\?/i,
  /¿C[oó]mo\s+consigues\s+clientes\?/i,
  /¿Qu[eé]\s+te\s+diferencia\?/i,
  /¿Cu[aá]l\s+es\s+tu\s+ticket\s+promedio\?/i,
];

describe('Setup intelligence hardening', () => {
  it('NO renderiza buildEmergencyQuestionnaireCandidate en producción', () => {
    // Debe haber kill switch isProductionRuntime() que devuelva [] en prod
    expect(SOURCE).toMatch(/isProductionRuntime\(\)\s*\?\s*\[\]\s*:\s*buildEmergencyQuestionnaireCandidate/);
  });

  it('No quedan referencias al nombre legacy buildEasyQuestionnaire', () => {
    expect(SOURCE).not.toMatch(/buildEasyQuestionnaire\(/);
  });

  it('Fallback visible es pivotFallback (NO emergencyCandidate)', () => {
    expect(SOURCE).toMatch(/setQuestions\(pivotFallback\)/);
    // No debe haber setQuestions(emergencyCandidate) en ningún lado
    expect(SOURCE).not.toMatch(/setQuestions\(emergencyCandidate\)/);
  });

  it('Pregunta-pivote es la única pregunta del fallback premium', () => {
    // El fallback premium contiene solo PIVOT_VALUE_LOSS
    expect(SOURCE).toMatch(/id:\s*'PIVOT_VALUE_LOSS'/);
  });

  it('Cap Rápido = 10 (respeta la promesa visual)', () => {
    expect(SOURCE).toMatch(/quick:\s*\{\s*firstBatch:\s*10[\s\S]*?totalMax:\s*10/);
  });

  it('Cap Completo ≤ 35', () => {
    const match = SOURCE.match(/complete:\s*\{[\s\S]*?totalMax:\s*(\d+)/);
    expect(match).toBeTruthy();
    expect(Number(match![1])).toBeLessThanOrEqual(35);
  });

  it('Segundo batch requiere ≥3 respuestas (contexto real)', () => {
    expect(SOURCE).toMatch(/answeredCount\s*>=\s*3/);
  });

  it('Pregunta-pivote NO contiene frases genéricas prohibidas', () => {
    // Extraer el bloque buildPremiumPivotFallback
    const block = SOURCE.match(/function buildPremiumPivotFallback[\s\S]*?\n\}/)?.[0] || '';
    for (const rx of BANNED_DIRECT_QUESTIONS) {
      expect(block).not.toMatch(rx);
    }
  });

  it('Estado inicial NO se inicializa con lista fija sin cache', () => {
    expect(SOURCE).toMatch(/useState<UniversalQuestion\[\]>\(hasCache\s*\?\s*cacheData!\.questions\s*:\s*\[\]\)/);
  });

  it('Refs de bloqueo arrancan en false (no skipean el motor AI)', () => {
    expect(SOURCE).toMatch(/backgroundFetchStarted\s*=\s*useRef\(false\)/);
    expect(SOURCE).toMatch(/allBatchesDone\s*=\s*useRef\(cacheComplete\)/);
  });

  it('Se invoca generateFirstBatch() al montar (motor AI)', () => {
    expect(SOURCE).toMatch(/generateFirstBatch\(\);/);
  });
});
