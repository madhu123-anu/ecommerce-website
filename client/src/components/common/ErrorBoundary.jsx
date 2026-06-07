import { Component } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // In production, log to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm leading-relaxed">
              We encountered an unexpected error. This has been logged and we're working on a fix.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-700 dark:text-red-300 font-mono">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap break-all overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn-primary"
              >
                <FiRefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-outline"
              >
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
