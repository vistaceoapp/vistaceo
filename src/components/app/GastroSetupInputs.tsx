import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Plus, 
  X, 
  DollarSign,
  Clock,
  MapPin,
  Store,
  Truck,
  Users,
  Calendar,
  Smartphone,
  Building2,
  UtensilsCrossed,
  Zap,
  Target
} from 'lucide-react';
import { 
  GastroQuestion, 
  QuestionInputOption, 
  COUNTRY_PROFILES, 
  getOptionLabel,
  type Language 
} from '@/lib/gastroSetupQuestions';

interface InputProps {
  question: GastroQuestion;
  value: any;
  onChange: (value: any) => void;
  country: string;
  language?: Language;
}

// Choice Cards Input
export const ChoiceCardsInput = ({ question, value, onChange, language = 'es' }: InputProps) => {
  const options = question.ui.input.options as QuestionInputOption[];
  
  const getIcon = (id: string) => {
    const icons: Record<string, typeof Zap> = {
      connect: MapPin,
      not_listed: Store,
      later: Clock,
      quick: Zap,
      full: Target,
    };
    return icons[id] || Zap;
  };

  return (
    <div className="grid gap-3">
      {options.map((opt) => {
        const Icon = getIcon(opt.id);
        const isSelected = value === opt.id;
        const label = language === 'pt-BR' ? opt.label_pt : opt.label_es;
        
        return (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
              isSelected 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
              isSelected ? "gradient-primary text-white" : "bg-secondary text-muted-foreground"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-lg font-medium flex-1",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}>
              {label}
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Multi-select Input
export const MultiselectInput = ({ question, value, onChange, country, language = 'es' }: InputProps) => {
  const [customValue, setCustomValue] = useState('');
  const selected = Array.isArray(value) ? value : [];
  
  // Get options from source or direct
  let options: string[] = [];
  if (question.ui.input.optionsSource) {
    const profile = COUNTRY_PROFILES[country];
    if (profile && question.ui.input.optionsSource.includes('deliveryPlatforms')) {
      options = profile.optionPacks.gastro.deliveryPlatforms;
    } else if (question.ui.input.optionsSource.includes('socialChannels')) {
      options = profile?.optionPacks.gastro.socialChannels || [];
    } else if (question.ui.input.optionsSource.includes('reservationTools')) {
      options = profile?.optionPacks.gastro.reservationTools || [];
    } else if (question.ui.input.optionsSource.includes('reviewSources')) {
      options = profile?.optionPacks.gastro.reviewSources || [];
    }
  } else if (Array.isArray(question.ui.input.options)) {
    options = question.ui.input.options.map(o => {
      if (typeof o === 'string') return o;
      return language === 'pt-BR' ? o.label_pt : o.label_es;
    });
  }

  const toggleOption = (opt: string) => {
    const max = question.ui.input.max;
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  const addCustom = () => {
    if (customValue.trim() && !selected.includes(customValue.trim())) {
      onChange([...selected, customValue.trim()]);
      setCustomValue('');
    }
  };

  const getChannelIcon = (opt: string) => {
    const icons: Record<string, typeof Store> = {
      dine_in: UtensilsCrossed,
      pickup: Store,
      delivery_own: Truck,
      delivery_apps: Smartphone,
      catering_events: Calendar,
      subscription: Users,
      mobile: Truck,
      institutional: Building2,
    };
    return icons[opt.toLowerCase().replace(/\s/g, '_')] || Store;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const Icon = getChannelIcon(opt);
          const label = typeof opt === 'string' ? getOptionLabel(opt, language) : opt;
          
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium flex-1",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {label}
              </span>
              {isSelected && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {question.ui.input.include_other && (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={language === 'pt-BR' ? 'Outro...' : 'Otro...'}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          />
          <Button type="button" onClick={addCustom} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selected.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 px-3 py-1.5">
              {getOptionLabel(s, language)}
              <button type="button" onClick={() => toggleOption(s)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Single Select Input
export const SingleSelectInput = ({ question, value, onChange, language = 'es' }: InputProps) => {
  const options = question.ui.input.options as string[];
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = value === opt;
        const label = getOptionLabel(opt, language);
        
        return (
          <motion.button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
              isSelected 
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card hover:border-primary/40 text-muted-foreground"
            )}
          >
            <span className="text-sm font-medium">{label}</span>
            {isSelected && <Check className="w-4 h-4 text-primary" />}
          </motion.button>
        );
      })}
    </div>
  );
};

// Money Input
export const MoneyInput = ({ value, onChange, country, language = 'es' }: InputProps) => {
  const profile = COUNTRY_PROFILES[country];
  const symbol = profile?.currency.symbol || '$';
  const code = profile?.currency.code || 'USD';
  
  const numValue = typeof value === 'number' ? value : (parseInt(value) || 0);
  
  // Approximate USD conversion rates
  const usdRates: Record<string, number> = {
    ARS: 1000, MXN: 17, CLP: 900, COP: 4000, BRL: 5, UYU: 40, CRC: 530, USD: 1,
  };
  const usdEstimate = Math.round(numValue / (usdRates[code] || 1));

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
          {symbol}
        </span>
        <Input
          type="number"
          value={numValue || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="pl-12 h-14 text-xl font-semibold"
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {code}
        </span>
      </div>
      {numValue > 0 && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          ≈ ${usdEstimate.toLocaleString()} USD
        </p>
      )}
    </div>
  );
};

// Percent Slider Input
export const PercentSliderInput = ({ value, onChange }: InputProps) => {
  const numValue = typeof value === 'number' ? value : 30;
  
  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-primary">{numValue}%</span>
      </div>
      <Slider
        value={[numValue]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={5}
        className="py-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

// Chips Text Input (for top sellers, etc.)
export const ChipsTextInput = ({ question, value, onChange, language = 'es' }: InputProps) => {
  const [inputValue, setInputValue] = useState('');
  const chips = Array.isArray(value) ? value : [];
  const max = question.ui.input.max || 5;

  const addChip = () => {
    if (inputValue.trim() && chips.length < max && !chips.includes(inputValue.trim())) {
      onChange([...chips, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeChip = (chip: string) => {
    onChange(chips.filter(c => c !== chip));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={language === 'pt-BR' ? 'Ex: Café con leche, Medialunas...' : 'Ej: Café con leche, Medialunas...'}
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip())}
          disabled={chips.length >= max}
        />
        <Button 
          type="button" 
          onClick={addChip} 
          disabled={chips.length >= max || !inputValue.trim()}
          variant="outline"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <motion.div
            key={chip}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              {chip}
              <button type="button" onClick={() => removeChip(chip)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </motion.div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {chips.length}/{max} {language === 'pt-BR' ? 'produtos' : 'productos'}
      </p>
    </div>
  );
};

// Number/Range Input
export const NumberRangeInput = ({ value, onChange, language = 'es' }: InputProps) => {
  const numValue = typeof value === 'number' ? value : (parseInt(value) || 0);
  
  const presets = [20, 40, 60, 80, 100, 150];
  
  return (
    <div className="space-y-4">
      <Input
        type="number"
        value={numValue || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="h-14 text-xl font-semibold text-center"
        placeholder={language === 'pt-BR' ? 'Quantidade' : 'Cantidad'}
      />
      
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={numValue === preset ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(preset)}
            className="flex-1 min-w-[60px]"
          >
            {preset}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Percent or Bucket Input
export const PercentBucketInput = ({ question, value, onChange, language = 'es' }: InputProps) => {
  const buckets = question.ui.input.buckets || ['bajo', 'medio', 'alto', 'no_se'];
  const [mode, setMode] = useState<'bucket' | 'percent'>(typeof value === 'number' ? 'percent' : 'bucket');
  
  const percentValue = typeof value === 'number' ? value : 30;
  const bucketValue = typeof value === 'string' ? value : '';

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-xl border-2 border-border p-1 bg-card">
        <button
          type="button"
          onClick={() => setMode('bucket')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === 'bucket' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {language === 'pt-BR' ? 'Estimativa' : 'Estimación'}
        </button>
        <button
          type="button"
          onClick={() => setMode('percent')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === 'percent' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {language === 'pt-BR' ? '% Exato' : '% Exacto'}
        </button>
      </div>

      {mode === 'bucket' ? (
        <div className="grid grid-cols-2 gap-3">
          {buckets.map((bucket) => {
            const isSelected = bucketValue === bucket;
            return (
              <motion.button
                key={bucket}
                type="button"
                onClick={() => onChange(bucket)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-center",
                  isSelected 
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                )}
              >
                <span className="font-medium">{getOptionLabel(bucket, language)}</span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-4xl font-bold text-primary">{percentValue}%</span>
          </div>
          <Slider
            value={[percentValue]}
            onValueChange={([v]) => onChange(v)}
            min={question.ui.input.percentRange?.[0] || 0}
            max={question.ui.input.percentRange?.[1] || 100}
            step={1}
          />
        </div>
      )}
    </div>
  );
};

// Main Input Renderer
export const GastroSetupInput = ({ question, value, onChange, country, language = 'es' }: InputProps) => {
  const inputType = question.ui.input.type;

  switch (inputType) {
    case 'choice_cards':
      return <ChoiceCardsInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'multiselect':
      return <MultiselectInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'single_select':
      return <SingleSelectInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'money':
    case 'money_or_range':
      return <MoneyInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'percent_slider':
      return <PercentSliderInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'chips_text':
      return <ChipsTextInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'number_or_range':
      return <NumberRangeInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    case 'percent_or_bucket':
      return <PercentBucketInput question={question} value={value} onChange={onChange} country={country} language={language} />;
    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={language === 'pt-BR' ? question.ui.input.placeholder_pt : question.ui.input.placeholder_es}
          className="h-14 text-lg"
        />
      );
  }
};
