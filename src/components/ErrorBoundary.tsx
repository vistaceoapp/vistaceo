import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { safeLocalStorage, safeSessionStorage } from '@/lib/safe-storage';

interface Props {
  children: ReactNode;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const resetRecoveryState = (preserveSetup = false) => {
  [
    'pendingPlan',
    'pendingPlanTimestamp',
    'proPurchaseCompleted',
  ].forEach((key) => safeLocalStorage.removeItem(key));

  if (!preserveSetup) {
    ['setupProgress', 'setupUniversalProfile', 'selectedCountryCode'].forEach((key) => safeLocalStorage.removeItem(key));
  }

  safeSessionStorage.removeItem('va_session');
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    resetRecoveryState(this.props.fallbackRoute === '/setup');
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    resetRecoveryState(this.props.fallbackRoute === '/setup');
    window.location.href = this.props.fallbackRoute || '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Algo salió mal
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Ocurrió un error inesperado. Podés reintentar o volver al inicio.
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleReload} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
