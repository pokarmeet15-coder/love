import React from 'react';
import { Terminal, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { ToolCallLog } from '../types';

interface ToolToastProps {
  logs: ToolCallLog[];
}

export const ToolToast: React.FC<ToolToastProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  const latest = logs[0];

  return (
    <div className="w-full max-w-sm mx-auto my-2 px-4 transition-all duration-300">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-lg flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
              Tool Action: {latest.toolName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span>{latest.timestamp}</span>
            {latest.status === 'executing' && (
              <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            )}
            {latest.status === 'success' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {latest.status === 'error' && (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
        </div>

        {/* Arguments details */}
        {latest.args && Object.keys(latest.args).length > 0 && (
          <div className="bg-slate-950/70 rounded-xl p-2 font-mono text-[11px] text-slate-300 border border-slate-800/80 overflow-x-auto max-h-20">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(latest.args, null, 2)}
            </pre>
          </div>
        )}

        {/* Result summary */}
        {latest.status === 'success' && latest.result?.openedUrl && (
          <a
            href={latest.result.openedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-pink-400 font-medium hover:underline mt-0.5"
          >
            <span>Visit opened URL</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
