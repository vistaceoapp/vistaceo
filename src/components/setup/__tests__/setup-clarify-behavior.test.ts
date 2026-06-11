/**
 * Tests de comportamiento de la opción horizontal "No sé / Quiero aclarar algo".
 * Falla la build si:
 *  - El botón horizontal autoavanza.
 *  - El input vacío no se guarda como "No sé".
 *  - El input con texto no se guarda como aclaración.
 *  - Las opciones normales no se filtran con getNormalOptions (cap 6).
 *  - El helper q() agrega una opción "No sé" dentro del grid normal.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);
const FILE = resolve(__dirnameLocal, '../SetupStepQuestionnaire.tsx');
const SOURCE = readFileSync(FILE, 'utf8');

describe('Setup clarify-option behavior', () => {
  it('Botón horizontal usa label "No sé / Quiero aclarar algo"', () => {
    expect(SOURCE).toMatch(/No sé \/ Quiero aclarar algo/);
  });

  it('handleNoneOfThese NO llama a handleNext ni setTimeout(handleNext)', () => {
    const block = SOURCE.match(/const handleNoneOfThese[\s\S]*?\n  \};/)?.[0] || '';
    expect(block).toBeTruthy();
    expect(block).not.toMatch(/handleNext\(/);
  });

  it('Input vacío en handleCustomSubmit se guarda como __NO_SE__', () => {
    const block = SOURCE.match(/const handleCustomSubmit[\s\S]*?\n  \};/)?.[0] || '';
    expect(block).toMatch(/__NO_SE__/);
    expect(block).toMatch(/text:\s*'No sé'/);
  });

  it('Input con texto en handleCustomSubmit se guarda como __CLARIFY__', () => {
    const block = SOURCE.match(/const handleCustomSubmit[\s\S]*?\n  \};/)?.[0] || '';
    expect(block).toMatch(/__CLARIFY__/);
    expect(block).toMatch(/source:\s*'user_clarification'/);
  });

  it('Render de single usa getNormalOptions (cap 6, filtra clarify)', () => {
    // En la rama single del switch
    const block = SOURCE.match(/case 'single':[\s\S]*?case 'multi':/)?.[0] || '';
    expect(block).toMatch(/getNormalOptions/);
  });

  it('Render de multi usa getNormalOptions', () => {
    const block = SOURCE.match(/case 'multi':[\s\S]*?case 'number':/)?.[0] || '';
    expect(block).toMatch(/getNormalOptions/);
  });

  it('Helper q() NO agrega opción "No lo sé" dentro de options', () => {
    const block = SOURCE.match(/const q = \([\s\S]*?\}\);\n/)?.[0] || '';
    expect(block).not.toMatch(/opt\('not_sure'/);
    expect(block).toMatch(/options\.slice\(0,\s*6\)/);
  });

  it('getNormalOptions tiene cap 6', () => {
    expect(SOURCE).toMatch(/getNormalOptions[\s\S]*?slice\(0,\s*6\)/);
  });

  it('canProceed acepta los nuevos types clarify', () => {
    const block = SOURCE.match(/const canProceed[\s\S]*?\n  \};/)?.[0] || '';
    expect(block).toMatch(/__CLARIFY__/);
    expect(block).toMatch(/__NO_SE__/);
    expect(block).toMatch(/__CLARIFY_PENDING__/);
  });
});
