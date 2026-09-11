import React from 'react';
import { MapPin, CheckCircle2, Navigation, ExternalLink, Compass } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=-1.0832131,36.9786477';
  const pinLocationUrl = 'https://maps.app.goo.gl/m3zMWXJTzwgic9Z7A';
  const googleMapsShortUrl = 'https://maps.app.goo.gl/m3zMWXJTzwgic9Z7A';

  return (
    <section id="advantage" className="py-20 bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Main Strategic Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-12 border-l-4 border-l-blue-600">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-grow space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                <MapPin className="w-3.5 h-3.5" />
                <span>Prime Growth Corridor &bull; &ldquo;Exit 14 Kenyatta Road&rdquo; Juja, Kiambu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                Strategic Advantage at &ldquo;Exit 14 Kenyatta Road&rdquo;, Juja
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Located in Kiambu County’s prime infrastructure growth corridor at <strong>&ldquo;Exit 14 Kenyatta Road&rdquo; Juja, Kiambu County</strong>, PanelPro Precast Ltd offers seamless logistical connectivity to Nairobi, Thika Superhighway, Ruiru, Juja, and surrounding regional development projects.
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

        {/* Location & Interactive Google Map Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Navigation className="w-4 h-4" />
                <span>Exact Manufacturing Yard Coordinates</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                &ldquo;Exit 14 Kenyatta Road&rdquo; Juja, Kiambu County
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Directly accessible via Thika Superhighway Exit 14 off-ramp. Wide paved and murram access designed for multi-axle low-loaders, flatbeds, and ready-mix trucks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-md shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                title="Get turn-by-turn driving directions to our yard"
              >
                <Compass className="w-4 h-4" />
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={pinLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold rounded-md transition-all inline-flex items-center gap-2 cursor-pointer"
                title="Open exact coordinate pin on Google Maps"
              >
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Open Pin in Maps</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Embedded Google Map */}
            <div className="lg:col-span-2 relative min-h-[340px] bg-slate-200">
              <iframe
                title="PanelPro Precast and Logistics Ltd Location - Exit 14 Kenyatta Road Juja"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1994.5527751456252!2d36.97859091534164!3d-1.0830344164353!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f49006ec4de77%3A0x8056778a6aa6c01b!2sPanelPro%20Precast%20and%20Logistics%20Ltd!5e0!3m2!1sen!2sus!4v1789133805603!5m2!1sen!2sus"
                width="100%"
                height="100%"
                className="w-full h-full min-h-[340px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Practical Logistics Highlights */}
            <div className="p-6 sm:p-8 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 space-y-4 flex flex-col justify-center text-xs text-slate-600">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                Transit &amp; Delivery Logistics
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Thika Superhighway Exit 14:</strong> Immediate off-ramp turning onto Kenyatta Road in Juja.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Turnaround Time:</strong> 15 mins to Ruiru, 10 mins to Juja town, 35 mins to Nairobi CBD / Industrial Area.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Self-Collection Loading:</strong> Forklifts and overhead crane hoists available on-site for rapid dispatch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>GPS Coordinates:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">-1.083257, 36.978548</code></span>
                </li>
              </ul>
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 font-bold inline-flex items-center gap-1 hover:underline"
                >
                  <span>Navigation Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span>&bull;</span>
                <a
                  href={googleMapsShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-800 inline-flex items-center gap-1 hover:underline"
                  title="Original Maps App Shortlink"
                >
                  <span>Direct Maps App link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
