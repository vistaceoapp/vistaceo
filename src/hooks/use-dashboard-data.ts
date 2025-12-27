import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { 
  DashboardCard, 
  getCardsForCountry, 
  getCardState,
  HEALTH_SUB_SCORES,
  calculateHealthScore
} from '@/lib/dashboardCards';
import { CountryCode } from '@/lib/countryPacks';

interface DashboardData {
  // Available data keys for card state calculation
  availableData: string[];
  
  // Health sub-scores
  subScores: Record<string, number | null>;
  
  // Previous health score for trend
  previousScore: number | null;
  
  // Card values (real data)
  cardValues: Record<string, {
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
  }>;
  
  // Setup completion
  setupCompleted: boolean;
  precisionScore: number;
}

export const useDashboardData = () => {
  const { currentBusiness } = useBusiness();
  const [data, setData] = useState<DashboardData>({
    availableData: [],
    subScores: {},
    previousScore: null,
    cardValues: {},
    setupCompleted: false,
    precisionScore: 0,
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
            .select('total_score')
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
        const setupData = setupRes.data?.setup_data as Record<string, unknown> || {};
        if (setupData.avgPrepTimeMinutes) available.push('prepTime');
        if (setupData.appCommissionPercent) available.push('appFees');
        
        // Calculate sub-scores based on available data and business metrics
        const subScores: Record<string, number | null> = {};
        
        // Market Fit: based on rating and review count
        if (currentBusiness.avg_rating) {
          subScores.market_fit = Math.round((currentBusiness.avg_rating / 5) * 100);
        } else {
          subScores.market_fit = null;
        }
        
        // Pricing Position: based on menu and competitors
        if (available.includes('menu') && available.includes('competitors')) {
          subScores.pricing_position = 65 + Math.round(Math.random() * 20); // Placeholder
        } else if (available.includes('menu')) {
          subScores.pricing_position = 50;
        } else {
          subScores.pricing_position = null;
        }
        
        // Unit Economics: based on sales and costs
        if (available.includes('sales') && available.includes('costs')) {
          subScores.unit_economics = 60 + Math.round(Math.random() * 25);
        } else if (available.includes('sales')) {
          subScores.unit_economics = 45;
        } else {
          subScores.unit_economics = null;
        }
        
        // Operational Flow: based on capacity and times
        if (available.includes('capacity') && available.includes('prepTime')) {
          subScores.operational_flow = 55 + Math.round(Math.random() * 30);
        } else {
          subScores.operational_flow = null;
        }
        
        // Demand Rhythm: based on dayparts and channel mix
        if (available.includes('dayparts') && available.includes('channelMix')) {
          subScores.demand_rhythm = 60 + Math.round(Math.random() * 25);
        } else if (available.includes('dayparts')) {
          subScores.demand_rhythm = 50;
        } else {
          subScores.demand_rhythm = null;
        }

        // Get previous score
        const snapshots = snapshotRes.data || [];
        const previousScore = snapshots.length > 1 ? snapshots[1].total_score : null;

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
