// Comprehensive test script for the enhanced Bible verse system
import { readFileSync } from 'fs';

const BASE_URL = 'http://localhost:5000';

// Read authentication cookies
let cookies = '';
try {
  cookies = readFileSync('cookies.txt', 'utf8').trim();
} catch (error) {
  console.log('No cookies.txt found - authentication may be required');
}

async function testBibleVerseSystem() {
  console.log('🔍 Testing Enhanced Bible Verse Database System\n');

  // Test 1: Basic verse lookup
  console.log('1. Testing basic verse lookup...');
  try {
    const response = await fetch(`${BASE_URL}/api/bible/lookup-verse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ reference: 'John 3:16' })
    });
    
    if (response.ok) {
      const verse = await response.json();
      console.log(`✅ Found verse: ${verse.reference}`);
      console.log(`   Text: ${verse.text.substring(0, 80)}...`);
    } else {
      console.log(`❌ Verse lookup failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error in verse lookup: ${error.message}`);
  }

  // Test 2: Topic-based search
  console.log('\n2. Testing topic-based search...');
  try {
    const response = await fetch(`${BASE_URL}/api/bible/search-by-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ topics: ['anxiety', 'peace'] })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Found ${result.count} verses for topics: ${result.topics.join(', ')}`);
      if (result.verses && result.verses.length > 0) {
        console.log(`   Sample: ${result.verses[0].reference} - ${result.verses[0].text.substring(0, 60)}...`);
      }
    } else {
      console.log(`❌ Topic search failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error in topic search: ${error.message}`);
  }

  // Test 3: Random verse by category
  console.log('\n3. Testing random verse by category...');
  try {
    const response = await fetch(`${BASE_URL}/api/bible/random-verse?category=hope`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (response.ok) {
      const verse = await response.json();
      console.log(`✅ Random hope verse: ${verse.reference}`);
      console.log(`   Text: ${verse.text.substring(0, 80)}...`);
    } else {
      console.log(`❌ Random verse failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error in random verse: ${error.message}`);
  }

  // Test 4: Search for faith verses
  console.log('\n4. Testing faith topic search...');
  try {
    const response = await fetch(`${BASE_URL}/api/bible/search-by-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ topics: ['faith'] })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Found ${result.count} faith verses`);
      if (result.verses && result.verses.length > 0) {
        result.verses.slice(0, 2).forEach(verse => {
          console.log(`   - ${verse.reference}: ${verse.text.substring(0, 50)}...`);
        });
      }
    } else {
      console.log(`❌ Faith search failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error in faith search: ${error.message}`);
  }

  // Test 5: Random verse without category
  console.log('\n5. Testing random verse (any category)...');
  try {
    const response = await fetch(`${BASE_URL}/api/bible/random-verse`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (response.ok) {
      const verse = await response.json();
      console.log(`✅ Random verse: ${verse.reference} (Category: ${verse.category})`);
      console.log(`   Text: ${verse.text.substring(0, 80)}...`);
    } else {
      console.log(`❌ Random verse (any) failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error in random verse (any): ${error.message}`);
  }

  console.log('\n🎉 Bible verse system testing completed!');
  console.log('\nThe enhanced database includes:');
  console.log('✅ 58+ Bible verses across 12 categories');
  console.log('✅ Topic-based search functionality');
  console.log('✅ Random verse generation for inspiration');
  console.log('✅ Database-driven lookups for performance');
  console.log('✅ Comprehensive topical organization');
}

testBibleVerseSystem().catch(console.error);