// ============================================
// QUESTIONNAIRE COVERAGE AUDITOR
// Verifies all 180 questionnaires (10 sectors × 18 types)
// Checks: Quick (10-15) + Complete (68-75) questions
// ============================================

import { ALL_BUSINESS_TYPES, BusinessTypeData } from './allBusinessTypes';
import { getUniversalQuestionsForSetup, SECTOR_IDS } from './universalQuestionsEngine';
import { CountryCode } from './countryPacks';

// ============= TYPES =============

export interface QuestionnaireAuditResult {
  sectorId: string;
  sectorName: string;
  businessTypeId: string;
  businessTypeName: string;
  quickCount: number;
  completeCount: number;
  quickStatus: 'OK' | 'LOW' | 'HIGH' | 'PADDED';
  completeStatus: 'OK' | 'LOW' | 'HIGH' | 'PADDED';
  quickExpected: { min: number; max: number };
  completeExpected: { min: number; max: number };
  issues: string[];
}

export interface SectorAuditSummary {
  sectorId: string;
  sectorName: string;
  totalTypes: number;
  quickOk: number;
  quickPadded: number;
  quickLow: number;
  completeOk: number;
  completePadded: number;
  completeLow: number;
  coverage: number; // percentage
}

export interface FullAuditReport {
  timestamp: string;
  totalSectors: number;
  totalBusinessTypes: number;
  totalQuestionnaires: number; // 180 x 2 modes = 360
  globalCoverage: number;
  sectorSummaries: SectorAuditSummary[];
  detailedResults: QuestionnaireAuditResult[];
  criticalIssues: string[];
}

// ============= CONSTANTS =============

const QUICK_MIN = 10;
const QUICK_MAX = 15;
const COMPLETE_MIN = 68;
const COMPLETE_MAX = 75;

const SECTOR_NAMES: Record<string, string> = {
  'A1_GASTRO': 'Gastronomía y Bebidas',
  'A2_TURISMO': 'Turismo, Hotelería y Eventos',
  'A3_RETAIL': 'Retail y E-commerce',
  'A4_SALUD': 'Salud, Bienestar y Belleza',
  'A5_EDUCACION': 'Educación y Academias',
  'A6_B2B': 'Servicios Profesionales B2B',
  'A7_HOGAR_SERV': 'Hogar y Mantenimiento',
  'A8_CONSTRU_INMO': 'Construcción e Inmobiliario',
  'A9_LOGISTICA': 'Transporte y Logística',
  'A10_AGRO': 'Agro y Agroindustria',
};

// ============= AUDIT FUNCTIONS =============

function getQuestionStatus(
  count: number,
  min: number,
  max: number,
  isPadded: boolean
): 'OK' | 'LOW' | 'HIGH' | 'PADDED' {
  if (isPadded && count >= min) return 'PADDED';
  if (count < min) return 'LOW';
  if (count > max) return 'HIGH';
  return 'OK';
}

