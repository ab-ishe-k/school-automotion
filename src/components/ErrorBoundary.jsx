import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: 'var(--danger-bg)',
            borderRadius: '8px',
            border: '1px solid var(--danger)',
            margin: '16px',
          }}
        >
          <h3 style={{ color: 'var(--danger)', marginBottom: '8px', fontSize: '15px' }}>
            Something went wrong
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            This section crashed. Your data is safe — please refresh or navigate away.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
