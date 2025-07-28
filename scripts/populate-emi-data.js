import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const emiData = [
  // Spiritual States
  { name: "Blessed", emoji: "🙏", category: "Spiritual States", moodScore: 5, sortOrder: 1, colorHex: "#10B981" },
  { name: "Grateful", emoji: "🕊️", category: "Spiritual States", moodScore: 5, sortOrder: 2, colorHex: "#059669" },
  { name: "Peaceful", emoji: "😌", category: "Spiritual States", moodScore: 4, sortOrder: 3, colorHex: "#3B82F6" },
  { name: "Faithful", emoji: "✝️", category: "Spiritual States", moodScore: 4, sortOrder: 4, colorHex: "#7C3AED" },
  { name: "Hopeful", emoji: "🌟", category: "Spiritual States", moodScore: 4, sortOrder: 5, colorHex: "#F59E0B" },
  { name: "Seeking", emoji: "🔍", category: "Spiritual States", moodScore: 3, sortOrder: 6, colorHex: "#8B5CF6" },
  { name: "Repentant", emoji: "💔", category: "Spiritual States", moodScore: 2, sortOrder: 7, colorHex: "#DC2626" },

  // Emotional Well-being  
  { name: "Joyful", emoji: "😊", category: "Emotional Well-being", moodScore: 5, sortOrder: 1, colorHex: "#FBBF24" },
  { name: "Content", emoji: "😌", category: "Emotional Well-being", moodScore: 4, sortOrder: 2, colorHex: "#34D399" },
  { name: "Excited", emoji: "🤩", category: "Emotional Well-being", moodScore: 5, sortOrder: 3, colorHex: "#F472B6" },
  { name: "Calm", emoji: "😊", category: "Emotional Well-being", moodScore: 4, sortOrder: 4, colorHex: "#60A5FA" },
  { name: "Energized", emoji: "⚡", category: "Emotional Well-being", moodScore: 4, sortOrder: 5, colorHex: "#EF4444" },
  { name: "Neutral", emoji: "😐", category: "Emotional Well-being", moodScore: 3, sortOrder: 6, colorHex: "#9CA3AF" },
  { name: "Tired", emoji: "😴", category: "Emotional Well-being", moodScore: 2, sortOrder: 7, colorHex: "#6B7280" },
  { name: "Anxious", emoji: "😰", category: "Emotional Well-being", moodScore: 2, sortOrder: 8, colorHex: "#F59E0B" },
  { name: "Sad", emoji: "😢", category: "Emotional Well-being", moodScore: 1, sortOrder: 9, colorHex: "#3B82F6" },
  { name: "Frustrated", emoji: "😤", category: "Emotional Well-being", moodScore: 2, sortOrder: 10, colorHex: "#EF4444" },

  // Life Circumstances
  { name: "Celebrating", emoji: "🎉", category: "Life Circumstances", moodScore: 5, sortOrder: 1, colorHex: "#F59E0B" },
  { name: "Overwhelmed", emoji: "😵", category: "Life Circumstances", moodScore: 2, sortOrder: 2, colorHex: "#DC2626" },
  { name: "Challenged", emoji: "💪", category: "Life Circumstances", moodScore: 3, sortOrder: 3, colorHex: "#8B5CF6" },
  { name: "Struggling", emoji: "😞", category: "Life Circumstances", moodScore: 2, sortOrder: 4, colorHex: "#374151" },
  { name: "Growing", emoji: "🌱", category: "Life Circumstances", moodScore: 4, sortOrder: 5, colorHex: "#10B981" },
  { name: "Uncertain", emoji: "🤔", category: "Life Circumstances", moodScore: 3, sortOrder: 6, colorHex: "#6B7280" },

  // Faith & Worship
  { name: "Worshipful", emoji: "🙌", category: "Faith & Worship", moodScore: 5, sortOrder: 1, colorHex: "#7C3AED" },
  { name: "Reverent", emoji: "🕯️", category: "Faith & Worship", moodScore: 4, sortOrder: 2, colorHex: "#059669" },
  { name: "Prayerful", emoji: "🤲", category: "Faith & Worship", moodScore: 4, sortOrder: 3, colorHex: "#3B82F6" },
  { name: "Reflective", emoji: "🧘", category: "Faith & Worship", moodScore: 4, sortOrder: 4, colorHex: "#8B5CF6" },

  // Growth & Transformation
  { name: "Inspired", emoji: "💡", category: "Growth & Transformation", moodScore: 5, sortOrder: 1, colorHex: "#F59E0B" },
  { name: "Motivated", emoji: "🔥", category: "Growth & Transformation", moodScore: 4, sortOrder: 2, colorHex: "#EF4444" },
  { name: "Learning", emoji: "📚", category: "Growth & Transformation", moodScore: 4, sortOrder: 3, colorHex: "#3B82F6" },
  { name: "Transforming", emoji: "🦋", category: "Growth & Transformation", moodScore: 4, sortOrder: 4, colorHex: "#8B5CF6" }
];

async function populateEMIData() {
  try {
    console.log('Creating enhanced_mood_indicators table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enhanced_mood_indicators (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        description TEXT,
        color_hex VARCHAR(7) DEFAULT '#3B82F6',
        mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Inserting EMI data...');
    
    for (const mood of emiData) {
      await pool.query(`
        INSERT INTO enhanced_mood_indicators 
        (name, emoji, category, mood_score, sort_order, color_hex, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [mood.name, mood.emoji, mood.category, mood.moodScore, mood.sortOrder, mood.colorHex]);
    }

    console.log(`Successfully populated ${emiData.length} mood indicators!`);
    
    // Verify the data
    const result = await pool.query('SELECT COUNT(*) FROM enhanced_mood_indicators');
    console.log(`Total mood indicators in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('Error populating EMI data:', error);
  } finally {
    await pool.end();
  }
}

populateEMIData();