import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const additionalEmiData = [
  // Seeking Support category (missing from original)
  { name: "Struggling", emoji: "😞", category: "Seeking Support", subcategory: "Emotional Support", moodScore: 2, sortOrder: 1, colorHex: "#DC2626" },
  { name: "Anxious", emoji: "😰", category: "Seeking Support", subcategory: "Mental Health", moodScore: 2, sortOrder: 2, colorHex: "#F59E0B" },
  { name: "Confused", emoji: "😕", category: "Seeking Support", subcategory: "Guidance", moodScore: 2, sortOrder: 3, colorHex: "#6B7280" },
  { name: "Lonely", emoji: "😔", category: "Seeking Support", subcategory: "Social Connection", moodScore: 2, sortOrder: 4, colorHex: "#3B82F6" },
  { name: "Overwhelmed", emoji: "😵", category: "Seeking Support", subcategory: "Life Management", moodScore: 2, sortOrder: 5, colorHex: "#DC2626" },
  { name: "Seeking", emoji: "🔍", category: "Seeking Support", subcategory: "Spiritual Guidance", moodScore: 3, sortOrder: 6, colorHex: "#8B5CF6" },

  // Additional moods from screenshots not in original categories
  { name: "Loved", emoji: "❤️", category: "Emotional Well-being", moodScore: 5, sortOrder: 11, colorHex: "#EF4444" },
  { name: "Inspired", emoji: "💡", category: "Emotional Well-being", moodScore: 5, sortOrder: 12, colorHex: "#F59E0B" },
  { name: "Reflective", emoji: "🤔", category: "Emotional Well-being", moodScore: 4, sortOrder: 13, colorHex: "#8B5CF6" },
  
  // Life Circumstances additions
  { name: "Recovering", emoji: "🌱", category: "Life Circumstances", moodScore: 4, sortOrder: 7, colorHex: "#10B981" },
  { name: "Learning", emoji: "📚", category: "Life Circumstances", moodScore: 4, sortOrder: 8, colorHex: "#3B82F6" },
  { name: "Working", emoji: "💼", category: "Life Circumstances", moodScore: 3, sortOrder: 9, colorHex: "#6B7280" },
  { name: "Serving", emoji: "🤝", category: "Life Circumstances", moodScore: 4, sortOrder: 10, colorHex: "#10B981" },
  { name: "Traveling", emoji: "✈️", category: "Life Circumstances", moodScore: 4, sortOrder: 11, colorHex: "#3B82F6" },

  // Faith & Worship additions from screenshots
  { name: "Worshipful", emoji: "🙌", category: "Faith & Worship", subcategory: "Worship", moodScore: 5, sortOrder: 5, colorHex: "#7C3AED" },

  // Additional categories that might be present in other areas
  { name: "Daily Checkin", emoji: "✅", category: "Daily Checkin", subcategory: "Routine", moodScore: 3, sortOrder: 1, colorHex: "#10B981" },
  { name: "Morning", emoji: "🌅", category: "Daily Checkin", subcategory: "Time of Day", moodScore: 4, sortOrder: 2, colorHex: "#F59E0B" },
  { name: "Evening", emoji: "🌆", category: "Daily Checkin", subcategory: "Time of Day", moodScore: 3, sortOrder: 3, colorHex: "#8B5CF6" },
  { name: "Routine", emoji: "📋", category: "Daily Checkin", subcategory: "Habit", moodScore: 3, sortOrder: 4, colorHex: "#6B7280" },
];

async function updateEMICategories() {
  try {
    console.log('Adding missing EMI categories and moods...');
    
    for (const mood of additionalEmiData) {
      try {
        await pool.query(`
          INSERT INTO enhanced_mood_indicators 
          (name, emoji, category, subcategory, mood_score, sort_order, color_hex, is_active) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, true);
        `, [mood.name, mood.emoji, mood.category, mood.subcategory || null, mood.moodScore, mood.sortOrder, mood.colorHex]);
        console.log(`Added: ${mood.name} in ${mood.category}`);
      } catch (error) {
        if (error.code === '23505') { // Duplicate key error
          console.log(`Skipped duplicate: ${mood.name} in ${mood.category}`);
        } else {
          console.error(`Error adding ${mood.name}:`, error.message);
        }
      }
    }

    console.log(`Successfully updated EMI system with additional categories!`);
    
    // Get updated count and categories
    const result = await pool.query('SELECT COUNT(*) FROM enhanced_mood_indicators');
    const categoriesResult = await pool.query('SELECT DISTINCT category FROM enhanced_mood_indicators ORDER BY category');
    
    console.log(`Total mood indicators in database: ${result.rows[0].count}`);
    console.log('Categories:', categoriesResult.rows.map(r => r.category).join(', '));
    
  } catch (error) {
    console.error('Error updating EMI categories:', error);
  } finally {
    await pool.end();
  }
}

updateEMICategories();