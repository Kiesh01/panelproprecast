import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, FileCode } from 'lucide-react';

interface HtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HtmlModal: React.FC<HtmlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary SEO Meta Tags -->
    <title>PanelPro Precast Ltd | Quality Concrete &amp; Precast Solutions</title>
    <meta name="title" content="PanelPro Precast Ltd | Quality Concrete &amp; Precast Solutions">
    <meta name="description" content="Leading precast concrete manufacturer along Kenyatta Road, Kiambu. Supplying KEBS-certified Cabro paving blocks, concrete kerbs, road channels, culverts, and fence posts across Nairobi and Kenya.">
    <meta name="keywords" content="precast concrete Kenya, cabro paving blocks Kiambu, concrete kerbs Nairobi, road channels Kenya, precast culverts Kiambu, reinforced fence posts, shallow drains, Kenyatta Road concrete manufacturer">
    <meta name="author" content="PanelPro Precast Ltd">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="https://panelproprecast.co.ke/">

    <!-- Geo & Local SEO Meta Tags (Kiambu / Kenyatta Road / Kenya) -->
    <meta name="geo.region" content="KE-13">
    <meta name="geo.placename" content="Kenyatta Road, Kiambu County, Kenya">
    <meta name="geo.position" content="-1.1512;36.9821">
    <meta name="ICBM" content="-1.1512, 36.9821">

    <!-- Open Graph / Facebook / WhatsApp Meta Tags -->
    <meta property="og:type" content="business.business">
    <meta property="og:site_name" content="PanelPro Precast Ltd">
    <meta property="og:title" content="PanelPro Precast Ltd | Quality Concrete &amp; Precast Solutions">
    <meta property="og:description" content="Leading precast concrete manufacturer along Kenyatta Road, Kiambu. Supplying KEBS-certified Cabro paving blocks, concrete kerbs, road channels, culverts, and fence posts across Nairobi and Kenya.">
    <meta property="og:image" content="roadchannel.jpg">
    <meta property="og:image:alt" content="PanelPro Precast Concrete Products Factory Yard Kenyatta Road">
    <meta property="og:locale" content="en_KE">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="PanelPro Precast Ltd | Quality Concrete &amp; Precast Solutions">
    <meta name="twitter:description" content="Leading precast concrete manufacturer along Kenyatta Road, Kiambu. Supplying KEBS-certified Cabro paving blocks, concrete kerbs, road channels, culverts, and fence posts.">
    <meta name="twitter:image" content="roadchannel.jpg">

    <!-- Structured Data: LocalBusiness & Manufacturer JSON-LD Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ManufacturingBusiness",
      "name": "PanelPro Precast Ltd",
      "description": "Manufacturer and supplier of high-strength KEBS-certified precast concrete products including cabro paving blocks, road kerbs, drainage channels, culverts, and fencing posts.",
      "url": "https://panelproprecast.co.ke",
      "telephone": "+254700000000",
      "email": "info@panelproprecast.co.ke",
      "image": "roadchannel.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Murram, Kenyatta Road",
        "addressLocality": "Kiambu",
        "addressRegion": "Kiambu County",
        "postalCode": "00232",
        "addressCountry": "KE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -1.1512,
        "longitude": 36.9821
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "07:30",
          "closes": "17:30"
        }
      ],
      "areaServed": [
        { "@type": "City", "name": "Nairobi" },
        { "@type": "AdministrativeArea", "name": "Kiambu County" },
        { "@type": "City", "name": "Ruiru" },
        { "@type": "City", "name": "Juja" },
        { "@type": "City", "name": "Thika" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Precast Concrete Products",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Cabro Paving Blocks" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Concrete Kerbs" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Precast Road Channels" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Precast Culverts" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Reinforced Fence Posts" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Shallow Drains" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Precast Paving Slabs" } }
        ]
      }
    }
    </script>

    <!-- Google Fonts & FontAwesome for Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --primary: #1e3a8a;       /* Deep Industrial Blue */
            --accent: #2563eb;        /* Engineering Royal Blue */
            --accent-hover: #1d4ed8;  /* Deep Navy Blue Hover */
            --dark: #0f172a;          /* Charcoal Slate Dark */
            --light: #f8fafc;         /* Off-white Slate */
            --gray: #64748b;          /* Slate Grey */
            --gray-light: #e2e8f0;    /* Light Slate Border */
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
        body { background-color: var(--light); color: var(--dark); line-height: 1.6; }

        /* Top Bar */
        .top-bar {
            background: var(--dark);
            color: #cbd5e1;
            padding: 10px 5%;
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            flex-wrap: wrap;
            gap: 10px;
        }
        .top-bar div i { color: var(--accent); margin-right: 5px; }

        /* Navigation Header */
        header {
            background: #fff;
            box-shadow: 0 2px 10px rgba(15,23,42,0.06);
            position: sticky;
            top: 0;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 5%;
            border-bottom: 1px solid var(--gray-light);
        }

        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        .logo span { color: var(--accent); }

        nav ul { display: flex; list-style: none; gap: 25px; align-items: center; }
        nav ul li a { text-decoration: none; color: var(--dark); font-weight: 600; font-size: 0.95rem; }
        nav ul li a:hover { color: var(--accent); }

        .btn-quote-nav {
            background: var(--accent);
            color: #fff !important;
            padding: 10px 20px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .btn-quote-nav:hover { background: var(--accent-hover); }

        /* Hero Section */
        .hero {
            background: linear-gradient(rgba(15, 23, 42, 0.82), rgba(30, 58, 138, 0.82)), url('roadchannel.jpg') center/cover;
            color: #fff;
            padding: 100px 5%;
            text-align: center;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 800; }
        .hero p { font-size: 1.15rem; max-width: 700px; margin: 0 auto 30px auto; color: #cbd5e1; }
        .hero-buttons { display: flex; justify-content: center; gap: 15px; }

        .btn { padding: 12px 25px; border-radius: 4px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-primary:hover { background: var(--accent-hover); }
        .btn-secondary { background: transparent; border: 2px solid #94a3b8; color: #fff; }
        .btn-secondary:hover { background: #fff; color: var(--dark); }

        /* Trust Badges */
        .trust-bar {
            background: #fff;
            display: flex;
            justify-content: space-around;
            padding: 30px 5%;
            box-shadow: 0 4px 6px -1px rgba(15,23,42,0.05);
            flex-wrap: wrap;
            gap: 20px;
            border-bottom: 1px solid var(--gray-light);
        }
        .trust-item { display: flex; align-items: center; gap: 15px; }
        .trust-item i { font-size: 2rem; color: var(--accent); }
        .trust-item h4 { font-size: 0.95rem; font-weight: 700; }
        .trust-item p { font-size: 0.8rem; color: var(--gray); }

        /* Products Grid */
        .section { padding: 80px 5%; }
        .section-title { text-align: center; margin-bottom: 50px; }
        .section-title h2 { font-size: 2.2rem; color: var(--primary); margin-bottom: 10px; }
        .section-title p { color: var(--gray); }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }

        .card {
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(15,23,42,0.05);
            transition: transform 0.3s;
            border: 1px solid var(--gray-light);
        }
        .card:hover { transform: translateY(-5px); border-color: #93c5fd; }
        .card img { width: 100%; height: 200px; object-fit: cover; }
        .card-content { padding: 20px; }
        .card-content h3 { font-size: 1.25rem; margin-bottom: 10px; color: var(--primary); }
        .card-content p { font-size: 0.9rem; color: var(--gray); margin-bottom: 15px; }
        .card-link { font-weight: 600; color: var(--accent); text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
        .card-link:hover { color: var(--accent-hover); }

        /* Features Section */
        .features-section { background: #f1f5f9; padding: 80px 5%; }
        .feature-box {
            background: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(15,23,42,0.04);
            max-width: 900px;
            margin: 0 auto;
            border-left: 4px solid var(--accent);
        }

        /* Quote Section */
        .quote-section { background: #ffffff; padding: 80px 5%; border-top: 1px solid var(--gray-light); }
        .quote-container {
            max-width: 800px;
            margin: 0 auto;
            background: #f8fafc;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(15,23,42,0.05);
            border: 1px solid var(--gray-light);
        }
        .quote-container h2 { color: var(--primary); text-align: center; margin-bottom: 10px; font-size: 2rem; }
        .quote-container p.subtitle { text-align: center; color: var(--gray); margin-bottom: 30px; font-size: 0.95rem; }

        .form-group { margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }

        .form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 8px; color: var(--dark); }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%; padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 6px;
            font-size: 0.95rem; background: #fff; outline: none; transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
        .form-group textarea { resize: vertical; height: 120px; }

        .btn-submit {
            width: 100%; background: var(--accent); color: #fff; padding: 14px;
            font-size: 1rem; font-weight: 700; border: none; border-radius: 6px; cursor: pointer;
            transition: background 0.3s;
        }
        .btn-submit:hover { background: var(--accent-hover); }

        /* Footer */
        footer { background: var(--dark); color: #cbd5e1; padding: 50px 5% 20px 5%; }
        .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px; }
        .footer-col h4 { color: #fff; margin-bottom: 20px; font-size: 1.1rem; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 10px; }
        .footer-col ul li a { color: #cbd5e1; text-decoration: none; }
        .footer-col ul li a:hover { color: #93c5fd; }
        .footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid #334155; font-size: 0.85rem; }
    </style>
</head>
<body>

    <!-- Top Utility Bar -->
    <div class="top-bar">
        <div><i class="fa-solid fa-location-dot"></i> Murram, Kenyatta Road, Kiambu County</div>
        <div>
            <i class="fa-solid fa-phone"></i> +254 700 000 000 &nbsp;|&nbsp; 
            <i class="fa-solid fa-envelope"></i> info@panelproprecast.co.ke
        </div>
    </div>

    <!-- Main Header -->
    <header>
        <div class="logo">PanelPro<span>Precast</span></div>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#advantage">Why Us</a></li>
                <li><a href="#quote">Request Quote</a></li>
                <li><a href="#quote" class="btn-quote-nav">Get Price List</a></li>
            </ul>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <h1>High-Strength Precast &amp; Concrete Solutions</h1>
        <p>Supplying durable, KEBS-standard cabro blocks, kerbs, culverts, and fencing posts to residential, commercial, and highway infrastructure projects across Nairobi and Kiambu.</p>
        <div class="hero-buttons">
            <a href="#products" class="btn btn-primary">Explore Products</a>
            <a href="#quote" class="btn btn-secondary">Request a Quote</a>
        </div>
    </section>

    <!-- Trust/Feature Bar -->
    <div class="trust-bar">
        <div class="trust-item">
            <i class="fa-solid fa-certificate"></i>
            <div>
                <h4>KEBS Standard</h4>
                <p>Strict quality assurance &amp; batching</p>
            </div>
        </div>
        <div class="trust-item">
            <i class="fa-solid fa-truck-fast"></i>
            <div>
                <h4>Reliable Logistics</h4>
                <p>Direct site delivery services</p>
            </div>
        </div>
        <div class="trust-item">
            <i class="fa-solid fa-gears"></i>
            <div>
                <h4>Modern Technology</h4>
                <p>Vibration &amp; compaction technology</p>
            </div>
        </div>
    </div>

    <!-- Product Portfolio Section -->
    <section class="section" id="products">
        <div class="section-title">
            <h2>Our Product Portfolio</h2>
            <p>Engineered for maximum durability, uniform dimensions, and cost efficiency.</p>
        </div>
        <div class="grid-container">
            <!-- Product 1: Cabro Paving Blocks (kabro.jpeg) -->
            <div class="card">
                <img src="kabro.jpeg" alt="Cabro Paving Blocks" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Cabro Paving Blocks</h3>
                    <p>Interlocking paving blocks available in 50mm (walkways), 60mm, and 80mm (heavy-duty driveways &amp; parking).</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>

            <!-- Product 2: Concrete Kerbs (concretekerbs.jpeg) -->
            <div class="card">
                <img src="concretekerbs.jpeg" alt="Concrete Kerbs" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Concrete Kerbs</h3>
                    <p>Robust roadside edging units and surface water boundary blocks to protect pavements and manage highway edges.</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>

            <!-- Product 3: Precast Road Channels (roadchannel.jpg) -->
            <div class="card">
                <img src="roadchannel.jpg" alt="Road Channels" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Road Channels</h3>
                    <p>Precast road drainage channels and surface water gutter blocks engineered to prevent road shoulder erosion.</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>

            <!-- Product 4: Precast Culverts (culverts.jpeg) -->
            <div class="card">
                <img src="culverts.jpeg" alt="Culverts" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Precast Culverts</h3>
                    <p>Circular and box culverts engineered to meet Kenya Roads Standards (KeNHA/KURA/KERRA) load parameters.</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>

            <!-- Product 5: Reinforced Fence Posts (fencing-posts.jpg) -->
            <div class="card">
                <img src="fencing-posts.jpg" alt="Fence Posts" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Reinforced Fence Posts</h3>
                    <p>Durable, steel-reinforced concrete posts ranging from 6ft to 10ft—the ideal weatherproof alternative to timber.</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>

            <!-- Product 6: Shallow Drains (shallowdrains.jpg) -->
            <div class="card">
                <img src="shallowdrains.jpg" alt="Shallow Drains" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Shallow Drains</h3>
                    <p>Precast channel units and side slabs designed for smooth surface water discharge in estates and commercial blocks.</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>

            <!-- Product 7: Precast Paving Slabs (pavingslabs.jpeg) -->
            <div class="card">
                <img src="pavingslabs.jpeg" alt="Paving Slabs" referrerpolicy="no-referrer">
                <div class="card-content">
                    <h3>Precast Paving Slabs</h3>
                    <p>High-density textured and smooth precast concrete paving slabs for walkways, commercial plazas, and perimeters.</p>
                    <a href="#quote" class="card-link">Add to Quote <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose Us -->
    <section class="features-section" id="advantage">
        <div class="feature-box">
            <h2 style="color: var(--primary); margin-bottom: 15px;">Strategic Advantage Along Kenyatta Road</h2>
            <p style="margin-bottom: 15px; color: var(--gray);">Located in Kiambu County’s prime growth corridor, PanelPro Precast Ltd offers seamless logistical connectivity to Nairobi, Thika, Juja, and surrounding development sites.</p>
            <p style="color: var(--gray);">Whether you are a major civil contractor managing public tenders or a private homeowner building a gated property, we provide a reliable, one-stop source for all structural precast materials.</p>
        </div>
    </section>

    <!-- Request a Quote Section -->
    <section class="quote-section" id="quote">
        <div class="quote-container">
            <h2>Request a Custom Quotation</h2>
            <p class="subtitle">Fill out the details below, and our sales team will get back to you with competitive pricing and delivery timelines.</p>
            
            <form action="#" method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label for="fullname">Full Name / Company</label>
                        <input type="text" id="fullname" name="fullname" placeholder="e.g. John Doe / Apex Builders" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" placeholder="e.g. +254 712 345 678" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="product">Select Precast Product</label>
                        <select id="product" name="product" required>
                            <option value="">-- Choose Product --</option>
                            <option value="Cabro Paving Blocks">Cabro Paving Blocks (50mm / 60mm / 80mm)</option>
                            <option value="Concrete Kerbs">Concrete Kerbs</option>
                            <option value="Road Channels">Road Channels (Precast Drainage)</option>
                            <option value="Precast Culverts">Precast Culverts (Circular / Box)</option>
                            <option value="Reinforced Fence Posts">Reinforced Concrete Fence Posts</option>
                            <option value="Shallow Drains">Shallow Drains &amp; Slabs</option>
                            <option value="Precast Paving Slabs">Precast Paving Slabs</option>
                            <option value="Multiple Products">Multiple Products (Specify in message)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quantity">Estimated Quantity / Area</label>
                        <input type="text" id="quantity" name="quantity" placeholder="e.g. 500 sqm or 150 pieces">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="location">Project Location / Destination</label>
                        <input type="text" id="location" name="location" placeholder="e.g. Ruiru, Kenyatta Road, Kiambu">
                    </div>
                    <div class="form-group">
                        <label for="fulfillment">Service Type</label>
                        <select id="fulfillment" name="fulfillment">
                            <option value="Delivery to Site">Delivery &amp; Offloading to Site</option>
                            <option value="Yard Pickup">Factory Yard Pickup</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="message">Project Notes / Specifications</label>
                    <textarea id="message" name="message" placeholder="Provide any extra details about your project timelines or specific technical requirements..."></textarea>
                </div>

                <button type="submit" class="btn-submit"><i class="fa-solid fa-paper-plane"></i> Submit Quote Request</button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="footer-grid">
            <div class="footer-col">
                <h4>PanelPro Precast Ltd</h4>
                <p>Your trusted manufacturing partner for durable precast concrete products, setting new benchmarks in quality and reliability.</p>
            </div>
            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#products">Product Portfolio</a></li>
                    <li><a href="#advantage">Strategic Location</a></li>
                    <li><a href="#quote">Request a Quote</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Contact Details</h4>
                <p><i class="fa-solid fa-location-dot"></i> Murram, Kenyatta Road, Kiambu</p>
                <p><i class="fa-solid fa-phone"></i> +254 700 000 000</p>
                <p><i class="fa-solid fa-envelope"></i> info@panelproprecast.co.ke</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 PanelPro Precast Ltd. All Rights Reserved.</p>
        </div>
    </footer>

</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'panelpro-precast-updated.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-blue-950 text-base">Updated HTML Source Code</h3>
              <p className="text-xs text-slate-500">
                Images replaced with local precast filenames &bull; Color theme updated to Blue &amp; Grey
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Highlight Bar */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">Image Mappings:</span>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">roadchannel.jpg</code>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">kabro.jpeg</code>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">concretekerbs.jpeg</code>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">culverts.jpeg</code>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">fencing-posts.jpg</code>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">shallowdrains.jpg</code>
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">pavingslabs.jpeg</code>
          </div>
          <div className="text-blue-700 font-semibold">Theme: Blue &amp; Grey</div>
        </div>

        {/* Code Content */}
        <div className="flex-grow p-4 overflow-y-auto bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap">{htmlCode}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <a
            href="/panelpro.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 hover:underline"
          >
            <span>Open Standalone HTML Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-bold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .html</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy HTML Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
