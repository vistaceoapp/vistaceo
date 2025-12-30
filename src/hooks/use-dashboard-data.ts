import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { HEALTH_SUB_SCORES } from '@/lib/dashboardCards';

interface DashboardData {
  // Available data keys for card state calculation
  availableData: string[];

  // Health sub-scores (from AI analysis)
  subScores: Record<string, number | null>;

  // Total score from snapshot (calculated by AI - authoritative)
  snapshotScore: number | null;

  // Certainty percentage from AI analysis or calculated from data completeness
  certaintyPct: number;

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

  // Data completeness for certainty calculation
  dataCompleteness: {
    hasGoogle: boolean;
    hasBrain: boolean;
    integrationsCount: number;
    signalsCount: number;
    answersCount: number;
    percentage: number;
  };

  // Gastro data for reference
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

// Calculate data completeness percentage based on available data sources
function calculateDataCompleteness(params: {
  hasGoogle: boolean;
  hasBrain: boolean;
  integrationsCount: number;
  signalsCount: number;
  answersCount: number;
  setupCompleted: boolean;
}): number {
  let completeness = 0;
  const weights = {
    setupBasic: 15,      // Business type, country
    setupAnswers: 25,    // Questionnaire responses
    google: 20,          // Google Business connected
    brain: 15,           // Brain memory populated
    integrations: 15,    // Active integrations
    signals: 10,         // Processed signals
  };

  // Setup basic completed
  if (params.setupCompleted) completeness += weights.setupBasic;

  // Setup answers
  const answersScore = Math.min(1, params.answersCount / 15); // Max contribution at 15+ answers
  completeness += weights.setupAnswers * answersScore;

  // Google connected
  if (params.hasGoogle) completeness += weights.google;

  // Brain data
  if (params.hasBrain) completeness += weights.brain;

  // Integrations
  const integrationsScore = Math.min(1, params.integrationsCount / 3); // Max at 3 integrations
  completeness += weights.integrations * integrationsScore;

  // Signals
  const signalsScore = Math.min(1, params.signalsCount / 20); // Max at 20 signals
  completeness += weights.signals * signalsScore;

  return Math.round(Math.min(100, completeness));
}

export const useDashboardData = () => {
  const { currentBusiness } = useBusiness();
  const [data, setData] = useState<DashboardData>({
    availableData: [],
    subScores: {},
    snapshotScore: null,
    certaintyPct: 0,
    previousScore: null,
    cardValues: {},
    setupCompleted: false,
    precisionScore: 0,
    dataCompleteness: {
      hasGoogle: false,
      hasBrain: false,
      integrationsCount: 0,
      signalsCount: 0,
      answersCount: 0,
      percentage: 0,
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
        // Fetch setup progress, brain, integrations, signals and snapshots in parallel
        const [setupRes, brainRes, menuRes, competitorsRes, snapshotRes, integrationsRes, signalsRes] = await Promise.all([
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
          supabase
            .from('business_integrations')
            .select('*')
            .eq('business_id', currentBusiness.id)
            .eq('status', 'active'),
          supabase
            .from('signals')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', currentBusiness.id),
        ]);

        // Determine available data
        const available: string[] = [];

        // From business
        const hasGoogle = !!currentBusiness.google_place_id || !!currentBusiness.avg_rating;
        if (hasGoogle) available.push('googleListing');
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

        // Count answered questions from gastroData
        let answersCount = 0;
        Object.keys(gastroData).forEach((key) => {
          const val = gastroData[key];
          if (
            val !== undefined &&
            val !== null &&
            val !== '' &&
            !(Array.isArray(val) && val.length === 0)
          ) {
            answersCount++;
          }
        });

        // Also count basic setup questions
        const basicSetupFields = ['activeDayparts', 'topSellers', 'ticketRange', 'currentFocus', 'positioning', 'serviceModel', 'channelMix'];
        basicSetupFields.forEach((field) => {
          const val = setupData[field];
          if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
            answersCount++;
          }
        });

        // Brain and integrations data
        const hasBrain = !!brainRes.data?.id && (brainRes.data.total_signals || 0) > 0;
        const integrationsCount = integrationsRes.data?.length || 0;
        const signalsCount = signalsRes.count || 0;

        // Calculate data completeness
        const dataCompletenessResult = {
          hasGoogle,
          hasBrain,
          integrationsCount,
          signalsCount,
          answersCount,
          percentage: calculateDataCompleteness({
            hasGoogle,
            hasBrain,
            integrationsCount,
            signalsCount,
            answersCount,
            setupCompleted: !!setupRes.data?.completed_at,
          }),
        };

        // Get sub-scores from latest snapshot
        const snapshots = snapshotRes.data || [];
        const latestDims = (snapshots[0]?.dimensions_json as Record<string, unknown> | null) || null;

        const subScores: Record<string, number | null> = {};
        
        if (latestDims) {
          // Extract certainty from snapshot meta if available
          const meta = latestDims._meta as Record<string, unknown> | undefined;
          const snapshotCertainty = toNumberOrNull(meta?.certainty_pct);
          
          // Map dimension keys
          subScores.reputation = toNumberOrNull(latestDims.reputation ?? latestDims.market_fit);
          subScores.profitability = toNumberOrNull(latestDims.profitability ?? latestDims.pricing_position);
          subScores.finances = toNumberOrNull(latestDims.finances ?? latestDims.unit_economics);
          subScores.efficiency = toNumberOrNull(latestDims.efficiency ?? latestDims.operational_flow);
          subScores.traffic = toNumberOrNull(latestDims.traffic ?? latestDims.demand_rhythm);
          subScores.team = toNumberOrNull(latestDims.team);
          subScores.growth = toNumberOrNull(latestDims.growth);
          
          // Skip metadata-only snapshots
          const metadataFields = ['data_quality', 'setup_mode', 'google_connected', 'questions_answered', 'integrations_profiled', '_meta'];
          const hasRealDimensions = Object.keys(latestDims).some(
            key => !metadataFields.includes(key) && typeof latestDims[key] === 'number'
          );
          
          if (!hasRealDimensions) {
            Object.keys(subScores).forEach(key => {
              subScores[key] = null;
            });
          }
          
          // Use snapshot certainty if available, otherwise use calculated
          if (snapshotCertainty !== null) {
            dataCompletenessResult.percentage = snapshotCertainty;
          }
        }

        // Initialize any missing sub-scores to null (will show "Sin datos")
        HEALTH_SUB_SCORES.forEach(sub => {
          if (subScores[sub.id] === undefined) {
            subScores[sub.id] = null;
          }
        });

        // Get snapshot score and previous score for trend
        const snapshotScore = snapshots.length > 0 ? toNumberOrNull(snapshots[0]?.total_score) : null;
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
          snapshotScore,
          certaintyPct: dataCompletenessResult.percentage,
          previousScore,
          cardValues,
          setupCompleted: currentBusiness.setup_completed || false,
          precisionScore: currentBusiness.precision_score || 0,
          dataCompleteness: dataCompletenessResult,
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
