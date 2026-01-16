// Questionnaire Audit Debug Component
// Shows questionnaire coverage in development mode

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  runFullQuestionnaireAudit, 
  FullAuditReport, 
  SectorAuditSummary,
  QuestionnaireAuditResult 
} from '@/lib/questionnaireAudit';

interface QuestionnaireAuditPanelProps {
  onClose?: () => void;
}

export function QuestionnaireAuditPanel({ onClose }: QuestionnaireAuditPanelProps) {
  const [report, setReport] = useState<FullAuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const runAudit = () => {
    setLoading(true);
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const auditReport = runFullQuestionnaireAudit('AR');
      setReport(auditReport);
      setLoading(false);

      // Also print to console
      console.log('📊 Questionnaire Audit Report:', auditReport);
    }, 100);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getStatusIcon = (status: 'OK' | 'LOW' | 'HIGH' | 'PADDED') => {
    switch (status) {
      case 'OK':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'PADDED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'LOW':
      case 'HIGH':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'OK' | 'LOW' | 'HIGH' | 'PADDED') => {
    switch (status) {
      case 'OK':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">OK</Badge>;
      case 'PADDED':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">PADDED</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">LOW</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">HIGH</Badge>;
    }
  };

  const getSectorCoverage = (sector: SectorAuditSummary) => {
    const total = sector.totalTypes * 2;
    const ok = sector.quickOk + sector.completeOk;
    return Math.round((ok / total) * 100);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Running questionnaire audit...</p>
          <p className="text-sm text-muted-foreground mt-2">Checking 180 questionnaires × 2 modes = 360 total</p>
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  const getSectorDetails = (sectorId: string): QuestionnaireAuditResult[] => {
    return report.detailedResults.filter(r => r.sectorId === sectorId);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Questionnaire Coverage Audit
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {report.timestamp.slice(0, 19).replace('T', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={runAudit}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-run
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Global Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{report.totalSectors}</div>
            <div className="text-sm text-muted-foreground">Sectors</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{report.totalBusinessTypes}</div>
            <div className="text-sm text-muted-foreground">Business Types</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{report.totalQuestionnaires}</div>
            <div className="text-sm text-muted-foreground">Questionnaires</div>
          </div>
          <div className={cn(
            "rounded-lg p-4 text-center",
            report.globalCoverage >= 80 ? "bg-green-500/10" :
            report.globalCoverage >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"
          )}>
            <div className={cn(
              "text-3xl font-bold",
              report.globalCoverage >= 80 ? "text-green-600" :
              report.globalCoverage >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {report.globalCoverage}%
            </div>
            <div className="text-sm text-muted-foreground">Coverage</div>
          </div>
        </div>

        {/* Sector List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {report.sectorSummaries.map((sector) => {
              const isExpanded = expandedSector === sector.sectorId;
              const coverage = getSectorCoverage(sector);
              const details = getSectorDetails(sector.sectorId);

              return (
                <div key={sector.sectorId} className="border rounded-lg overflow-hidden">
                  {/* Sector Header */}
                  <button
                    onClick={() => setExpandedSector(isExpanded ? null : sector.sectorId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        coverage >= 80 ? "bg-green-500" :
                        coverage >= 50 ? "bg-yellow-500" : "bg-red-500"
                      )} />
                      <span className="font-medium">{sector.sectorName}</span>
                      <Badge variant="secondary">{sector.totalTypes} types</Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Quick:</span>
                        <span className={cn(
                          sector.quickOk === sector.totalTypes ? "text-green-600" : "text-yellow-600"
                        )}>
                          {sector.quickOk}/{sector.totalTypes}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Complete:</span>
                        <span className={cn(
                          sector.completeOk === sector.totalTypes ? "text-green-600" : "text-yellow-600"
                        )}>
                          {sector.completeOk}/{sector.totalTypes}
                        </span>
                      </div>
                      <div className="w-20">
                        <Progress value={coverage} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{coverage}%</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-4">
                      <div className="grid gap-2">
                        {details.map((item) => (
                          <div
                            key={item.businessTypeId}
                            className="flex items-center justify-between py-2 px-3 bg-background rounded-md"
                          >
                            <span className="text-sm">{item.businessTypeName}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Quick:</span>
                                <span className="text-sm font-medium">{item.quickCount}</span>
                                {getStatusIcon(item.quickStatus)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Complete:</span>
                                <span className="text-sm font-medium">{item.completeCount}</span>
                                {getStatusIcon(item.completeStatus)}
                              </div>
                              {item.issues.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {item.issues.length} issues
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Critical Issues */}
        {report.criticalIssues.length > 0 && (
          <div className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
            <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical Issues ({report.criticalIssues.length})
            </h4>
            <ScrollArea className="h-32">
              <ul className="text-sm space-y-1">
                {report.criticalIssues.slice(0, 20).map((issue, idx) => (
                  <li key={idx} className="text-muted-foreground">• {issue}</li>
                ))}
                {report.criticalIssues.length > 20 && (
                  <li className="text-muted-foreground font-medium">
                    ... and {report.criticalIssues.length - 20} more
                  </li>
                )}
              </ul>
            </ScrollArea>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>OK (within range)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>Padded (using universal base)</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Needs work</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
