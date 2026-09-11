import React, { useState } from 'react';
import { MapPin, Phone, Mail, Menu, X, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenHtmlModal?: () => void;
  onScrollTo: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollTo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
      {/* Top Utility Bar in Blue & Dark Slate */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <a
              href="https://maps.app.goo.gl/CMMrbTn4ufjdQSvV7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-blue-300 transition-colors font-medium"
              title="Open location on Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>&ldquo;Exit 14 Kenyatta Road&rdquo; Juja, Kiambu County</span>
            </a>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-blue-400" /> KEBS Certified Batching
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="tel:0791064684" className="flex items-center gap-1.5 hover:text-blue-300 transition-colors font-medium">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>0791064684</span>
              <span className="hidden lg:inline text-slate-500 font-normal">(+254 791 064 684)</span>
            </a>
            <span className="text-slate-700">|</span>
            <a href="mailto:info@panelproprecast.co.ke" className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>info@panelproprecast.co.ke</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar in Blue and Slate */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo with Official Emblem */}
        <div 
          onClick={() => handleNavClick('home')}
          className="cursor-pointer transition-transform hover:opacity-95"
          title="PanelPro Precast and Logistics Ltd"
        >
          <Logo variant="light" size="md" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => handleNavClick('home')}
            className="text-slate-700 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick('products')}
            className="text-slate-700 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Products
          </button>
          <button 
            onClick={() => handleNavClick('advantage')}
            className="text-slate-700 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Why Us
          </button>
          <button 
            onClick={() => handleNavClick('quote')}
            className="text-slate-700 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Request Quote
          </button>

          {/* Primary CTA button in blue */}
          <button 
            onClick={() => handleNavClick('quote')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-md transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Get Price List
          </button>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-blue-700 rounded-md hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <button 
            onClick={() => handleNavClick('home')}
            className="block w-full text-left font-medium text-slate-800 hover:text-blue-700 py-1.5"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick('products')}
            className="block w-full text-left font-medium text-slate-800 hover:text-blue-700 py-1.5"
          >
            Products
          </button>
          <button 
            onClick={() => handleNavClick('advantage')}
            className="block w-full text-left font-medium text-slate-800 hover:text-blue-700 py-1.5"
          >
            Why Us
          </button>
          <button 
            onClick={() => handleNavClick('quote')}
            className="block w-full text-left font-medium text-slate-800 hover:text-blue-700 py-1.5"
          >
            Request Quote
          </button>
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button 
              onClick={() => handleNavClick('quote')}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md text-center"
            >
              Get Price List
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
