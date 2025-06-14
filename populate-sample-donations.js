/**
 * Populate sample donation data for testing analytics and SMS giving
 * Creates realistic donation patterns to support performance testing
 */

const { neon } = require('@neondatabase/serverless');

async function populateSampleDonations() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Creating sample donation data for performance testing...');
  
  // Sample donation data with realistic patterns
  const donations = [
    // Regular tithe donors
    { church_id: 1, amount: 250.00, method: 'online', donor_name: 'John Smith', donor_email: 'john@example.com', frequency: 'weekly', donation_date: '2024-06-07' },
    { church_id: 1, amount: 250.00, method: 'online', donor_name: 'John Smith', donor_email: 'john@example.com', frequency: 'weekly', donation_date: '2024-05-31' },
    { church_id: 1, amount: 250.00, method: 'online', donor_name: 'John Smith', donor_email: 'john@example.com', frequency: 'weekly', donation_date: '2024-05-24' },
    
    // SMS giving examples
    { church_id: 1, amount: 25.00, method: 'SMS', donor_phone: '+1234567890', frequency: 'one_time', donation_date: '2024-06-14', notes: 'GIVE 25' },
    { church_id: 1, amount: 50.00, method: 'SMS', donor_phone: '+1987654321', frequency: 'one_time', donation_date: '2024-06-13', notes: 'TITHE 50' },
    { church_id: 1, amount: 100.00, method: 'SMS', donor_phone: '+1555123456', frequency: 'one_time', donation_date: '2024-06-12', notes: 'BUILDING 100' },
    { church_id: 1, amount: 75.00, method: 'SMS', donor_phone: '+1444999888', frequency: 'one_time', donation_date: '2024-06-11', notes: 'MISSIONS 75' },
    { church_id: 1, amount: 30.00, method: 'SMS', donor_phone: '+1333777222', frequency: 'one_time', donation_date: '2024-06-10', notes: 'YOUTH 30' },
    
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
    
    // Recurring donors with different patterns
    { church_id: 1, amount: 125.00, method: 'bank_transfer', donor_name: 'Michael Davis', donor_email: 'michael@example.com', frequency: 'bi_weekly', donation_date: '2024-06-14' },
    { church_id: 1, amount: 125.00, method: 'bank_transfer', donor_name: 'Michael Davis', donor_email: 'michael@example.com', frequency: 'bi_weekly', donation_date: '2024-05-31' },
    
    // Youth and family donations
    { church_id: 1, amount: 20.00, method: 'online', donor_name: 'Teen Group', donor_email: 'youth@example.com', frequency: 'weekly', donation_date: '2024-06-14', notes: 'Youth fundraiser' },
    { church_id: 1, amount: 300.00, method: 'card', donor_name: 'Thompson Family', donor_email: 'family@example.com', frequency: 'monthly', donation_date: '2024-06-01', notes: 'Family tithe' },
    
    // Historical data for analytics
    { church_id: 1, amount: 400.00, method: 'online', donor_name: 'Regular Giver', donor_email: 'regular@example.com', frequency: 'monthly', donation_date: '2024-03-01' },
    { church_id: 1, amount: 400.00, method: 'online', donor_name: 'Regular Giver', donor_email: 'regular@example.com', frequency: 'monthly', donation_date: '2024-02-01' },
    { church_id: 1, amount: 400.00, method: 'online', donor_name: 'Regular Giver', donor_email: 'regular@example.com', frequency: 'monthly', donation_date: '2024-01-01' },
  ];
  
  // Insert donations
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
    } catch (error) {
      console.log(`Donation already exists or error: ${error.message}`);
    }
  }
  
  console.log(`Created ${donations.length} sample donations`);
  
  // Verify data
  const totalDonations = await sql`SELECT COUNT(*) as count FROM donations`;
  const totalAmount = await sql`SELECT SUM(amount) as total FROM donations WHERE status = 'completed'`;
  const smsDonations = await sql`SELECT COUNT(*) as count FROM donations WHERE method = 'SMS'`;
  
  console.log(`Total donations in database: ${totalDonations[0].count}`);
  console.log(`Total amount: $${totalAmount[0].total}`);
  console.log(`SMS donations: ${smsDonations[0].count}`);
}

// Run if called directly
if (require.main === module) {
  populateSampleDonations()
    .then(() => {
      console.log('Sample donation data creation complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error creating sample data:', error);
      process.exit(1);
    });
}

module.exports = { populateSampleDonations };