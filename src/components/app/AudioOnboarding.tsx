import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  MicOff,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AudioOnboardingProps {
  onDataExtracted?: (data: ExtractedData) => void;
}

interface ExtractedData {
  businessName?: string;
  category?: string;
  uniqueValue?: string;
  targetCustomer?: string;
  challenges?: string[];
}

const CLARIFYING_QUESTIONS = [
  "¿Cuántos empleados tiene tu negocio?",
  "¿Cuál es tu ticket promedio?",
  "¿Qué días tienen más movimiento?",
  "¿Cuál es tu principal desafío ahora mismo?",
  "¿Qué te gustaría mejorar primero?",
];

export const AudioOnboarding = ({ onDataExtracted }: AudioOnboardingProps) => {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setProcessing(true);
      
      // Simulate transcription
      setTimeout(() => {
        setTranscript("Tengo un restaurante de comida mexicana en el centro de Buenos Aires. Nos especializamos en tacos y burritos auténticos. Nuestros clientes son principalmente jóvenes de 25-40 años que buscan comida rápida pero de calidad...");
        setProcessing(false);
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      toast({ 
        title: "🎙️ Grabando...", 
        description: "Cuéntame sobre tu negocio. Sé honesto sobre cómo está hoy." 
      });
    }
  };

  const processTranscript = () => {
    setProcessing(true);
    
    // Simulate AI extraction
    setTimeout(() => {
      const data: ExtractedData = {
        businessName: "Tacos Auténticos",
        category: "fast_casual",
        uniqueValue: "Comida mexicana auténtica, rápida y de calidad",
        targetCustomer: "Jóvenes profesionales 25-40 años",
        challenges: ["Competencia local", "Horarios de baja afluencia"]
      };
      
      setExtractedData(data);
      setProcessing(false);
      setShowQuestions(true);
    }, 2000);
  };

  const handleQuestionAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    if (currentQuestion < CLARIFYING_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered
      if (extractedData) {
        onDataExtracted?.(extractedData);
        toast({
          title: "✅ ¡Perfecto!",
          description: "Tengo toda la información que necesito",
        });
        setOpen(false);
      }
    }
  };

  const skipQuestions = () => {
    if (extractedData) {
      onDataExtracted?.(extractedData);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mic className="w-4 h-4" />
          Contame rápido por audio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Contame sobre tu negocio
          </DialogTitle>
          <DialogDescription className="text-left">
            Es importantísimo que cuentes la verdad de cómo está hoy el negocio. 
            No te preocupes: estoy para ayudarte a mejorar. Cuanto más honesto, mejores resultados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!transcript && !showQuestions && (
            <>
              {/* Recording Button */}
              <div className="flex flex-col items-center py-8">
                <button
                  onClick={toggleRecording}
                  disabled={processing}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                    isRecording 
                      ? "bg-destructive animate-pulse shadow-lg shadow-destructive/50" 
                      : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  )}
                >
                  {processing ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {processing 
                    ? "Procesando audio..." 
                    : isRecording 
                    ? "Toca para detener" 
                    : "Toca para comenzar a grabar"}
                </p>
              </div>

              {/* Or text input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o escribe</span>
                </div>
              </div>

              <Textarea
                placeholder="Describe tu negocio aquí..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[100px]"
              />
            </>
          )}

          {transcript && !showQuestions && (
            <>
              {/* Transcript Preview */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">{transcript}</p>
                </CardContent>
              </Card>

              <Button 
                onClick={processTranscript} 
                disabled={processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extraer información
                  </>
                )}
              </Button>
            </>
          )}

          {showQuestions && extractedData && (
            <>
              {/* Extracted Data Preview */}
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {extractedData.businessName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {extractedData.uniqueValue}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clarifying Questions */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Pregunta {currentQuestion + 1} de {CLARIFYING_QUESTIONS.length}
                </p>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-foreground mb-3">
                      {CLARIFYING_QUESTIONS[currentQuestion]}
                    </p>
                    <Textarea
                      placeholder="Tu respuesta..."
                      className="min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleQuestionAnswer((e.target as HTMLTextAreaElement).value);
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={skipQuestions} className="flex-1">
                  Saltar preguntas
                </Button>
                <Button 
                  onClick={() => handleQuestionAnswer("")} 
                  className="flex-1"
                >
                  Continuar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
