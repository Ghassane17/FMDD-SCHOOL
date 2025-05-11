import { Component } from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
    state = {
        error: null,
        errorInfo: null,
    };

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('ErrorBoundary caught an error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }

    resetError = () => {
        this.setState({ error: null, errorInfo: null });
    };

    render() {
        if (this.state.error) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    resetError={this.resetError}
                />
            );
        }
        return this.props.children;
    }
}

function ErrorFallback({ error, errorInfo, resetError }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                <p className="text-gray-700 mb-4">{error.message}</p>
                {process.env.NODE_ENV === 'development' && (
                    <details className="text-left text-sm text-gray-500 mb-4">
                        <summary>Stack trace</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded">
              {error.stack}
                            <br />
              Component stack:
                            {errorInfo.componentStack}
            </pre>
                    </details>
                )}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            resetError();
                            navigate('/');
                        }}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={resetError}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorBoundary;
