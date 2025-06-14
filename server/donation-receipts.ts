import { DatabaseStorage } from './storage';
import * as htmlPdf from 'html-pdf-node';
import { sendEmail } from './email-service';
import { db } from './db';
import { donations, churches, users } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export class DonationReceiptService {
  constructor(private storage: DatabaseStorage) {}

  async generateReceiptPDF(donationId: string): Promise<Buffer> {
    // Get donation data directly from database
    const donationData = await db
      .select()
      .from(donations)
      .where(eq(donations.id, parseInt(donationId)))
      .limit(1);
    
    if (!donationData.length) {
      throw new Error('Donation not found');
    }
    
    const donation = donationData[0];
    
    // Get church and user data
    const church = await this.storage.getChurch(donation.churchId);
    const donor = await this.storage.getUser(donation.userId);

    const receiptHTML = this.generateReceiptHTML(donation, church, donor);
    
    const options = {
      format: 'A4',
      margin: { top: '1in', right: '0.5in', bottom: '1in', left: '0.5in' }
    };

    const file = { content: receiptHTML };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return pdfBuffer;
  }

  private generateReceiptHTML(donation: any, church: any, donor: any): string {
    const currentDate = new Date().toLocaleDateString();
    const donationDate = new Date(donation.createdAt).toLocaleDateString();
    const receiptNumber = `DON-${donation.id}-${new Date().getFullYear()}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .church-name {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .receipt-title {
          font-size: 20px;
          color: #3b82f6;
          margin-top: 20px;
        }
        .receipt-number {
          font-size: 14px;
          color: #6b7280;
          margin-top: 5px;
        }
        .section {
          margin: 25px 0;
        }
        .section-title {
          font-weight: bold;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #d1d5db;
        }
        .amount-section {
          background: #f8fafc;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .amount-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .amount-value {
          font-size: 36px;
          font-weight: bold;
          color: #1f2937;
        }
        .tax-notice {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .signature-section {
          margin-top: 40px;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="church-name">${church?.name || 'Church Name'}</div>
        <div style="color: #6b7280; margin-top: 5px;">
          ${church?.address || ''}<br>
          ${church?.city || ''}, ${church?.state || ''} ${church?.zipCode || ''}
        </div>
        <div class="receipt-title">Tax-Deductible Donation Receipt</div>
        <div class="receipt-number">Receipt #: ${receiptNumber}</div>
      </div>

      <div class="section">
        <div class="section-title">Donor Information</div>
        <div class="info-item">
          <span>Donor Name:</span>
          <span>${donation.isAnonymous ? 'Anonymous Donor' : (donation.donorName || `${donor?.firstName || ''} ${donor?.lastName || ''}`.trim())}</span>
        </div>
        <div class="info-item">
          <span>Email:</span>
          <span>${donation.isAnonymous ? 'Not disclosed' : (donation.donorEmail || donor?.email || 'Not provided')}</span>
        </div>
        <div class="info-item">
          <span>Donation Date:</span>
          <span>${donationDate}</span>
        </div>
        <div class="info-item">
          <span>Payment Method:</span>
          <span>${this.formatPaymentMethod(donation.paymentMethod)}</span>
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-label">Total Tax-Deductible Donation</div>
        <div class="amount-value">$${donation.amount.toFixed(2)}</div>
        ${donation.isRecurring ? '<div style="margin-top: 10px; color: #3b82f6; font-weight: bold;">Recurring Monthly Gift</div>' : ''}
      </div>

      <div class="section">
        <div class="section-title">Donation Details</div>
        ${donation.purpose ? `
        <div class="info-item">
          <span>Purpose:</span>
          <span>${donation.purpose}</span>
        </div>
        ` : ''}
        ${donation.dedicationType && donation.dedicationName ? `
        <div class="info-item">
          <span>Dedication:</span>
          <span>${donation.dedicationType} ${donation.dedicationName}</span>
        </div>
        ` : ''}
        <div class="info-item">
          <span>Transaction ID:</span>
          <span>${donation.stripePaymentIntentId || donation.id}</span>
        </div>
      </div>

      <div class="tax-notice">
        <strong>Important Tax Information:</strong><br>
        This receipt acknowledges your charitable contribution. No goods or services were provided in exchange for this donation. 
        Please retain this receipt for your tax records. Consult your tax advisor for specific deduction guidelines.
      </div>

      <div class="signature-section">
        <div style="margin-bottom: 20px;">
          <strong>Authorized Representative:</strong>
        </div>
        <div style="margin-top: 50px; border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 5px; font-size: 12px;">
          Church Administrator Signature
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #6b7280;">
          Date: ${currentDate}
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your generous support of our ministry!</p>
        <p>This receipt was generated automatically by SoapBox Church Management System</p>
        <p>For questions about this donation, please contact: ${church?.email || 'church@example.com'}</p>
      </div>
    </body>
    </html>
    `;
  }

  private formatPaymentMethod(method: string): string {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      case 'check':
        return 'Check';
      default:
        return 'Online Payment';
    }
  }

  async sendReceiptEmail(donationId: string): Promise<void> {
    // Get donation data directly from database
    const donationData = await db
      .select()
      .from(donations)
      .where(eq(donations.id, parseInt(donationId)))
      .limit(1);
    
    if (!donationData.length) {
      throw new Error('Donation not found');
    }
    
    const donation = donationData[0];
    const church = await this.storage.getChurch(donation.churchId);
    const donor = await this.storage.getUser(donation.userId);
    
    const recipientEmail = donation.donorEmail || donor?.email;
    if (!recipientEmail) {
      throw new Error('No email address available for receipt');
    }

    // Generate PDF receipt
    const pdfBuffer = await this.generateReceiptPDF(donationId);
    
    const receiptNumber = `DON-${donation.id}-${new Date().getFullYear()}`;
    const donationDate = new Date(donation.createdAt).toLocaleDateString();

    const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Thank You for Your Donation!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your generosity makes a difference</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Donation Receipt - ${receiptNumber}</h2>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #6b7280;">Donation Amount:</span>
            <span style="font-weight: bold; font-size: 18px; color: #1f2937;">$${donation.amount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #6b7280;">Date:</span>
            <span style="color: #1f2937;">${donationDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #6b7280;">Church:</span>
            <span style="color: #1f2937;">${church?.name || 'Your Church'}</span>
          </div>
          ${donation.isRecurring ? '<div style="background: #dbeafe; color: #1d4ed8; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold;">Recurring Monthly Gift</div>' : ''}
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <strong style="color: #92400e;">Tax Information:</strong><br>
          <span style="color: #92400e; font-size: 14px;">
            This donation is tax-deductible. Please retain this receipt for your tax records. 
            A detailed PDF receipt is attached to this email.
          </span>
        </div>

        <p style="color: #374151; line-height: 1.6;">
          Your faithful giving helps us continue our mission and ministry in the community. 
          We are grateful for your partnership and pray that God blesses you abundantly.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Blessings,<br><strong>${church?.name || 'Your Church'} Team</strong></p>
          <p style="margin-top: 20px;">
            Questions? Contact us at ${church?.email || 'church@example.com'}
          </p>
        </div>
      </div>
    </div>
    `;

    await sendEmail({
      to: recipientEmail,
      subject: `Donation Receipt - ${receiptNumber}`,
      html: emailContent,
      attachments: [
        {
          filename: `donation-receipt-${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  }

  async generateAnnualStatement(userId: string, year: number): Promise<Buffer> {
    const donations = await this.storage.getUserDonationsForYear(userId, year);
    const user = await this.storage.getUser(userId);
    
    if (donations.length === 0) {
      throw new Error('No donations found for the specified year');
    }

    const church = await this.storage.getChurch(donations[0].churchId);
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    const statementHTML = this.generateAnnualStatementHTML(donations, user, church, year, totalAmount);
    
    const options = {
      format: 'A4',
      margin: { top: '1in', right: '0.5in', bottom: '1in', left: '0.5in' }
    };

    const file = { content: statementHTML };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return pdfBuffer;
  }

  private generateAnnualStatementHTML(donations: any[], user: any, church: any, year: number, totalAmount: number): string {
    const currentDate = new Date().toLocaleDateString();
    const statementNumber = `ANNUAL-${user.id}-${year}`;

    const donationRows = donations.map(donation => {
      const date = new Date(donation.createdAt).toLocaleDateString();
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${date}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${donation.amount.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${donation.purpose || 'General Fund'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${donation.paymentMethod}</td>
        </tr>
      `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Annual Giving Statement ${year}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .church-name {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .statement-title {
          font-size: 20px;
          color: #3b82f6;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #f8fafc;
          padding: 12px 8px;
          text-align: left;
          border-bottom: 2px solid #3b82f6;
          font-weight: bold;
          color: #374151;
        }
        .summary-box {
          background: #f8fafc;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .total-amount {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="church-name">${church?.name || 'Church Name'}</div>
        <div style="color: #6b7280; margin-top: 5px;">
          ${church?.address || ''}<br>
          ${church?.city || ''}, ${church?.state || ''} ${church?.zipCode || ''}
        </div>
        <div class="statement-title">Annual Giving Statement - ${year}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Statement #: ${statementNumber}</div>
      </div>

      <div style="margin: 25px 0;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Donor Information</h3>
        <p><strong>Name:</strong> ${user?.firstName || ''} ${user?.lastName || ''}</p>
        <p><strong>Email:</strong> ${user?.email || 'Not provided'}</p>
        <p><strong>Statement Date:</strong> ${currentDate}</p>
      </div>

      <div class="summary-box">
        <div style="text-align: center; margin-bottom: 10px; color: #6b7280;">Total Tax-Deductible Donations for ${year}</div>
        <div class="total-amount">$${totalAmount.toFixed(2)}</div>
        <div style="text-align: center; margin-top: 10px; color: #6b7280;">From ${donations.length} donation${donations.length !== 1 ? 's' : ''}</div>
      </div>

      <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 40px;">Donation Detail</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          ${donationRows}
        </tbody>
      </table>

      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 30px 0;">
        <strong style="color: #92400e;">Important Tax Information:</strong><br>
        <span style="color: #92400e; font-size: 14px;">
          This statement summarizes your charitable contributions for tax year ${year}. 
          No goods or services were provided in exchange for these donations unless otherwise noted. 
          Please retain this statement for your tax records and consult your tax advisor for specific deduction guidelines.
        </span>
      </div>

      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Thank you for your faithful giving and partnership in ministry!</p>
        <p>Generated automatically by SoapBox Church Management System</p>
        <p>For questions, contact: ${church?.email || 'church@example.com'}</p>
      </div>
    </body>
    </html>
    `;
  }
}

export default DonationReceiptService;