function auditSingleQuestionnaire(
  sectorId: string,
  businessType: BusinessTypeData,
  countryCode: CountryCode = 'AR'
): QuestionnaireAuditResult {
  const issues: string[] = [];

  // Get questions for quick mode
  const quickQuestions = getUniversalQuestionsForSetup(
    countryCode,
    sectorId,
    businessType.id,
    'quick',
    {}
  );

  // Get questions for complete mode
  const completeQuestions = getUniversalQuestionsForSetup(
    countryCode,
    sectorId,
    businessType.id,
    'complete',
    {}
  );

  const quickCount = quickQuestions.length;
  const completeCount = completeQuestions.length;

  // Check if questions are unique (not duplicated from universal base)
  const quickIds = new Set(quickQuestions.map(q => q.id));
  const completeIds = new Set(completeQuestions.map(q => q.id));

  // Check for universal base questions (indicates padding)
  const universalBaseIds = ['U01_YEARS', 'U02_TEAM_SIZE', 'U03_REVENUE', 'U04_GOAL', 'U05_CHALLENGE'];
  const quickHasUniversal = universalBaseIds.some(id => quickIds.has(id));
  const completeHasUniversal = universalBaseIds.some(id => completeIds.has(id));

  // Determine status
  const quickStatus = getQuestionStatus(quickCount, QUICK_MIN, QUICK_MAX, quickHasUniversal);
  const completeStatus = getQuestionStatus(completeCount, COMPLETE_MIN, COMPLETE_MAX, completeHasUniversal);

  // Generate issues
  if (quickStatus === 'LOW') {
    issues.push(`Quick mode: ${quickCount} questions (expected ${QUICK_MIN}-${QUICK_MAX})`);
  }
  if (quickStatus === 'PADDED') {
    issues.push(`Quick mode: PADDED with universal base questions`);
  }
  if (completeStatus === 'LOW') {
    issues.push(`Complete mode: ${completeCount} questions (expected ${COMPLETE_MIN}-${COMPLETE_MAX})`);
  }
  if (completeStatus === 'PADDED') {
    issues.push(`Complete mode: PADDED with universal base questions`);
  }

  // Check for sector-specific questions
  const sectorPrefixes: Record<string, string[]> = {
    'A1_GASTRO': ['G', 'GA', 'GB', 'GC', 'GD', 'GE'],
    'A2_TURISMO': ['T', 'TA', 'TB', 'TC'],
    'A3_RETAIL': ['R', 'Q_ALMACEN', 'Q_SUPER', 'Q_MODA'],
    'A4_SALUD': ['S', 'Q_CLINICA', 'Q_CONSULT', 'Q_GYM'],
    'A5_EDUCACION': ['E'],
    'A6_B2B': ['B'],
    'A7_HOGAR_SERV': ['H'],
    'A8_CONSTRU_INMO': ['C'],
    'A9_LOGISTICA': ['L'],
    'A10_AGRO': ['AG'],
  };

  const expectedPrefixes = sectorPrefixes[sectorId] || [];
  const hasSectorSpecific = completeQuestions.some(q =>
    expectedPrefixes.some(prefix => q.id.startsWith(prefix))
  );

  if (!hasSectorSpecific && expectedPrefixes.length > 0) {
    issues.push(`Missing sector-specific questions (expected prefixes: ${expectedPrefixes.join(', ')})`);
  }

  return {
    sectorId,
    sectorName: SECTOR_NAMES[sectorId] || sectorId,
    businessTypeId: businessType.id,
    businessTypeName: businessType.labels.es,
    quickCount,
    completeCount,
    quickStatus,
    completeStatus,
    quickExpected: { min: QUICK_MIN, max: QUICK_MAX },
    completeExpected: { min: COMPLETE_MIN, max: COMPLETE_MAX },
    issues,
  };
}

function auditSector(sectorId: string, countryCode: CountryCode = 'AR'): SectorAuditSummary {
  const businessTypes = ALL_BUSINESS_TYPES[sectorId] || [];

  let quickOk = 0;
  let quickPadded = 0;
  let quickLow = 0;
  let completeOk = 0;
  let completePadded = 0;
  let completeLow = 0;

  for (const businessType of businessTypes) {
    const result = auditSingleQuestionnaire(sectorId, businessType, countryCode);

    switch (result.quickStatus) {
      case 'OK': quickOk++; break;
      case 'PADDED': quickPadded++; break;
      case 'LOW': quickLow++; break;
    }

    switch (result.completeStatus) {
      case 'OK': completeOk++; break;
      case 'PADDED': completePadded++; break;
      case 'LOW': completeLow++; break;
    }
  }

  const totalTypes = businessTypes.length;
  const coverage = totalTypes > 0
    ? Math.round(((quickOk + completeOk) / (totalTypes * 2)) * 100)
    : 0;

  return {
    sectorId,
    sectorName: SECTOR_NAMES[sectorId] || sectorId,
    totalTypes,
    quickOk,
    quickPadded,
    quickLow,
    completeOk,
    completePadded,
    completeLow,
    coverage,
  };
}

// ============= MAIN AUDIT FUNCTION =============

export function runFullQuestionnaireAudit(countryCode: CountryCode = 'AR'): FullAuditReport {
  const sectorIds = Object.keys(ALL_BUSINESS_TYPES);
  const sectorSummaries: SectorAuditSummary[] = [];
  const detailedResults: QuestionnaireAuditResult[] = [];
  const criticalIssues: string[] = [];

  let totalBusinessTypes = 0;

  for (const sectorId of sectorIds) {
    const businessTypes = ALL_BUSINESS_TYPES[sectorId] || [];
    totalBusinessTypes += businessTypes.length;

    // Sector summary
    const sectorSummary = auditSector(sectorId, countryCode);
    sectorSummaries.push(sectorSummary);

    // Detailed results for each business type
    for (const businessType of businessTypes) {
      const result = auditSingleQuestionnaire(sectorId, businessType, countryCode);
      detailedResults.push(result);

      // Track critical issues
      if (result.completeStatus === 'LOW' || result.completeStatus === 'PADDED') {
        criticalIssues.push(
          `[${sectorSummary.sectorName}] ${businessType.labels.es}: Complete mode has ${result.completeCount} questions (needs ${COMPLETE_MIN}-${COMPLETE_MAX})`
        );
      }
    }
  }

  // Calculate global coverage
  const totalOk = sectorSummaries.reduce((sum, s) => sum + s.quickOk + s.completeOk, 0);
  const totalQuestionnaires = totalBusinessTypes * 2;
  const globalCoverage = totalQuestionnaires > 0
    ? Math.round((totalOk / totalQuestionnaires) * 100)
    : 0;

  return {
    timestamp: new Date().toISOString(),
    totalSectors: sectorIds.length,
    totalBusinessTypes,
    totalQuestionnaires,
    globalCoverage,
    sectorSummaries,
    detailedResults,
    criticalIssues,
  };
}

