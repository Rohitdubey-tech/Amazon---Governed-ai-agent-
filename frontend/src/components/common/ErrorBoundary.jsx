import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-[#121620] rounded-3xl p-8 max-w-lg w-full border border-rose-500/30 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Render Error Caught</h2>
              <p className="text-xs text-slate-400 mt-1">
                An unexpected view error was safely isolated by AgentShield Error Boundary.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-[#0A0D14] text-rose-300 font-mono text-[11px] rounded-xl text-left overflow-x-auto max-h-40 border border-rose-950/60">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#161D2B] hover:bg-[#1E2638] text-slate-300 font-semibold text-xs rounded-xl border border-[#232D40] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
