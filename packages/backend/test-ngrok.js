#!/usr/bin/env node

import fetch from 'node-fetch';

const NGROK_URL = 'https://1a3b2ef0bf9c.ngrok-free.app';

async function testNgrokIntegration() {
  console.log('🧪 Testing NARC4S Backend Ngrok Integration\n');
  
  // Test 1: Health endpoint
  console.log('1️⃣  Testing health endpoint...');
  try {
    const response = await fetch(`${NGROK_URL}/api/health`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health endpoint working!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Health endpoint failed:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response body:', text.substring(0, 200) + '...');
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test 2: Process raffle endpoint (should fail without proper data)
  console.log('2️⃣  Testing process-raffle endpoint...');
  try {
    const response = await fetch(`${NGROK_URL}/api/process-raffle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        // Intentionally incomplete data to test error handling
        raffleId: 'test-123'
      })
    });
    
    const data = await response.json();
    console.log('📊 Process raffle response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400 && data.error) {
      console.log('✅ Process raffle endpoint working (expected validation error)');
    } else {
      console.log('⚠️  Unexpected response from process raffle endpoint');
    }
  } catch (error) {
    console.log('❌ Process raffle endpoint error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Integration Test Complete!');
  console.log('\n📝 Notes:');
  console.log('- Make sure your backend is running on the port ngrok is forwarding to');
  console.log('- Update ngrok URL in all config files when it changes');
  console.log('- Use "ngrok-skip-browser-warning" header for API calls');
}

// Run the test
testNgrokIntegration().catch(console.error);
