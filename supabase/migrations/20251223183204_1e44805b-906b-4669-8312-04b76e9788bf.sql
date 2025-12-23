-- =====================================================
-- UCEO Platform Database Schema
-- =====================================================

-- Create enum types
CREATE TYPE public.business_category AS ENUM (
  'cafeteria',
  'bar',
  'restaurant',
  'fast_casual',
  'heladeria',
  'panaderia',
  'dark_kitchen'
);

CREATE TYPE public.country_code AS ENUM (
  'AR', 'MX', 'CL', 'UY', 'BR', 'CO', 'CR', 'PA', 'US'
);

CREATE TYPE public.action_status AS ENUM (
  'pending',
  'completed',
  'skipped',
  'snoozed'
);

CREATE TYPE public.mission_status AS ENUM (
  'active',
  'completed',
  'paused',
  'abandoned'
);

CREATE TYPE public.priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE public.user_mode AS ENUM (
  'nano',
  'standard',
  'proactive',
  'sos'
);

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'es',
  user_mode user_mode DEFAULT 'standard',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category business_category DEFAULT 'restaurant',
  country country_code DEFAULT 'AR',
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  currency TEXT DEFAULT 'ARS',
  address TEXT,
  phone TEXT,
  instagram_handle TEXT,
  google_place_id TEXT,
  avg_ticket DECIMAL(10,2),
  avg_rating DECIMAL(2,1),
  service_slots JSONB DEFAULT '["breakfast", "lunch", "dinner"]',
  integrations JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = owner_id);

-- =====================================================
-- DAILY ACTIONS TABLE
-- =====================================================
CREATE TABLE public.daily_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority priority_level DEFAULT 'medium',
  category TEXT,
  signals JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  status action_status DEFAULT 'pending',
  outcome TEXT,
  outcome_rating INTEGER CHECK (outcome_rating >= 1 AND outcome_rating <= 5),
  scheduled_for DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view actions of own businesses" ON public.daily_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = daily_actions.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage actions of own businesses" ON public.daily_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = daily_actions.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- =====================================================
-- WEEKLY PRIORITIES TABLE
-- =====================================================
CREATE TABLE public.weekly_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric_name TEXT,
  metric_target TEXT,
  checklist JSONB DEFAULT '[]',
  status mission_status DEFAULT 'active',
  week_start DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.weekly_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage weekly priorities of own businesses" ON public.weekly_priorities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = weekly_priorities.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- =====================================================
-- MISSIONS TABLE
-- =====================================================
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT,
  steps JSONB DEFAULT '[]',
  current_step INTEGER DEFAULT 0,
  status mission_status DEFAULT 'active',
  impact_score INTEGER DEFAULT 5,
  effort_score INTEGER DEFAULT 5,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage missions of own businesses" ON public.missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = missions.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- =====================================================
-- OPPORTUNITIES (RADAR) TABLE
-- =====================================================
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  evidence JSONB DEFAULT '[]',
  impact_score INTEGER DEFAULT 5,
  effort_score INTEGER DEFAULT 5,
  is_converted BOOLEAN DEFAULT FALSE,
  converted_to_mission_id UUID REFERENCES public.missions(id),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage opportunities of own businesses" ON public.opportunities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = opportunities.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- =====================================================
-- CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage chat of own businesses" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = chat_messages.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- =====================================================
-- CHECK-INS TABLE
-- =====================================================
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  slot TEXT,
  traffic_level INTEGER CHECK (traffic_level >= 1 AND traffic_level <= 5),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage checkins of own businesses" ON public.checkins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = checkins.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();