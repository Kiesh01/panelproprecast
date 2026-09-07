import React, { useState } from 'react';
import { MapPin, Phone, Mail, FileCode2, Menu, X, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenHtmlModal: () => void;
  onScrollTo: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHtmlModal, onScrollTo }) => {
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
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Murram, Kenyatta Road, Kiambu County</span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-blue-400" /> KEBS Certified Batching
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="tel:+254700000000" className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>+254 700 000 000</span>
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
        {/* Brand Logo in Blue & Slate Grey */}
        <div 
          onClick={() => handleNavClick('home')}
          className="cursor-pointer flex items-center gap-2 select-none"
        >
          <div className="w-9 h-9 rounded-md bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-sm border border-blue-800">
            P
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight">PanelPro</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight ml-0.5">Precast</span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-2 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
              Ltd
            </span>
          </div>
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

          {/* HTML Code Source viewer button */}
          <button
            onClick={onOpenHtmlModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300 transition-colors cursor-pointer"
            title="View updated HTML source with replaced images & blue/grey theme"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Updated HTML Code</span>
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
            onClick={onOpenHtmlModal}
            className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 rounded-md text-xs font-medium flex items-center gap-1"
          >
            <FileCode2 className="w-4 h-4 text-blue-600" />
            <span>HTML</span>
          </button>
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
              onClick={() => {
                onOpenHtmlModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 bg-slate-100 text-slate-700 rounded-md border border-slate-300"
            >
              <FileCode2 className="w-4 h-4 text-blue-600" />
              View Updated HTML Source
            </button>
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
