import { db } from './db';
import { donations } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from './email-service';

export class DonationReceiptService {
  async sendReceiptEmail(donationId: string): Promise<void> {
    // Get donation data
    const donationData = await db
      .select()
      .from(donations)
      .where(eq(donations.id, parseInt(donationId)))
      .limit(1);
    
    if (!donationData.length) {
      throw new Error('Donation not found');
    }
    
    const donation = donationData[0];
    const receiptHTML = this.buildReceiptHTML(donation);
    
    // Send email receipt
    const recipientEmail = donation.donorEmail || 'donor@example.com';
    const receiptNumber = `DON-${donation.id}-${new Date().getFullYear()}`;
    
    await sendEmail({
      to: recipientEmail,
      subject: `Donation Receipt - ${receiptNumber}`,
      html: receiptHTML
    });
  }

  private buildReceiptHTML(donation: any): string {
    const currentDate = new Date().toLocaleDateString();
    const donationDate = donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : new Date().toLocaleDateString();
    const receiptNumber = `DON-${donation.id}-${new Date().getFullYear()}`;
    const donorName = donation.donorName || 'Anonymous Donor';
    const amount = parseFloat(donation.amount).toFixed(2);

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
        .amount-section {
          background: #f8fafc;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .amount-value {
          font-size: 36px;
          font-weight: bold;
          color: #1f2937;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #d1d5db;
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
      </style>
    </head>
    <body>
      <div class="header">
        <div class="church-name">SoapBox Church Community</div>
        <div class="receipt-title">Tax-Deductible Donation Receipt</div>
        <div class="receipt-number">Receipt #: ${receiptNumber}</div>
      </div>

      <div class="section">
        <div class="info-item">
          <span>Donor Name:</span>
          <span>${donorName}</span>
        </div>
        <div class="info-item">
          <span>Email:</span>
          <span>${donation.donorEmail || 'Not provided'}</span>
        </div>
        <div class="info-item">
          <span>Donation Date:</span>
          <span>${donationDate}</span>
        </div>
        <div class="info-item">
          <span>Payment Method:</span>
          <span>${donation.method || 'Online Payment'}</span>
        </div>
      </div>

      <div class="amount-section">
        <div style="margin-bottom: 10px; color: #6b7280;">Total Tax-Deductible Donation</div>
        <div class="amount-value">$${amount}</div>
        ${donation.isRecurring ? '<div style="margin-top: 10px; color: #3b82f6; font-weight: bold;">Recurring Monthly Gift</div>' : ''}
      </div>

      <div class="tax-notice">
        <strong>Important Tax Information:</strong><br>
        This receipt acknowledges your charitable contribution. No goods or services were provided in exchange for this donation. 
        Please retain this receipt for your tax records. Consult your tax advisor for specific deduction guidelines.
      </div>

      <div class="footer">
        <p>Thank you for your generous support of our ministry!</p>
        <p>This receipt was generated automatically by SoapBox Church Management System</p>
        <p>Date: ${currentDate}</p>
      </div>
    </body>
    </html>
    `;
  }
}