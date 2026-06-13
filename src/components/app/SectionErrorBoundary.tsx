import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Nombre legible de la sección, ej: "I+D" o "Oportunidades". */
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Boundary local de sección. Aísla fallos para que un error en un sub-módulo
 * (ej: I+D del Radar) nunca rompa toda la página y saque al usuario a la
 * pantalla global de "Algo salió mal".
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(`[SectionErrorBoundary:${this.props.label ?? "section"}]`, error, info);
    }
  }


  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="dashboard-card p-8 text-center mx-auto max-w-md">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">
          {this.props.label ? `No pude cargar ${this.props.label}` : "Sección no disponible"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hubo una pausa al traer datos. El resto de la app sigue funcionando con normalidad.
        </p>
        <Button size="sm" variant="outline" onClick={this.handleRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      </div>
    );
  }
}

export default SectionErrorBoundary;
