import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Qyopic runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#0A0A0A] flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-[#52525B]">
              We encountered an unexpected display error. Reload the page to return to the Qyopic gallery.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
            >
              Reload Qyopic
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
