import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

// Last-resort guard: a render error anywhere below no longer white-screens
// the whole app — the user gets a branded recovery screen with a reload.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error boundary caught:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
        style={{ backgroundColor: 'var(--app-bg)', gap: 16, zIndex: 9999 }}
      >
        <h1
          style={{
            color: 'var(--app-gold)',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 24,
            fontWeight: 300,
            letterSpacing: '0.1em',
            margin: 0,
          }}
        >
          Something went wrong
        </h1>
        <p style={{ color: 'var(--app-text-2)', fontSize: 14, fontWeight: 300, margin: 0 }}>
          An unexpected error occurred. Tap below to get back on track.
        </p>
        <button
          onClick={this.handleReload}
          style={{
            marginTop: 8,
            padding: '12px 32px',
            borderRadius: 9999,
            backgroundColor: '#C9A962',
            color: '#1A1508',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }
}
