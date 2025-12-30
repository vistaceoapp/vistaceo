import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { HEALTH_SUB_SCORES } from '@/lib/dashboardCards';
import { calculatePrecisionScore, getTotalQuestionsForBusiness, type SetupMode } from '@/lib/gastroQuestionsComplete';

interface DashboardData {
  // Available data keys for card state calculation
  availableData: string[];

  // Health sub-scores
  subScores: Record<string, number | null>;

  // Previous health score for trend
  previousScore: number | null;

  // Card values (real data)
  cardValues: Record<
    string,
    {
      value: string | number;
      trend?: 'up' | 'down' | 'stable';
      trendValue?: number;
    }
  >;

  // Setup completion
  setupCompleted: boolean;
  precisionScore: number;

  // Real precision based on answered questions
  realPrecision: {
    answered: number;
    total: number;
    percentage: number;
    level: 'Básica' | 'Media' | 'Alta';
  };

  // Gastro data for precision calculation
  gastroData: Record<string, any>;
}

const toNumberOrNull = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return null;
};

export const useDashboardData = () => {
  const { currentBusiness } = useBusiness();
  const [data, setData] = useState<DashboardData>({
    availableData: [],
    subScores: {},
    previousScore: null,
    cardValues: {},
    setupCompleted: false,
    precisionScore: 0,
    realPrecision: {
      answered: 0,
      total: 0,
      percentage: 0,
      level: 'Básica',
    },
    gastroData: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBusiness?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch setup progress, brain, and business data in parallel
        const [setupRes, brainRes, menuRes, competitorsRes, snapshotRes] = await Promise.all([
          supabase
            .from('business_setup_progress')
            .select('*')
            .eq('business_id', currentBusiness.id)
            .maybeSingle(),
          supabase
            .from('business_brains')
            .select('*')
            .eq('business_id', currentBusiness.id)
            .maybeSingle(),
          supabase
            .from('business_menu_items')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', currentBusiness.id),
          supabase
            .from('business_competitors')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', currentBusiness.id),
          supabase
            .from('snapshots')
            .select('total_score, dimensions_json')
            .eq('business_id', currentBusiness.id)
            .order('created_at', { ascending: false })
            .limit(2),
        ]);

        // Determine available data
        const available: string[] = [];

        // From business (using type assertions for Json fields)
        if (currentBusiness.avg_rating) available.push('googleListing');
        if (currentBusiness.channel_mix) available.push('channelMix');
        if (currentBusiness.monthly_revenue_range) available.push('sales');
        if (currentBusiness.food_cost_range) available.push('costs');
        if (currentBusiness.active_dayparts?.length) available.push('dayparts');
        if (currentBusiness.avg_ticket_range) available.push('avgTicket');
        if (currentBusiness.service_model) available.push('capacity', 'times');

        // From related tables
        if ((menuRes.count || 0) >= 8) available.push('menu');
        if ((competitorsRes.count || 0) >= 3) available.push('competitors');

        // From setup
        const setupData = (setupRes.data?.setup_data as Record<string, unknown>) || {};
        const gastroData = (setupData.gastroData as Record<string, any>) || {};
        if (setupData.avgPrepTimeMinutes) available.push('prepTime');
        if (setupData.appCommissionPercent) available.push('appFees');

        // Calculate REAL precision based on answered gastro questions
        const setupMode: SetupMode = setupData.mode === 'complete' ? 'full' : 'quick';
        const isProSetup = setupMode === 'full';

        // Combine all data sources for precision calculation
        const allAnsweredData: Record<string, any> = {
          ...gastroData,
          // Add basic setup fields as answered
          'business.channels': setupData.channelMix ? ['salon', 'delivery', 'takeaway'] : [],
          'business.primary_type_id': setupData.businessTypeId || '',
          'setup.mode': setupMode,
        };

        // If there are dayparts, they count as answered
        if (setupData.activeDayparts && (setupData.activeDayparts as string[]).length > 0) {
          allAnsweredData['operations.dayparts'] = setupData.activeDayparts;
        }
        if (setupData.topSellers && (setupData.topSellers as string[]).length > 0) {
          allAnsweredData['menu.top_sellers'] = setupData.topSellers;
        }
        if (setupData.ticketRange) {
          allAnsweredData['operations.avg_ticket'] = setupData.ticketRange;
        }
        if (setupData.currentFocus) {
          allAnsweredData['strategy.current_focus'] = setupData.currentFocus;
        }
        if (setupData.positioning) {
          allAnsweredData['identity.positioning'] = setupData.positioning;
        }
        if (setupData.serviceModel) {
          allAnsweredData['operations.service_model'] = setupData.serviceModel;
        }

        // Get applicable questions for this business
        const totalQuestions = getTotalQuestionsForBusiness(allAnsweredData, setupMode);

        // Count answered questions
        let answeredCount = 0;

        // Count from gastroData
        Object.keys(gastroData).forEach((key) => {
          const val = gastroData[key];
          if (
            val !== undefined &&
            val !== null &&
            val !== '' &&
            !(Array.isArray(val) && val.length === 0)
          ) {
            answeredCount++;
          }
        });

        // Also count basic setup questions that are answered
        const basicSetupFields = [
          'activeDayparts',
          'topSellers',
          'ticketRange',
          'currentFocus',
          'positioning',
          'serviceModel',
          'channelMix',
        ];
        basicSetupFields.forEach((field) => {
          const val = setupData[field];
          if (
            val !== undefined &&
            val !== null &&
            val !== '' &&
            !(Array.isArray(val) && val.length === 0) &&
            !(typeof val === 'object' && Object.keys(val).length === 0)
          ) {
            answeredCount++;
          }
        });

        // Calculate percentage with ranges that match setup step:
        // Quick setup: 5-25% range
        // Complete setup: 25-65% range
        const effectiveTotal = Math.max(totalQuestions, 20); // At least 20 questions expected
        let rawPercentage = calculatePrecisionScore(answeredCount, effectiveTotal);
        
        // Apply ranges based on setup type (matching SetupStepMode.tsx)
        let precisionPercentage: number;
        if (setupRes.data?.completed_at) {
          // User completed setup
          if (isProSetup) {
            // Complete setup: 25-65% range, scales based on answers
            precisionPercentage = Math.max(25, Math.min(65, 25 + rawPercentage * 0.40));
          } else {
            // Quick setup: 5-25% range, scales based on answers
            precisionPercentage = Math.max(5, Math.min(25, 5 + rawPercentage * 0.20));
          }
        } else {
          // No setup completed yet - very low precision
          precisionPercentage = Math.max(3, rawPercentage * 0.15);
        }
        
        precisionPercentage = Math.round(precisionPercentage);

        // Determine precision level
        let precisionLevel: 'Básica' | 'Media' | 'Alta' = 'Básica';
        if (precisionPercentage >= 70) precisionLevel = 'Alta';
        else if (precisionPercentage >= 40) precisionLevel = 'Media';

        // Prefer REAL sub-scores coming from the latest snapshot (setup baseline / last checkin)
        const snapshots = snapshotRes.data || [];
        const latestDims = (snapshots[0]?.dimensions_json as Record<string, unknown> | null) || null;

        const subScores: Record<string, number | null> = {};
        if (latestDims) {
          // Match new 7-dimension system from HEALTH_SUB_SCORES
          // Try new canonical dimensions first, then legacy mappings
          subScores.reputation = toNumberOrNull(latestDims.reputation ?? latestDims.market_fit);
          subScores.profitability = toNumberOrNull(latestDims.profitability ?? latestDims.pricing_position);
          subScores.finances = toNumberOrNull(latestDims.finances ?? latestDims.unit_economics);
          subScores.efficiency = toNumberOrNull(latestDims.efficiency ?? latestDims.operational_flow);
          subScores.traffic = toNumberOrNull(latestDims.traffic ?? latestDims.demand_rhythm);
          subScores.team = toNumberOrNull(latestDims.team);
          subScores.growth = toNumberOrNull(latestDims.growth);
          
          // If dimensions are still null, check if this is old-format snapshot with metadata fields
          // Skip metadata-only fields that were mistakenly used as dimensions
          const metadataFields = ['data_quality', 'setup_mode', 'google_connected', 'questions_answered', 'integrations_profiled', '_meta'];
          const hasRealDimensions = Object.keys(latestDims).some(
            key => !metadataFields.includes(key) && typeof latestDims[key] === 'number'
          );
          
          // If no real dimensions exist, this snapshot was created with old format - ignore it
          if (!hasRealDimensions) {
            Object.keys(subScores).forEach(key => {
              subScores[key] = null;
            });
          }
        }

        // Fallback heuristic if snapshot dims are missing
        if (Object.keys(subScores).length === 0 || HEALTH_SUB_SCORES.some((s) => subScores[s.id] == null)) {
          // Reputation: based on rating
          if (subScores.reputation == null) {
            subScores.reputation = currentBusiness.avg_rating
              ? Math.round((currentBusiness.avg_rating / 5) * 100)
              : null;
          }

          // Profitability: based on menu and competitors
          if (subScores.profitability == null) {
            if (available.includes('menu') && available.includes('competitors')) subScores.profitability = 55;
            else if (available.includes('menu')) subScores.profitability = 45;
            else subScores.profitability = null;
          }

          // Finances: based on sales and costs
          if (subScores.finances == null) {
            if (available.includes('sales') && available.includes('costs')) subScores.finances = 55;
            else if (available.includes('sales')) subScores.finances = 45;
            else subScores.finances = null;
          }

          // Efficiency: based on capacity and prep time
          if (subScores.efficiency == null) {
            if (available.includes('capacity') && available.includes('prepTime')) subScores.efficiency = 55;
            else subScores.efficiency = null;
          }

          // Traffic: based on dayparts and channels
          if (subScores.traffic == null) {
            if (available.includes('dayparts') && available.includes('channelMix')) subScores.traffic = 55;
            else if (available.includes('dayparts')) subScores.traffic = 45;
            else subScores.traffic = null;
          }

          // Team: default to 50 if basic setup is done
          if (subScores.team == null) {
            subScores.team = setupRes.data?.completed_at ? 50 : null;
          }

          // Growth: default based on setup completion
          if (subScores.growth == null) {
            subScores.growth = currentBusiness.setup_completed ? 50 : null;
          }
        }

        // Get previous score for trend
        const previousScore = snapshots.length > 1 ? toNumberOrNull(snapshots[1]?.total_score) : null;

        // Calculate card values based on real data
        const cardValues: DashboardData['cardValues'] = {};

        if (currentBusiness.avg_rating) {
          cardValues.market_position = {
            value: `${currentBusiness.avg_rating}★`,
            trend: currentBusiness.avg_rating >= 4.2 ? 'up' : 'stable',
          };
        }

        if (currentBusiness.monthly_revenue_range) {
          const range = currentBusiness.monthly_revenue_range as { min?: number; max?: number } | null;
          if (range && typeof range === 'object' && 'min' in range && 'max' in range) {
            const avg = Math.round(((range.min || 0) + (range.max || 0)) / 2);
            cardValues.ticket_vs_target = {
              value: avg > 0 ? `$${Math.round(avg / 1000)}K` : '—',
            };
          }
        }

        if (currentBusiness.channel_mix) {
          const mix = currentBusiness.channel_mix as Record<string, number> | null;
          if (mix && typeof mix === 'object') {
            const deliveryPct = mix.delivery || 0;
            cardValues.commission_impact = {
              value: `${deliveryPct}%`,
              trend: deliveryPct > 40 ? 'down' : 'up',
            };
          }
        }

        setData({
          availableData: available,
          subScores,
          previousScore,
          cardValues,
          setupCompleted: currentBusiness.setup_completed || false,
          precisionScore: currentBusiness.precision_score || 0,
          realPrecision: {
            answered: answeredCount,
            total: effectiveTotal,
            percentage: precisionPercentage,
            level: precisionLevel,
          },
          gastroData,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentBusiness]);

  return { data, loading };
};

