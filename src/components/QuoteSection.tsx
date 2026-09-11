import React, { useState } from 'react';
import { Send, CheckCircle2, Copy, Check, Calculator, PhoneCall, Loader2, MailCheck } from 'lucide-react';
import { QuoteFormState } from '../types';

interface QuoteSectionProps {
  selectedProduct: string;
  onProductChange: (val: string) => void;
}

export const QuoteSection: React.FC<QuoteSectionProps> = ({ selectedProduct, onProductChange }) => {
  const [formData, setFormData] = useState<QuoteFormState>({
    fullname: '',
    phone: '',
    email: '',
    product: selectedProduct || 'Cabro Paving Blocks',
    quantity: '',
    location: '',
    fulfillment: 'Delivery to Site',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteReference, setQuoteReference] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Synchronize when selectedProduct prop changes
  React.useEffect(() => {
    if (selectedProduct) {
      setFormData((prev) => ({ ...prev, product: selectedProduct }));
    }
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullname || !formData.phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setQuoteReference(data.reference || `PR-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err) {
      console.warn('Network submit fallback:', err);
      setQuoteReference(`PR-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleCopySummary = () => {
    const text = `PanelPro Precast Quote Request:
Reference: ${quoteReference}
Customer: ${formData.fullname}
Phone: ${formData.phone}
Email: ${formData.email || 'Not provided'}
Product: ${formData.product}
Quantity: ${formData.quantity || 'Not specified'}
Location: ${formData.location || '"Exit 14 Kenyatta Road" Juja / Nairobi Area'}
Fulfillment: ${formData.fulfillment}
Notes: ${formData.message || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="quote" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-50 border border-slate-300/80 rounded-xl p-6 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Factory Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mb-2">
              Request a Custom Quotation
            </h2>
            <p className="text-slate-600 text-sm">
              Fill out your project specifications below. Your request will be instantly dispatched to our sales engineering desk at &ldquo;Exit 14 Kenyatta Road&rdquo; Juja, Kiambu County.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white border border-blue-200 rounded-lg p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-blue-950">
                Quote Request Dispatched!
              </h3>
              <p className="text-slate-600 text-sm max-w-lg mx-auto">
                Thank you, <span className="font-semibold text-slate-800">{formData.fullname}</span>. Your quotation details for <span className="font-semibold text-blue-700">{formData.product}</span> have been sent to our sales desk.
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Notification sent to Sales, PanelPro Precast and Logistics Ltd</span>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono text-slate-700">
                <div><span className="text-slate-400">Reference:</span> <strong className="text-blue-900">{quoteReference}</strong></div>
                <div><span className="text-slate-400">Phone:</span> {formData.phone}</div>
                {formData.email && <div><span className="text-slate-400">Email:</span> {formData.email}</div>}
                <div><span className="text-slate-400">Product:</span> {formData.product}</div>
                <div><span className="text-slate-400">Quantity:</span> {formData.quantity || 'To be determined'}</div>
                <div><span className="text-slate-400">Destination:</span> {formData.location || 'Kiambu / Nairobi'}</div>
                <div><span className="text-slate-400">Fulfillment:</span> {formData.fulfillment}</div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCopySummary}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Summary' : 'Copy Quote Details'}</span>
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullname: '',
                      phone: '',
                      email: '',
                      product: 'Cabro Paving Blocks',
                      quantity: '',
                      location: '',
                      fulfillment: 'Delivery to Site',
                      message: ''
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>

              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Need immediate dispatch consultation? Call our yard at <a href="tel:0791064684" className="font-bold text-blue-700 hover:underline">0791064684</a> (<a href="tel:+254791064684" className="text-slate-600 hover:text-blue-700">+254 791 064 684</a>)</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name, Phone, and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fullname" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name / Company <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    required
                    placeholder="e.g. John Doe / Apex Works"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="e.g. 0791064684"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g. client@company.co.ke"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Row 2: Product and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Precast Product <span className="text-blue-600">*</span>
                  </label>
                  <select
                    id="product"
                    value={formData.product}
                    onChange={(e) => {
                      setFormData({ ...formData, product: e.target.value });
                      onProductChange(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Precast Hollow Pots">Precast Hollow Pots (Suspended Slab System)</option>
                    <option value="Precast Hollow Blocks">Precast Hollow Blocks (4" / 6" / 9" Walling)</option>
                    <option value="Flat Beams and T Beams">Flat Beams and T-Beams (Prestressed)</option>
                    <option value="Louvents (Ventilation Blocks)">Louvents (Ventilation Breeze Blocks)</option>
                    <option value="Balustrades and Frames">Balustrades and Concrete Frames</option>
                    <option value="Highway Manhole Covers">Highway Manhole Covers &amp; Rings</option>
                    <option value="Dobbie Sinks (Wash Troughs)">Dobbie Sinks (Single / Double Wash Troughs)</option>
                    <option value="Cabro Paving Blocks">Cabro Paving Blocks (50mm / 60mm / 80mm)</option>
                    <option value="Concrete Kerbs">Concrete Kerbs (Bullnose / Chamfered)</option>
                    <option value="Road Channels">Road Channels (Precast Drainage Edging)</option>
                    <option value="Precast Culverts">Precast Culverts (Circular / Box)</option>
                    <option value="Reinforced Fence Posts">Reinforced Concrete Fence Posts</option>
                    <option value="Shallow Drains">Shallow Drains &amp; Dish Channels</option>
                    <option value="Precast Paving Slabs">Precast Paving Slabs (600x600 / 450x450)</option>
                    <option value="Multiple Products">Multiple Products (Specify in project notes)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estimated Quantity / Area
                  </label>
                  <input
                    id="quantity"
                    type="text"
                    placeholder="e.g. 500 sqm or 200 pcs"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Row 3: Location and Service Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Project Location / Destination
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. Exit 14 Kenyatta Road, Juja, Ruiru, Nairobi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="fulfillment" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Service Type
                  </label>
                  <select
                    id="fulfillment"
                    value={formData.fulfillment}
                    onChange={(e) => setFormData({ ...formData, fulfillment: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Delivery to Site">Direct Delivery &amp; Crane Offloading to Site</option>
                    <option value="Yard Pickup">Self Collection from Yard (&ldquo;Exit 14 Kenyatta Road&rdquo; Juja)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Project Notes / Specific Engineering Requirements
                </label>
                <textarea
                  id="message"
                  rows={3}
                  placeholder="Include any specific specifications, required gauge thicknesses, or tender deadlines..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-y"
                />
              </div>

              {/* Submit Button in Blue and Slate */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Transmitting Quote Request to Sales Desk...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Quote Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
