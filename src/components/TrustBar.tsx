import React from 'react';
import { Award, Truck, Cpu, Clock3 } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">KEBS Standard Certified</h4>
            <p className="text-slate-500 text-xs">Strict automated batching &amp; cube testing</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Reliable Logistics</h4>
            <p className="text-slate-500 text-xs">Direct site delivery across Nairobi &amp; Kiambu</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Vibration Compaction</h4>
            <p className="text-slate-500 text-xs">High-density zero-void aggregate curing</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Clock3 className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Prompt Factory Turnaround</h4>
            <p className="text-slate-500 text-xs">Consistent yard inventory ready for dispatch</p>
          </div>
        </div>
      </div>
    </div>
  );
};
