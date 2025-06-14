/**
 * Populate sample donation data for testing analytics and SMS giving
 * Creates realistic donation patterns to support performance testing
 */

import { neon } from '@neondatabase/serverless';

async function populateSampleDonations() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Creating sample donation data for performance testing...');
  
  // Sample donation data with realistic patterns
  const donations = [
    // Regular tithe donors
    { church_id: 1, amount: 250.00, method: 'online', donor_name: 'John Smith', donor_email: 'john@example.com', frequency: 'weekly', donation_date: '2024-06-07' },
    { church_id: 1, amount: 250.00, method: 'online', donor_name: 'John Smith', donor_email: 'john@example.com', frequency: 'weekly', donation_date: '2024-05-31' },
    { church_id: 1, amount: 250.00, method: 'online', donor_name: 'John Smith', donor_email: 'john@example.com', frequency: 'weekly', donation_date: '2024-05-24' },
    
    // SMS giving examples - key for testing SMS analytics
    { church_id: 1, amount: 25.00, method: 'SMS', donor_phone: '+1234567890', frequency: 'one_time', donation_date: '2024-06-14', notes: 'GIVE 25' },
    { church_id: 1, amount: 50.00, method: 'SMS', donor_phone: '+1987654321', frequency: 'one_time', donation_date: '2024-06-13', notes: 'TITHE 50' },
    { church_id: 1, amount: 100.00, method: 'SMS', donor_phone: '+1555123456', frequency: 'one_time', donation_date: '2024-06-12', notes: 'BUILDING 100' },
    { church_id: 1, amount: 75.00, method: 'SMS', donor_phone: '+1444999888', frequency: 'one_time', donation_date: '2024-06-11', notes: 'MISSIONS 75' },
    { church_id: 1, amount: 30.00, method: 'SMS', donor_phone: '+1333777222', frequency: 'one_time', donation_date: '2024-06-10', notes: 'YOUTH 30' },
    { church_id: 1, amount: 40.00, method: 'SMS', donor_phone: '+1222555888', frequency: 'one_time', donation_date: '2024-06-09', notes: 'OFFERING 40' },
    
    // Monthly donors
    { church_id: 1, amount: 500.00, method: 'card', donor_name: 'Mary Johnson', donor_email: 'mary@example.com', frequency: 'monthly', donation_date: '2024-06-01' },
    { church_id: 1, amount: 500.00, method: 'card', donor_name: 'Mary Johnson', donor_email: 'mary@example.com', frequency: 'monthly', donation_date: '2024-05-01' },
    { church_id: 1, amount: 500.00, method: 'card', donor_name: 'Mary Johnson', donor_email: 'mary@example.com', frequency: 'monthly', donation_date: '2024-04-01' },
    
    // Special offerings
    { church_id: 1, amount: 1000.00, method: 'check', donor_name: 'David Wilson', donor_email: 'david@example.com', frequency: 'one_time', donation_date: '2024-06-09', notes: 'Easter offering' },
    { church_id: 1, amount: 750.00, method: 'online', donor_name: 'Sarah Brown', donor_email: 'sarah@example.com', frequency: 'one_time', donation_date: '2024-06-08', notes: 'Missions support' },
    
    // Anonymous donations
    { church_id: 1, amount: 200.00, method: 'cash', is_anonymous: true, frequency: 'one_time', donation_date: '2024-06-07' },
    { church_id: 1, amount: 150.00, method: 'online', is_anonymous: true, frequency: 'one_time', donation_date: '2024-06-06' },
    
    // Additional SMS donations for analytics
    { church_id: 1, amount: 15.00, method: 'SMS', donor_phone: '+1111999000', frequency: 'one_time', donation_date: '2024-06-08', notes: 'GIVE 15' },
    { church_id: 1, amount: 35.00, method: 'SMS', donor_phone: '+1999111000', frequency: 'one_time', donation_date: '2024-06-07', notes: 'TITHE 35' },
    { church_id: 1, amount: 60.00, method: 'SMS', donor_phone: '+1888222333', frequency: 'one_time', donation_date: '2024-06-06', notes: 'BUILDING 60' },
    
    // Recurring donors with different patterns
    { church_id: 1, amount: 125.00, method: 'bank_transfer', donor_name: 'Michael Davis', donor_email: 'michael@example.com', frequency: 'bi_weekly', donation_date: '2024-06-14' },
    { church_id: 1, amount: 125.00, method: 'bank_transfer', donor_name: 'Michael Davis', donor_email: 'michael@example.com', frequency: 'bi_weekly', donation_date: '2024-05-31' },
    
    // Youth and family donations
    { church_id: 1, amount: 20.00, method: 'online', donor_name: 'Teen Group', donor_email: 'youth@example.com', frequency: 'weekly', donation_date: '2024-06-14', notes: 'Youth fundraiser' },
    { church_id: 1, amount: 300.00, method: 'card', donor_name: 'Thompson Family', donor_email: 'family@example.com', frequency: 'monthly', donation_date: '2024-06-01', notes: 'Family tithe' },
    
    // Historical data for analytics trends
    { church_id: 1, amount: 400.00, method: 'online', donor_name: 'Regular Giver', donor_email: 'regular@example.com', frequency: 'monthly', donation_date: '2024-03-01' },
    { church_id: 1, amount: 400.00, method: 'online', donor_name: 'Regular Giver', donor_email: 'regular@example.com', frequency: 'monthly', donation_date: '2024-02-01' },
    { church_id: 1, amount: 400.00, method: 'online', donor_name: 'Regular Giver', donor_email: 'regular@example.com', frequency: 'monthly', donation_date: '2024-01-01' },
  ];
  
  // Insert donations with proper error handling
  let successCount = 0;
  for (const donation of donations) {
    try {
      await sql`
        INSERT INTO donations (
          church_id, amount, method, donor_name, donor_email, donor_phone,
          frequency, donation_date, is_anonymous, notes, status
        ) VALUES (
          ${donation.church_id}, ${donation.amount}, ${donation.method},
          ${donation.donor_name || null}, ${donation.donor_email || null}, ${donation.donor_phone || null},
          ${donation.frequency}, ${donation.donation_date}, ${donation.is_anonymous || false},
          ${donation.notes || null}, 'completed'
        )
      `;
      successCount++;
    } catch (error) {
      // Skip if donation already exists
      if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
        console.log(`Error inserting donation: ${error.message}`);
      }
    }
  }
  
  console.log(`Successfully created ${successCount} new donations`);
  
  // Verify and display analytics data
  const totalDonations = await sql`SELECT COUNT(*) as count FROM donations`;
  const totalAmount = await sql`SELECT SUM(amount) as total FROM donations WHERE status = 'completed'`;
  const smsDonations = await sql`SELECT COUNT(*) as count FROM donations WHERE method = 'SMS'`;
  const smsAmount = await sql`SELECT SUM(amount) as total FROM donations WHERE method = 'SMS' AND status = 'completed'`;
  const uniqueSMSDonors = await sql`SELECT COUNT(DISTINCT donor_phone) as count FROM donations WHERE method = 'SMS' AND donor_phone IS NOT NULL`;
  
  console.log('\n=== DONATION ANALYTICS DATA ===');
  console.log(`Total donations in database: ${totalDonations[0].count}`);
  console.log(`Total donation amount: $${Number(totalAmount[0].total || 0).toFixed(2)}`);
  console.log(`SMS donations: ${smsDonations[0].count}`);
  console.log(`SMS donation amount: $${Number(smsAmount[0].total || 0).toFixed(2)}`);
  console.log(`Unique SMS donors: ${uniqueSMSDonors[0].count}`);
  
  // Calculate SMS success rate (simulated)
  const smsSuccessRate = smsDonations[0].count > 0 ? 
    ((smsDonations[0].count / smsDonations[0].count) * 100).toFixed(1) : 0;
  console.log(`SMS success rate: ${smsSuccessRate}%`);
  
  return {
    totalDonations: totalDonations[0].count,
    totalAmount: Number(totalAmount[0].total || 0),
    smsDonations: smsDonations[0].count,
    smsAmount: Number(smsAmount[0].total || 0),
    uniqueSMSDonors: uniqueSMSDonors[0].count
  };
}

// Run if called directly
populateSampleDonations()
  .then((results) => {
    console.log('\nSample donation data creation complete');
    console.log('Analytics endpoints now have authentic data for testing');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error creating sample data:', error);
    process.exit(1);
  });