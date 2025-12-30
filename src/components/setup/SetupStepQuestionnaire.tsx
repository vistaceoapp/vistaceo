// Step: Questionnaire for Gastronomy
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Check, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_PACKS } from '@/lib/countryPacks';

// Define gastronomy questions inline for v7 setup
interface QuestionOption {
  id: string;
  label: { es: string; 'pt-BR': string };
  emoji?: string;
}

interface Question {
  id: string;
  category: string;
  mode: 'quick' | 'complete' | 'both';
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text';
  options?: QuestionOption[];
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
}

const GASTRO_QUESTIONS: Question[] = [
  // CHANNELS
  {
    id: 'channels',
    category: 'Operación',
    mode: 'both',
    title: { es: '¿Cómo vendés hoy?', 'pt-BR': 'Como você vende hoje?' },
    help: { es: 'Elegí todo lo que aplique', 'pt-BR': 'Selecione tudo que se aplica' },
    type: 'multi',
    required: true,
    options: [
      { id: 'dine_in', label: { es: 'Salón', 'pt-BR': 'Salão' }, emoji: '🍽️' },
      { id: 'delivery_apps', label: { es: 'Apps de delivery', 'pt-BR': 'Apps de delivery' }, emoji: '📱' },
      { id: 'delivery_own', label: { es: 'Delivery propio', 'pt-BR': 'Delivery próprio' }, emoji: '🛵' },
      { id: 'pickup', label: { es: 'Take away', 'pt-BR': 'Take away' }, emoji: '🥡' },
      { id: 'catering', label: { es: 'Catering/Eventos', 'pt-BR': 'Catering/Eventos' }, emoji: '🎉' },
    ],
  },
  // PEAK TIMES
  {
    id: 'peaks',
    category: 'Operación',
    mode: 'both',
    title: { es: '¿Cuándo se te llena más?', 'pt-BR': 'Quando enche mais?' },
    help: { es: 'Elegí tus franjas fuertes', 'pt-BR': 'Escolha suas faixas fortes' },
    type: 'multi',
    options: [
      { id: 'morning', label: { es: 'Mañana', 'pt-BR': 'Manhã' }, emoji: '☀️' },
      { id: 'noon', label: { es: 'Mediodía', 'pt-BR': 'Meio-dia' }, emoji: '🌞' },
      { id: 'afternoon', label: { es: 'Tarde', 'pt-BR': 'Tarde' }, emoji: '🌤️' },
      { id: 'night', label: { es: 'Noche', 'pt-BR': 'Noite' }, emoji: '🌙' },
      { id: 'weekend', label: { es: 'Fines de semana', 'pt-BR': 'Finais de semana' }, emoji: '🎊' },
    ],
  },
  // CAPACITY
  {
    id: 'capacity',
    category: 'Operación',
    mode: 'both',
    title: { es: 'Capacidad del local (asientos)', 'pt-BR': 'Capacidade do local (lugares)' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 0,
    max: 200,
    unit: 'asientos',
  },
  // SALES TRACKING
  {
    id: 'sales_tracking',
    category: 'Ventas',
    mode: 'both',
    title: { es: '¿Cómo registrás ventas hoy?', 'pt-BR': 'Como você registra vendas hoje?' },
    type: 'single',
    required: true,
    options: [
      { id: 'pos', label: { es: 'Sistema POS/Caja', 'pt-BR': 'Sistema PDV' }, emoji: '💻' },
      { id: 'excel', label: { es: 'Excel/Planilla', 'pt-BR': 'Excel/Planilha' }, emoji: '📊' },
      { id: 'notebook', label: { es: 'Cuaderno/Papel', 'pt-BR': 'Caderno/Papel' }, emoji: '📓' },
      { id: 'nothing', label: { es: 'Nada formal', 'pt-BR': 'Nada formal' }, emoji: '🤷' },
    ],
  },
  // AVG TICKET
  {
    id: 'avg_ticket',
    category: 'Ventas',
    mode: 'both',
    title: { es: 'Ticket promedio (aprox.)', 'pt-BR': 'Ticket médio (aprox.)' },
    help: { es: 'En tu moneda local', 'pt-BR': 'Na sua moeda local' },
    type: 'number',
    min: 0,
    max: 100000,
  },
  // MENU SIZE
  {
    id: 'menu_size',
    category: 'Oferta',
    mode: 'both',
    title: { es: '¿Cuántos productos vendés activamente?', 'pt-BR': 'Quantos produtos você vende ativamente?' },
    type: 'single',
    options: [
      { id: '1-10', label: { es: '1-10 productos', 'pt-BR': '1-10 produtos' } },
      { id: '11-30', label: { es: '11-30 productos', 'pt-BR': '11-30 produtos' } },
      { id: '31-80', label: { es: '31-80 productos', 'pt-BR': '31-80 produtos' } },
      { id: '80+', label: { es: 'Más de 80', 'pt-BR': 'Mais de 80' } },
    ],
  },
  // TOP SELLERS
  {
    id: 'top_sellers',
    category: 'Oferta',
    mode: 'both',
    title: { es: 'Tu producto/plato estrella', 'pt-BR': 'Seu produto/prato estrela' },
    help: { es: 'El que más se vende o querés destacar', 'pt-BR': 'O que mais vende ou quer destacar' },
    type: 'text',
  },
  // FOOD COST
  {
    id: 'food_cost',
    category: 'Finanzas',
    mode: 'complete',
    title: { es: '% costo de insumos sobre venta', 'pt-BR': '% custo de insumos sobre venda' },
    help: { es: 'Aproximado está bien', 'pt-BR': 'Aproximado está bom' },
    type: 'slider',
    min: 10,
    max: 70,
    unit: '%',
  },
  // EMPLOYEES
  {
    id: 'employees',
    category: 'Equipo',
    mode: 'both',
    title: { es: '¿Cuántas personas trabajan?', 'pt-BR': 'Quantas pessoas trabalham?' },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
      { id: '2-5', label: { es: '2-5 personas', 'pt-BR': '2-5 pessoas' }, emoji: '👥' },
      { id: '6-15', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' }, emoji: '👨‍👩‍👧‍👦' },
      { id: '15+', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🏢' },
    ],
  },
  // INSTAGRAM
  {
    id: 'instagram',
    category: 'Marketing',
    mode: 'both',
    title: { es: '¿Tenés Instagram del negocio?', 'pt-BR': 'Você tem Instagram do negócio?' },
    help: { es: 'Si tenés, poné tu @usuario', 'pt-BR': 'Se tiver, coloque seu @usuario' },
    type: 'text',
  },
];

interface SetupStepQuestionnaireProps {
  countryCode: CountryCode;
  setupMode: 'quick' | 'complete';
  answers: Record<string, any>;
  onUpdate: (answers: Record<string, any>) => void;
  onComplete: () => void;
}

export const SetupStepQuestionnaire = ({
  countryCode,
  setupMode,
  answers,
  onUpdate,
  onComplete,
}: SetupStepQuestionnaireProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lang = COUNTRY_PACKS[countryCode]?.locale?.startsWith('pt') ? 'pt-BR' : 'es';
  const currency = COUNTRY_PACKS[countryCode]?.currencySymbol || '$';

  // Filter questions based on setup mode
  const activeQuestions = useMemo(() => {
    return GASTRO_QUESTIONS.filter(q => q.mode === 'both' || q.mode === setupMode);
  }, [setupMode]);

  const currentQuestion = activeQuestions[currentIndex];
  const totalQuestions = activeQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const getCurrentValue = () => answers[currentQuestion?.id];

  const handleAnswer = (value: any) => {
    onUpdate({ ...answers, [currentQuestion.id]: value });
  };

  const handleMultiSelect = (optionId: string) => {
    const current = (answers[currentQuestion.id] as string[]) || [];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    onUpdate({ ...answers, [currentQuestion.id]: updated });
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    const value = getCurrentValue();
    if (!currentQuestion.required) return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'single':
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options?.map((option) => {
              const isSelected = getCurrentValue() === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  {option.emoji && <span className="text-xl mb-2 block">{option.emoji}</span>}
                  <span className={cn("font-medium", isSelected && "text-primary")}>
                    {option.label[lang as 'es' | 'pt-BR'] || option.label.es}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'multi':
        const selectedItems = (getCurrentValue() as string[]) || [];
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options?.map((option) => {
              const isSelected = selectedItems.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleMultiSelect(option.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all relative",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  {isSelected && (
                    <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                  )}
                  {option.emoji && <span className="text-xl mb-2 block">{option.emoji}</span>}
                  <span className={cn("font-medium", isSelected && "text-primary")}>
                    {option.label[lang as 'es' | 'pt-BR'] || option.label.es}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <Input
              type="number"
              value={getCurrentValue() || ''}
              onChange={(e) => handleAnswer(e.target.value ? Number(e.target.value) : undefined)}
              placeholder={lang === 'pt-BR' ? 'Digite um valor' : 'Ingresá un valor'}
              className="h-14 text-lg text-center"
            />
            <p className="text-center text-sm text-muted-foreground">
              {currentQuestion.id === 'avg_ticket' && `${currency} ${getCurrentValue() || '---'}`}
            </p>
          </div>
        );

      case 'slider':
        const sliderValue = getCurrentValue() ?? currentQuestion.min ?? 0;
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{sliderValue}</span>
              <span className="text-lg text-muted-foreground ml-2">
                {currentQuestion.unit === '%' ? '%' : currentQuestion.unit}
              </span>
            </div>
            <Slider
              value={[sliderValue]}
              min={currentQuestion.min || 0}
              max={currentQuestion.max || 100}
              step={1}
              onValueChange={([val]) => handleAnswer(val)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentQuestion.min || 0}</span>
              <span>{currentQuestion.max || 100}</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <Input
            type="text"
            value={getCurrentValue() || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={lang === 'pt-BR' ? 'Digite aqui...' : 'Escribí acá...'}
            className="h-14 text-lg"
          />
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {currentQuestion.category}
          </Badge>
          <span className="text-muted-foreground">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Question */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {currentQuestion.title[lang as 'es' | 'pt-BR'] || currentQuestion.title.es}
            </h2>
            {currentQuestion.help && (
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                {currentQuestion.help[lang as 'es' | 'pt-BR'] || currentQuestion.help.es}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="py-4">{renderInput()}</div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-4 pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0}
          size="lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1"
          size="lg"
        >
          {currentIndex >= totalQuestions - 1 ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              {lang === 'pt-BR' ? 'Finalizar' : 'Finalizar'}
            </>
          ) : (
            <>
              {lang === 'pt-BR' ? 'Continuar' : 'Continuar'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Skip option for non-required */}
      {!currentQuestion.required && (
        <button
          onClick={handleNext}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {lang === 'pt-BR' ? 'Pular' : 'Omitir'}
        </button>
      )}
    </div>
  );
};
