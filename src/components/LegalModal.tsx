import React from 'react';
import { X, ShieldCheck, FileText, Lock, Cookie, ExternalLink } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  activeDoc: LegalDocType;
  onClose: () => void;
  onSelectDoc: (doc: LegalDocType) => void;
  onOpenCookieSettings?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  activeDoc,
  onClose,
  onSelectDoc,
  onOpenCookieSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <h2 id="legal-modal-title" className="text-lg font-bold tracking-tight text-white">
                Legal &amp; Regulatory Compliance
              </h2>
              <p className="text-xs text-slate-400">
                PanelPro Precast Ltd &bull; Exit 14 Kenyatta Road, Juja, Kiambu County
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close legal documents modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => onSelectDoc('privacy')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeDoc === 'privacy'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy (AdSense Compliant)</span>
          </button>
          <button
            onClick={() => onSelectDoc('terms')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeDoc === 'terms'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms &amp; Conditions</span>
          </button>
          <button
            onClick={() => onSelectDoc('cookies')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeDoc === 'cookies'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Cookie className="w-4 h-4" />
            <span>Cookie Policy</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
          {activeDoc === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                  Last Updated: September 2026
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">
                  Privacy Policy &amp; Google Advertising Disclosures
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Compliant with the Kenya Data Protection Act 2019, General Data Protection Regulation (GDPR), and Google AdSense Publisher Terms.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">1. Introduction &amp; Data Controller</h4>
                <p>
                  PanelPro Precast Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), registered in Kenya and operating our precast concrete manufacturing facility at <strong>Exit 14 Kenyatta Road, Juja, Kiambu County</strong>, respects your privacy and is committed to protecting your personal data. This Privacy Policy informs you how we collect, use, store, and safeguard your data when you visit our website (<strong>https://panelproprecast.co.ke</strong>), request product quotes, or interact with our online services.
                </p>
              </section>

              {/* CRITICAL GOOGLE ADSENSE DISCLOSURE SECTION */}
              <section className="space-y-3 p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="text-base">2. Google AdSense &amp; Third-Party Advertising Disclosures</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-800">
                  This website displays advertisements served by <strong>Google AdSense</strong> and related Google marketing services. In accordance with Google’s Advertising and Publisher Policies, we inform you of the following:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-700">
                  <li>
                    <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies, web beacons, and unique device identifiers to serve advertisements based on a user&rsquo;s prior visits to this website or other websites on the Internet.
                  </li>
                  <li>
                    <strong>Google Advertising Cookies:</strong> Google&rsquo;s use of advertising cookies (such as the DoubleClick cookie) enables Google and its partner advertising networks to serve relevant ads to our users based on their visits to our site and/or other sites on the Internet.
                  </li>
                  <li>
                    <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising by visiting the official Google Ads Settings page at{' '}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-semibold underline inline-flex items-center gap-1"
                    >
                      <span>Google Ads Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    . Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-semibold underline inline-flex items-center gap-1"
                    >
                      <span>www.aboutads.info</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://www.youronlinechoices.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-semibold underline inline-flex items-center gap-1"
                    >
                      <span>Your Online Choices (EU)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Non-Personalized Ads for Restricted Users:</strong> When a user declines advertising cookies through our on-site Cookie Consent Banner, Google AdSense is instructed to serve contextual, non-personalized advertisements that do not use cookies for user profiling.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">3. Information We Collect</h4>
                <p>We may collect personal information that you voluntarily provide to us when requesting a precast quote or contacting our engineering team:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li><strong>Contact Identifiers:</strong> Name, phone number, email address, company or contractor name.</li>
                  <li><strong>Project Data:</strong> Site location (e.g. Ruiru, Juja, Nairobi), product selection (cabro blocks, hollow pots, beams, culverts, kerbs), required quantities, and fulfillment specifications.</li>
                  <li><strong>Technical &amp; Log Data:</strong> Internet Protocol (IP) address, browser type, operating system, referring URLs, access timestamps, and device diagnostic data collected automatically via server access logs.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">4. How We Use Your Information</h4>
                <p>We process your personal information strictly for legitimate commercial and engineering purposes:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Generating and dispatching official bill of quantities (BOQ) and price quotations.</li>
                  <li>Organizing logistics, crane truck delivery, and factory yard self-collection protocols.</li>
                  <li>Ensuring KEBS structural batch compliance and client communication.</li>
                  <li>Complying with statutory Kenyan tax (KRA) and corporate recordkeeping obligations.</li>
                  <li>Preventing fraud, safeguarding network infrastructure, and analyzing aggregate website performance.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">5. Data Retention &amp; Security</h4>
                <p>
                  We implement robust technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Quotation records are retained for auditing and warranty tracking purposes for up to seven (7) years in accordance with Kenyan commercial law.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">6. Your Data Protection Rights</h4>
                <p>Under the Kenya Data Protection Act 2019 and international regulations (GDPR), you possess the right to:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Request access to copies of your personal data held by us.</li>
                  <li>Request correction of inaccurate or incomplete information.</li>
                  <li>Request erasure of your data where lawful grounds exist.</li>
                  <li>Object to or restrict the processing of your personal information.</li>
                  <li>Withdraw consent at any time without affecting lawful processing conducted prior to withdrawal.</li>
                </ul>
                <p className="text-xs text-slate-600 mt-1">
                  To exercise any of these rights, contact our Data Protection Officer at{' '}
                  <a href="mailto:info@panelproprecast.co.ke" className="text-blue-700 font-semibold underline">
                    info@panelproprecast.co.ke
                  </a>
                  .
                </p>
              </section>

              <section className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">7. Contact Information</h4>
                <p className="text-xs sm:text-sm">
                  <strong>PanelPro Precast Ltd</strong><br />
                  Physical Location: Exit 14 Kenyatta Road, Juja, Kiambu County, Kenya<br />
                  Direct Telephone: +254 791 064 684 / 0791064684<br />
                  Official Email: info@panelproprecast.co.ke
                </p>
              </section>
            </div>
          )}

          {activeDoc === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                  Standard Commercial Conditions
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">
                  Terms of Service &amp; Supply Agreement
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Governing all quotation requests, manufacturing orders, and supply of precast concrete materials.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">1. Acceptance of Terms</h4>
                <p>
                  By accessing the website of PanelPro Precast Ltd or requesting a quotation, you agree to be bound by these Terms and Conditions and all applicable Kenyan laws and regulations. If you do not agree with any part of these terms, please refrain from using this website or ordering materials.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">2. Quotation Validity &amp; Pricing</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Quotations issued via our website or sales desk remain valid for thirty (30) calendar days from issuance, subject to raw material (cement, aggregate, steel) price fluctuations.</li>
                  <li>Prices quoted exclude VAT unless explicitly indicated as VAT-inclusive.</li>
                  <li>Delivery charges are computed based on transit distance from our Exit 14 Kenyatta Road yard to your project site and offloading equipment requirements.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">3. Manufacturing Specifications &amp; KEBS Standards</h4>
                <p>
                  All precast products (including Cabro paving blocks, hollow pots, beams, road channels, kerbs, and culverts) are manufactured to comply with Kenya Bureau of Standards (KEBS) compressive strength benchmarks (ranging from 20 MPa to 49 MPa depending on product category). Batch test certificates are provided upon formal request for civil and engineering projects.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">4. Delivery, Offloading &amp; Inspection</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li><strong>Site Access:</strong> The client is responsible for ensuring clear, safe, and stable road access suitable for heavy commercial multi-axle trucks and crane flatbeds.</li>
                  <li><strong>Receiving &amp; Inspection:</strong> Materials must be inspected by the client or authorized site agent at the point of delivery before signing dispatch delivery notes.</li>
                  <li><strong>Breakages:</strong> Minor edge chipping customary to heavy concrete transit (&le;2%) is standard in the construction industry. Any structural transit breakage exceeding 2% must be recorded on the delivery note immediately upon offloading.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">5. Intellectual Property</h4>
                <p>
                  All content, technical diagrams, product photography, trademarks, and branding on this website remain the exclusive intellectual property of PanelPro Precast Ltd and are protected under Kenyan copyright legislation.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">6. Governing Law &amp; Jurisdiction</h4>
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the Laws of the Republic of Kenya. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts of Kenya.
                </p>
              </section>
            </div>
          )}

          {activeDoc === 'cookies' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                  Cookie Transparency
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">
                  Cookie Policy &amp; Tracking Notice
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explaining how and why we use cookies, including Google AdSense advertising cookies.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">1. What Are Cookies?</h4>
                <p>
                  Cookies are small text files stored on your browser or mobile device when you access websites. They are widely used to make websites work efficiently, remember your preferences, protect security, and deliver relevant advertisements.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="font-bold text-slate-900 text-base">2. Categories of Cookies We Use</h4>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">A. Strictly Necessary Cookies</span>
                      <span className="text-[11px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">Always Active</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Essential for the core functionality of the website, such as load balancing, CSRF security, saving your quote form inputs, and remembering your cookie consent preference. These cannot be switched off.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">B. Performance &amp; Analytics Cookies</span>
                      <span className="text-[11px] font-bold text-slate-600 uppercase bg-slate-200 px-2 py-0.5 rounded">Optional</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Allow us to count visits and traffic sources so we can measure and improve the performance of our precast catalog. Information is aggregated and anonymous.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">C. Advertising &amp; Google AdSense Cookies</span>
                      <span className="text-[11px] font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded">Targeting &amp; Ads</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      May be set through our site by third-party advertising partners such as <strong>Google AdSense</strong> (Doubleclick). They build a profile of your interests to show you relevant advertisements on other websites. If you do not allow these cookies, you will experience less targeted advertising.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">3. Managing Your Cookie Choices</h4>
                <p>
                  You can change your cookie preferences on this website at any time by clicking the button below or using the &ldquo;Cookie Settings&rdquo; link situated in our website footer.
                </p>
                {onOpenCookieSettings && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCookieSettings();
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Cookie className="w-4 h-4" />
                      <span>Open Cookie Preferences Manager</span>
                    </button>
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">4. Browser-Level Controls</h4>
                <p>
                  Most web browsers allow you to manage cookie settings through their options menu (Chrome, Safari, Firefox, Edge). To opt out of Google Analytics across all websites, visit{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Google Analytics Opt-out Browser Add-on</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            For regulatory or compliance inquiries: <span className="font-semibold text-slate-700">info@panelproprecast.co.ke</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
