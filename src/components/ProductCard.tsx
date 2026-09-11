import React from 'react';
import { ArrowRight, Check, FileCheck2 } from 'lucide-react';
import { PrecastProduct } from '../types';

interface ProductCardProps {
  product: PrecastProduct;
  onSelectForQuote: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectForQuote }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col group hover:border-blue-300">
      {/* Product Image Container */}
      <div className="relative h-56 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
        <img
          src={product.image}
          alt={product.imageAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-blue-900/90 text-[11px] font-bold uppercase tracking-wider text-blue-100 border border-blue-800 shadow-sm">
          {product.category}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-blue-950 group-hover:text-blue-700 transition-colors">
            {product.name}
          </h3>
          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{product.standard}</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
          {product.description}
        </p>

        {/* Specs Pill List in Blue & Grey */}
        <div className="mb-5 space-y-1.5 bg-slate-50 p-3 rounded-md border border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Available Profiles:</div>
          <div className="flex flex-wrap gap-1.5">
            {product.specs.map((spec, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium"
              >
                <Check className="w-3 h-3 text-blue-600" />
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button: Add to Quote in Blue & Grey */}
        <button
          onClick={() => onSelectForQuote(product.name)}
          className="w-full mt-auto py-2.5 px-4 rounded-md bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer group/btn"
        >
          <span>Add to Quote Request</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
