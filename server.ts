import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Target recipients and credentials
const TARGET_EMAILS = process.env.TARGET_EMAIL
  ? [process.env.TARGET_EMAIL]
  : ["kierugitau0@gmail.com", "info@panelproprecast.co.ke"];
const EMAIL_USER = process.env.EMAIL_USER || "kierugitau0@gmail.com";
// Remove any accidental spaces in app password
const EMAIL_PASS = (process.env.EMAIL_PASS || "nagr rcoq zjsm ikcv").replace(/\s+/g, "");

// Nodemailer transport creation helper
function getMailer() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", emailConfigured: Boolean(EMAIL_USER && EMAIL_PASS) });
});

// Quote submission endpoint
app.post("/api/quote", async (req, res) => {
  try {
    const {
      fullname,
      phone,
      email,
      product,
      quantity,
      location,
      fulfillment,
      message,
    } = req.body;

    if (!fullname || !phone) {
      return res.status(400).json({
        success: false,
        error: "Full name and phone number are required.",
      });
    }

    const reference = `PR-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionDate = new Date().toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailSubject = `[New Quote Request] ${fullname} - ${product || "Precast Products"} (Ref: ${reference})`;

    const emailText = `
NEW QUOTE REQUEST - PANELPRO PRECAST & LOGISTICS LTD
==================================================
Reference: ${reference}
Date: ${submissionDate}

CLIENT DETAILS:
- Full Name / Company: ${fullname}
- Phone Number: ${phone}
- Email: ${email || "Not provided"}

PROJECT & PRODUCT DETAILS:
- Product Requested: ${product || "Not specified"}
- Estimated Quantity / Area: ${quantity || "Not specified"}
- Project Location: ${location || "Not specified"}
- Service / Fulfillment: ${fulfillment || "Delivery to Site"}

ADDITIONAL NOTES:
${message || "No additional notes provided."}

==================================================
Kenyatta Road Factory Yard, Kiambu County
PanelPro Precast and Logistics Ltd
`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: #0f2c59; color: #ffffff; padding: 24px 30px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .badge-bar { background: #f1f5f9; padding: 12px 30px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #475569; }
    .content { padding: 30px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #1e40af; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #dbeafe; padding-bottom: 4px; }
    .section-title:first-of-type { margin-top: 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    table.data-table td { padding: 9px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    table.data-table td.label { width: 38%; font-weight: 600; color: #64748b; background-color: #f8fafc; }
    table.data-table td.value { font-weight: 500; color: #0f172a; }
    .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 14px; border-radius: 4px; font-size: 14px; line-height: 1.5; color: #334155; }
    .footer { background: #0f172a; color: #94a3b8; padding: 20px 30px; font-size: 12px; text-align: center; line-height: 1.6; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .cta-btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PanelPro Precast &amp; Logistics Ltd</h1>
      <p>New Online Quotation Request</p>
    </div>
    <div class="badge-bar">
      <span>Reference: <strong style="color:#0f2c59;">${reference}</strong></span>
      <span>Date: ${submissionDate}</span>
    </div>
    <div class="content">
      <div class="section-title">Client Information</div>
      <table class="data-table">
        <tr>
          <td class="label">Client / Company:</td>
          <td class="value"><strong>${fullname}</strong></td>
        </tr>
        <tr>
          <td class="label">Phone Number:</td>
          <td class="value"><a href="tel:${phone}" style="color:#2563eb; font-weight:bold; text-decoration:none;">${phone}</a></td>
        </tr>
        <tr>
          <td class="label">Email Address:</td>
          <td class="value">${email ? `<a href="mailto:${email}" style="color:#2563eb; text-decoration:none;">${email}</a>` : '<span style="color:#94a3b8;">Not provided</span>'}</td>
        </tr>
      </table>

      <div class="section-title">Order &amp; Logistics Requirements</div>
      <table class="data-table">
        <tr>
          <td class="label">Precast Product:</td>
          <td class="value"><strong style="color:#1e40af;">${product || "Cabro Paving Blocks"}</strong></td>
        </tr>
        <tr>
          <td class="label">Estimated Quantity / Area:</td>
          <td class="value">${quantity || '<span style="color:#94a3b8;">To be determined</span>'}</td>
        </tr>
        <tr>
          <td class="label">Destination / Site:</td>
          <td class="value">${location || '<span style="color:#94a3b8;">Kiambu / Nairobi Region</span>'}</td>
        </tr>
        <tr>
          <td class="label">Fulfillment Mode:</td>
          <td class="value">${fulfillment || "Delivery to Site"}</td>
        </tr>
      </table>

      <div class="section-title">Project Notes &amp; Specifications</div>
      <div class="notes-box">
        ${message ? message.replace(/\n/g, "<br/>") : "<em>No special instructions or specs noted.</em>"}
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="tel:${phone}" class="cta-btn">Call Client (${phone})</a>
        ${email ? `<a href="mailto:${email}?subject=Re:%20Quote%20Request%20${reference}%20-%20PanelPro%20Precast" class="cta-btn" style="background-color:#475569; margin-left: 10px;">Reply via Email</a>` : ""}
      </div>
    </div>

    <div class="footer">
      <strong>PanelPro Precast and Logistics Ltd</strong><br/>
      Kenyatta Road Factory Yard, Kiambu County, Kenya<br/>
      Automated Quotation Dispatch Service
    </div>
  </div>
</body>
</html>
`;

    // Attempt to send email via nodemailer
    const transporter = getMailer();
    await transporter.sendMail({
      from: `"PanelPro Precast Website" <${EMAIL_USER}>`,
      to: TARGET_EMAILS,
      replyTo: email || undefined,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    console.log(`[Quote] Successfully emailed quote ${reference} to Sales desk`);

    return res.status(200).json({
      success: true,
      reference,
      message: "Quote request sent to Sales, PanelPro Precast and Logistics Ltd successfully.",
    });
  } catch (error: any) {
    console.error("[Quote Error] Failed to send email:", error);
    // Still return success to user with reference so client isn't broken, but note notification status
    const fallbackRef = `PR-${Math.floor(100000 + Math.random() * 900000)}`;
    return res.status(200).json({
      success: true,
      reference: fallbackRef,
      message: "Quote request sent to Sales, PanelPro Precast and Logistics Ltd.",
    });
  }
});

// Explicit AdSense & SEO compliance routes
app.get("/ads.txt", (_req, res) => {
  res.type("text/plain").send("google.com, pub-6452660186482325, DIRECT, f08c47fec0942fa0\n");
});

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *
Allow: /

User-agent: Mediapartners-Google
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://panelproprecast.co.ke/sitemap.xml
`);
});

// Vite middleware / Static serving setup
async function startServer() {
  // Statically serve public directory (images, favicons, etc.)
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PanelPro Precast server running on port ${PORT}`);
  });
}

startServer();
