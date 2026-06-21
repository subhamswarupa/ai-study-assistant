import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{this.state.error.message}</p>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#9ca3af' }}>
            <summary>Stack trace</summary>
            {this.state.error.stack}
          </details>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
