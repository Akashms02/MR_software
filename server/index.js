import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Email service is running' });
});

// Post route to send contact details
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, teamSize } = req.body;

  // Server-side validation
  if (!name || !email || !phone || !company || !teamSize) {
    return res.status(400).json({
      success: false,
      message: 'All fields (name, email, phone, company, teamSize) are required.',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address format.',
    });
  }

  // Validate phone format (10 digit)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format. Must be a 10-digit number.',
    });
  }

  try {
    let transporter;
    let recipientEmail = process.env.ADMIN_EMAIL;
    let isTestAccount = false;

    // Check if real SMTP config exists
    const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com' && process.env.SMTP_PASS;

    if (hasSmtpConfig) {
      console.log('[Email Server] Using configured SMTP transporter...');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log('[Email Server] SMTP credentials not set. Creating automatic Ethereal test account...');
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      isTestAccount = true;
      recipientEmail = 'admin@example.com'; // Dummy fallback recipient

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    // HTML Email Template matching the Medistrax design system
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Live Demo Booking Request</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f7f9f7;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f7f9f7;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            border: 1px solid #eef2ef;
          }
          .header {
            background-color: #0D2411;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .header p {
            color: #E5F7E3;
            margin: 10px 0 0 0;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 35px;
          }
          .intro {
            font-size: 16px;
            color: #5C715E;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 30px;
          }
          .info-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 35px;
            border: 1px solid #eef2ef;
            border-radius: 16px;
            overflow: hidden;
          }
          .info-table th {
            background-color: #F8FAF8;
            color: #0D2411;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 16px 20px;
            text-align: left;
            border-bottom: 1px solid #eef2ef;
            width: 35%;
          }
          .info-table td {
            padding: 16px 20px;
            color: #0D2411;
            font-size: 15px;
            font-weight: 500;
            border-bottom: 1px solid #eef2ef;
            background-color: #ffffff;
          }
          .info-table tr:last-child th,
          .info-table tr:last-child td {
            border-bottom: none;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: #E5F7E3;
            color: #28823A;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
          }
          .cta-box {
            text-align: center;
            background-color: #F8FAF8;
            border-radius: 16px;
            padding: 25px;
            border: 1px dashed #28823A;
          }
          .cta-box p {
            color: #5C715E;
            font-size: 14px;
            margin: 0 0 15px 0;
            font-weight: 500;
          }
          .btn {
            display: inline-block;
            background-color: #28823A;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 4px 12px rgba(40, 130, 58, 0.15);
          }
          .footer {
            background-color: #F8FAF8;
            text-align: center;
            padding: 25px;
            border-top: 1px solid #eef2ef;
          }
          .footer p {
            font-size: 12px;
            color: #a3b3a5;
            margin: 0;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <p>Medistrax Notification</p>
              <h1>New Live Demo Request</h1>
            </div>
            <div class="content">
              <p class="intro">
                Hello Administrator,<br><br>
                A customer has requested a live demo from the Medistrax Landing Page. Here are the contact and business details provided:
              </p>
              
              <table class="info-table">
                <tr>
                  <th>Full Name</th>
                  <td>${name}</td>
                </tr>
                <tr>
                  <th>Business Email</th>
                  <td><a href="mailto:${email}" style="color: #28823A; text-decoration: none; font-weight: 600;">${email}</a></td>
                </tr>
                <tr>
                  <th>Phone Number</th>
                  <td><a href="tel:${phone}" style="color: #28823A; text-decoration: none; font-weight: 600;">${phone}</a></td>
                </tr>
                <tr>
                  <th>Company Name</th>
                  <td>${company}</td>
                </tr>
                <tr>
                  <th>Est. Team Size</th>
                  <td><span class="badge">${teamSize} Representatives</span></td>
                </tr>
              </table>
              
              <div class="cta-box">
                <p>Click below to reply or contact the lead directly via email:</p>
                <a href="mailto:${email}?subject=Medistrax%20Live%20Demo%20Booking" class="btn">Reach Out to Client</a>
              </div>
            </div>
            <div class="footer">
              <p>
                This email was generated automatically by the Medistrax contact API.<br>
                &copy; 2026 Medistrax. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: hasSmtpConfig ? `"Medistrax Forms" <${process.env.SMTP_USER}>` : '"Medistrax Forms" <no-reply@medistrax.com>',
      to: recipientEmail,
      subject: `📢 Live Demo Request: ${name} from ${company}`,
      text: `New Live Demo Booking Request\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${company}\nTeam Size: ${teamSize}`,
      html: htmlContent,
      replyTo: email
    };

    const info = await transporter.sendMail(mailOptions);

    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Server] 📧 Test email successfully sent!`);
      console.log(`[Email Server] 🔗 Preview URL: ${previewUrl}`);
      return res.status(200).json({
        success: true,
        message: 'Demo request received (test SMTP Ethereal mode).',
        previewUrl: previewUrl,
        isTest: true
      });
    }

    console.log('[Email Server] 📧 Email successfully sent to admin.');
    return res.status(200).json({
      success: true,
      message: 'Demo request successfully emailed to admin.'
    });

  } catch (error) {
    console.error('[Email Server] ❌ Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request and send email.',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Email Server] Server is running on port ${PORT}`);
});
