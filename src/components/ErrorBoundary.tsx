import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Chart error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="h-80 flex items-center justify-center text-slate-500 bg-slate-800 rounded-xl">
            Chart failed to render. Check browser console for details.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
