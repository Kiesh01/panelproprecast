import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onScrollTo: (id: string) => void;
  onOpenHtmlModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollTo }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="cursor-pointer" onClick={scrollToTop}>
              <Logo variant="dark" size="md" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your trusted precast concrete manufacturing partner along Kenyatta Road, Kiambu. Supplying KEBS-certified cabro blocks, road channels, kerbs, culverts, and fence posts for infrastructure and residential construction.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>KEBS Certified &bull; KeNHA Approved Specs</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onScrollTo('home')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Home &amp; Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Product Portfolio (7 Items)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('advantage')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Why Us (Kenyatta Road Yard)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('quote')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  Request a Custom Quote
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Products Catalog */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
              Precast Products
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Cabro Paving Blocks (50 / 60 / 80mm)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Concrete Kerbs (Bullnose &amp; Chamfered)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Precast Road Channels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Precast Drainage Culverts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Reinforced Fence Posts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Shallow Drains &amp; Dish Channels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('products')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  &bull; Precast Paving Slabs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
              Contact &amp; Location
            </h4>
            <p className="text-xs text-slate-400 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Murram, Kenyatta Road, Kiambu County, Kenya</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>+254 700 000 000</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>info@panelproprecast.co.ke</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2.5 pt-1">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Mon - Sat: 7:30 AM – 5:30 PM</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 PanelPro Precast Ltd. All Rights Reserved. Blue &amp; Grey Industrial Theme.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
