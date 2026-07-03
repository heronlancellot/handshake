"use client";

import { Component, type ReactNode, useCallback, useState } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function DefaultFallback({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-2xl font-extrabold text-white">Something went wrong</p>
      <p className="text-sm text-zinc-400">
        An unexpected error occurred. Please refresh the page.
      </p>
      <button
        onClick={onReset}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Thin class wrapper — React requires a class component to catch render errors.
// All logic lives in the functional wrapper below.
class Catcher extends Component<
  ErrorBoundaryProps & { resetKey: number },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { resetKey: number }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [resetKey, setResetKey] = useState(0);
  const reset = useCallback(() => setResetKey((k) => k + 1), []);

  return (
    <Catcher
      resetKey={resetKey}
      fallback={fallback ?? <DefaultFallback onReset={reset} />}
    >
      {children}
    </Catcher>
  );
}
