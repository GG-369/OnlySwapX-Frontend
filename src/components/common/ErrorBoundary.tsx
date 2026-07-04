import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/50 px-6 py-16 text-center">
          <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="mt-1 text-sm text-muted-foreground">An unexpected error occurred.</p>
          <Button variant="outline" className="mt-4 border-gold/20" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
