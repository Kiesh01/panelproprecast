import React from 'react';
import { ShieldCheck, Truck, Layers, ArrowRight } from 'lucide-react';

interface HeroProps {
  onScrollTo: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollTo }) => {
  return (
    <section id="home" className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background with Dark Slate & Deep Industrial Blue Gradient and Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
        style={{ backgroundImage: `url('/roadchannel.jpg')` }}
      />
      
      {/* Deep Blue & Slate Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-32 flex flex-col items-center text-center">
        {/* Quality pill in Blue & Grey */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>KEBS Certified Precast Manufacturing &bull; &ldquo;Exit 14 Kenyatta Road&rdquo; Juja</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-100 mb-6 leading-tight">
          High-Strength Precast &amp; Concrete Solutions
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
          Supplying heavy-duty, KEBS-standard cabro paving blocks, hollow pots, beams, road kerbs, precast drainage, and fence posts direct from &ldquo;Exit 14 Kenyatta Road&rdquo; Juja, Kiambu County to projects across Nairobi and Kenya.
        </p>

        {/* Buttons in Blue and Grey Palette */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onScrollTo('products')}
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md shadow-lg shadow-blue-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500 hover:-translate-y-0.5"
          >
            <Layers className="w-4 h-4" />
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onScrollTo('quote')}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-md border border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <span>Request a Custom Quote</span>
          </button>
        </div>

        {/* Micro highlights in slate & subtle blue */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-800/80 w-full max-w-4xl text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">50-80mm</div>
              <div className="text-xs text-slate-400">Cabro Paving Gauges</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">Class A Spec</div>
              <div className="text-xs text-slate-400">KeNHA/KURA Standard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">Site Offloading</div>
              <div className="text-xs text-slate-400">Direct Crane &amp; Truck Delivery</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <div className="text-blue-400 font-extrabold text-sm">KS</div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">100% KEBS</div>
              <div className="text-xs text-slate-400">Standard Certified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
