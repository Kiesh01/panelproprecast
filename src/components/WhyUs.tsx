import React from 'react';
import { MapPin, CheckCircle2, ShieldAlert, Cpu, Truck, BarChart3 } from 'lucide-react';

export const WhyUs: React.FC = () => {
  return (
    <section id="advantage" className="py-20 bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-12 max-w-5xl mx-auto border-l-4 border-l-blue-600">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-grow space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                <MapPin className="w-3.5 h-3.5" />
                <span>Prime Growth Corridor &bull; Kiambu County</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                Strategic Advantage Along Kenyatta Road
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Located in Kiambu County’s prime infrastructure growth corridor along Kenyatta Road, PanelPro Precast Ltd offers seamless logistical connectivity to Nairobi, Thika Superhighway, Ruiru, Juja, and surrounding development projects.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Our advanced automated mixing, hydraulic press compaction, and steam curing systems eliminate structural inconsistencies common with traditional small-scale casting. Whether you are a civil contractor executing public agency tenders (KeNHA/KURA/KeRRA) or a private developer building a gated community, we deliver verified compressive strength with guaranteed batch uniformity.
              </p>

              {/* Feature Points in Blue & Grey */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Zero Slag Uniform Aggregates</h4>
                    <p className="text-xs text-slate-500">Rigid sieve-graded ballast and river sand for maximum strength.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Heavy-Duty Logistics Fleet</h4>
                    <p className="text-xs text-slate-500">Equipped with flatbeds and self-loading knuckle-boom cranes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Strict KeNHA Road Alignment</h4>
                    <p className="text-xs text-slate-500">Dimensions engineered to fit official road drainage blueprints.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Batch Laboratory Reports</h4>
                    <p className="text-xs text-slate-500">Crush test certificates provided upon delivery for engineer signoff.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Column in Slate & Blue */}
            <div className="w-full lg:w-72 bg-slate-900 text-white rounded-lg p-6 shrink-0 border border-slate-800 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-3">
                Factory Specs
              </h3>
              <div>
                <div className="text-2xl font-black text-white">49+ N/mm²</div>
                <div className="text-xs text-slate-400">Average Compressive Strength</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">48 Hours</div>
                <div className="text-xs text-slate-400">Standard Order Dispatch</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-xs text-slate-400">Steel Reinforced Posts &amp; Culverts</div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 leading-tight block">
                  Yard Visits Welcome: Mon - Sat (7:30 AM - 5:30 PM)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