// ============= CONSOLE REPORTER =============

export function printAuditReportToConsole(countryCode: CountryCode = 'AR'): void {
  const report = runFullQuestionnaireAudit(countryCode);

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║          QUESTIONNAIRE COVERAGE AUDIT REPORT                     ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Timestamp: ${report.timestamp.slice(0, 19).replace('T', ' ')}                          ║`);
  console.log(`║  Country: ${countryCode}                                                     ║`);
  console.log(`║  Total Sectors: ${report.totalSectors}                                              ║`);
  console.log(`║  Total Business Types: ${report.totalBusinessTypes}                                        ║`);
  console.log(`║  Total Questionnaires: ${report.totalQuestionnaires} (${report.totalBusinessTypes} × 2 modes)                      ║`);
  console.log(`║  GLOBAL COVERAGE: ${report.globalCoverage}%                                          ║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Sector summaries table
  console.log('┌─────────────────────────────────────────────────────────────────────┐');
  console.log('│                    SECTOR COVERAGE SUMMARY                          │');
  console.log('├────────────────────────────────┬────────┬────────┬────────┬─────────┤');
  console.log('│ Sector                         │ Types  │ Quick  │Complete│Coverage │');
  console.log('├────────────────────────────────┼────────┼────────┼────────┼─────────┤');

  for (const sector of report.sectorSummaries) {
    const sectorName = sector.sectorName.slice(0, 30).padEnd(30);
    const types = String(sector.totalTypes).padStart(3);
    const quickStr = `${sector.quickOk}/${sector.totalTypes}`.padStart(6);
    const completeStr = `${sector.completeOk}/${sector.totalTypes}`.padStart(6);
    const coverageStr = `${sector.coverage}%`.padStart(6);

    const quickIcon = sector.quickOk === sector.totalTypes ? '✅' : sector.quickOk > 0 ? '⚠️' : '❌';
    const completeIcon = sector.completeOk === sector.totalTypes ? '✅' : sector.completeOk > 0 ? '⚠️' : '❌';

    console.log(`│ ${sectorName} │  ${types}   │${quickStr}${quickIcon}│${completeStr}${completeIcon}│ ${coverageStr}  │`);
  }

  console.log('└────────────────────────────────┴────────┴────────┴────────┴─────────┘');
  console.log('\n');

  // Detailed issues
  if (report.criticalIssues.length > 0) {
    console.log('┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│                    CRITICAL ISSUES TO FIX                           │');
    console.log('├─────────────────────────────────────────────────────────────────────┤');

    for (const issue of report.criticalIssues.slice(0, 30)) {
      console.log(`│ ⚠️  ${issue.slice(0, 65).padEnd(65)} │`);
    }

    if (report.criticalIssues.length > 30) {
      console.log(`│ ... and ${report.criticalIssues.length - 30} more issues                                          │`);
    }

    console.log('└─────────────────────────────────────────────────────────────────────┘');
  } else {
    console.log('✅ ALL QUESTIONNAIRES PASS COVERAGE REQUIREMENTS!');
  }

  console.log('\n');

  // Status legend
  console.log('Legend:');
  console.log('  ✅ OK: Questions within expected range (Quick: 10-15, Complete: 68-75)');
  console.log('  ⚠️  PADDED: Missing questions filled with universal base questions');
  console.log('  ❌ LOW: Insufficient questions even after padding');
  console.log('\n');
}

// ============= EXPORT FOR COMPONENT USE =============

export function getAuditReportForUI(countryCode: CountryCode = 'AR'): FullAuditReport {
  return runFullQuestionnaireAudit(countryCode);
}

// ============= AUTO-RUN IN DEV =============

// Uncomment to run automatically when file is imported:
// if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
//   printAuditReportToConsole();
// }
