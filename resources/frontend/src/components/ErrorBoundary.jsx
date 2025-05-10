import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Quelque chose s'est mal passé.</h2>
          <p>{this.state.error?.message || 'Erreur inconnue'}</p>
          <p>Vérifiez la console pour plus de détails.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;