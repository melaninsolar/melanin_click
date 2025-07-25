// Comprehensive Tauri Function Test Script
// Run this in the browser console to test all functions

console.log('🔍 STARTING COMPREHENSIVE TAURI FUNCTION TEST');

const { invoke } = window.__TAURI__.core;

// Test data
const testData = {
  whiveAddress: 'WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes',
  bitcoinAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  workerName: 'test_worker',
  poolName: 'CKPool Solo'
};

async function testAllFunctions() {
  const results = {};
  
  // 1. Test System Functions
  console.log('\n=== TESTING SYSTEM FUNCTIONS ===');
  try {
    results.systemInfo = await invoke('get_system_info');
    console.log('✅ get_system_info:', results.systemInfo);
  } catch (e) {
    console.error('❌ get_system_info:', e);
    results.systemInfo = { error: e };
  }

  // 2. Test Address Validation
  console.log('\n=== TESTING ADDRESS VALIDATION ===');
  try {
    results.whiveValidation = await invoke('validate_whive_address', { address: testData.whiveAddress });
    console.log('✅ validate_whive_address:', results.whiveValidation);
  } catch (e) {
    console.error('❌ validate_whive_address:', e);
    results.whiveValidation = { error: e };
  }

  try {
    results.bitcoinValidation = await invoke('validate_bitcoin_address', { address: testData.bitcoinAddress });
    console.log('✅ validate_bitcoin_address:', results.bitcoinValidation);
  } catch (e) {
    console.error('❌ validate_bitcoin_address:', e);
    results.bitcoinValidation = { error: e };
  }

  // 3. Test Mining Functions (THIS IS THE CRITICAL TEST)
  console.log('\n=== TESTING MINING FUNCTIONS ===');
  
  // Test with correct parameter names
  try {
    console.log('Testing start_enhanced_whive_mining with parameters:', {
      whive_address: testData.whiveAddress,
      threads: 2,
      intensity: 85
    });
    
    results.whiveMining = await invoke('start_enhanced_whive_mining', {
      whive_address: testData.whiveAddress,
      threads: 2,
      intensity: 85
    });
    console.log('✅ start_enhanced_whive_mining:', results.whiveMining);
  } catch (e) {
    console.error('❌ start_enhanced_whive_mining:', e);
    results.whiveMining = { error: e };
  }

  try {
    console.log('Testing start_enhanced_bitcoin_mining with parameters:', {
      bitcoin_address: testData.bitcoinAddress,
      worker_name: testData.workerName,
      pool_name: testData.poolName,
      threads: 1,
      mining_mode: 'cpu'
    });
    
    results.bitcoinMining = await invoke('start_enhanced_bitcoin_mining', {
      bitcoin_address: testData.bitcoinAddress,
      worker_name: testData.workerName,
      pool_name: testData.poolName,
      threads: 1,
      mining_mode: 'cpu'
    });
    console.log('✅ start_enhanced_bitcoin_mining:', results.bitcoinMining);
  } catch (e) {
    console.error('❌ start_enhanced_bitcoin_mining:', e);
    results.bitcoinMining = { error: e };
  }

  // 4. Test Mining Stats
  console.log('\n=== TESTING MINING STATS ===');
  try {
    results.miningStats = await invoke('get_real_mining_stats', { mining_type: 'whive' });
    console.log('✅ get_real_mining_stats:', results.miningStats);
  } catch (e) {
    console.error('❌ get_real_mining_stats:', e);
    results.miningStats = { error: e };
  }

  // 5. Test Node Functions
  console.log('\n=== TESTING NODE FUNCTIONS ===');
  try {
    results.bitcoinStatus = await invoke('check_bitcoin_status');
    console.log('✅ check_bitcoin_status:', results.bitcoinStatus);
  } catch (e) {
    console.error('❌ check_bitcoin_status:', e);
    results.bitcoinStatus = { error: e };
  }

  console.log('\n=== TEST COMPLETE ===');
  console.log('Full Results:', results);
  
  // Analyze results
  const working = Object.keys(results).filter(key => !results[key].error);
  const broken = Object.keys(results).filter(key => results[key].error);
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Working functions: ${working.length}/${Object.keys(results).length}`);
  console.log(`❌ Broken functions: ${broken.length}/${Object.keys(results).length}`);
  
  if (broken.length > 0) {
    console.log('\n🔥 BROKEN FUNCTIONS:');
    broken.forEach(func => {
      console.log(`- ${func}:`, results[func].error);
    });
  }
  
  return results;
}

// Run the test
testAllFunctions().then(results => {
  window.testResults = results;
  console.log('🔍 Test completed. Results stored in window.testResults');
}).catch(e => {
  console.error('🔥 Test failed:', e);
}); 