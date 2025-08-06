#!/usr/bin/env node

/**
 * Comprehensive Functionality Test Script
 * This script tests all the major functionalities of the Probus Engine application
 */

const API_BASE = 'http://localhost:3000/api';

// Test results storage
const testResults = {
    passed: [],
    failed: [],
    total: 0
};

// Helper function to log test results
function logTest(testName, passed, error = null) {
    testResults.total++;
    if (passed) {
        testResults.passed.push(testName);
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed.push({ name: testName, error });
        console.log(`❌ ${testName} - ${error}`);
    }
}

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    const result = await makeRequest('/health');
    logTest('Health Check API', result.success && result.data.status === 'healthy', result.error);
}

// Test 2: AI Models Configuration
async function testAIModels() {
    console.log('\n🤖 Testing AI Models...');
    const result = await makeRequest('/ai-models');
    logTest('AI Models Configuration', result.success && result.data.config, result.error);
}

// Test 3: AI Models Text Generation
async function testAITextGeneration() {
    console.log('\n💬 Testing AI Text Generation...');
    const result = await makeRequest('/ai-models', {
        method: 'POST',
        body: JSON.stringify({
            action: 'generateText',
            prompt: 'Hello, please respond with "Test successful"',
            options: {
                modelId: 'gpt-4',
                maxTokens: 10
            }
        })
    });
    logTest('AI Text Generation', result.success && result.data.result, result.error);
}

// Test 4: Threat Detection
async function testThreatDetection() {
    console.log('\n🛡️ Testing Threat Detection...');
    const result = await makeRequest('/ai-models', {
        method: 'POST',
        body: JSON.stringify({
            action: 'analyzeThreat',
            content: 'This is a test message for threat detection',
            threatTypes: ['harassment', 'fraud']
        })
    });
    logTest('Threat Detection', result.success && result.data.analysis, result.error);
}

// Test 5: Threats API (GET)
async function testThreatsAPI() {
    console.log('\n📋 Testing Threats API...');
    const result = await makeRequest('/threats');
    logTest('Threats API GET', result.success, result.error);
}

// Test 6: Communications API
async function testCommunicationsAPI() {
    console.log('\n📧 Testing Communications API...');
    const result = await makeRequest('/communications');
    logTest('Communications API', result.success, result.error);
}

// Test 7: Compliance API
async function testComplianceAPI() {
    console.log('\n📊 Testing Compliance API...');
    const result = await makeRequest('/compliance');
    logTest('Compliance API', result.success, result.error);
}

// Test 8: Reports API
async function testReportsAPI() {
    console.log('\n📄 Testing Reports API...');
    const result = await makeRequest('/reports');
    logTest('Reports API', result.success, result.error);
}

// Test 9: Integrations API
async function testIntegrationsAPI() {
    console.log('\n🔗 Testing Integrations API...');
    const result = await makeRequest('/integrations');
    logTest('Integrations API', result.success, result.error);
}

// Test 10: Security Audit API
async function testSecurityAuditAPI() {
    console.log('\n🔒 Testing Security Audit API...');
    const result = await makeRequest('/security/audit');
    logTest('Security Audit API', result.success, result.error);
}

// Test 11: Authentication Endpoints
async function testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    // Test login with dummy data
    const loginResult = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword'
        })
    });
    
    // We expect this to fail since it's dummy data, but the endpoint should work
    logTest('Authentication Login Endpoint', loginResult.success || loginResult.status === 401, loginResult.error);
    
    // Test register
    const registerResult = await makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword',
            name: 'Test User'
        })
    });
    
    logTest('Authentication Register Endpoint', registerResult.success || registerResult.status === 400, registerResult.error);
}

// Test 12: Navigation Routes
async function testNavigationRoutes() {
    console.log('\n🧭 Testing Navigation Routes...');
    
    // Test if main pages exist (these should return HTML, not JSON)
    const routes = [
        '/',
        '/ai-models',
        '/custom-applications',
        '/integrations',
        '/reports'
    ];
    
    for (const route of routes) {
        try {
            const response = await fetch(`http://localhost:3000${route}`);
            logTest(`Navigation Route ${route}`, response.status === 200, `Status: ${response.status}`);
        } catch (error) {
            logTest(`Navigation Route ${route}`, false, error.message);
        }
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Functionality Tests...');
    console.log('============================================');
    
    // Run all tests
    await testHealthCheck();
    await testAIModels();
    await testAITextGeneration();
    await testThreatDetection();
    await testThreatsAPI();
    await testCommunicationsAPI();
    await testComplianceAPI();
    await testReportsAPI();
    await testIntegrationsAPI();
    await testSecurityAuditAPI();
    await testAuthentication();
    await testNavigationRoutes();
    
    // Print summary
    console.log('\n📊 Test Results Summary');
    console.log('============================================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`Success Rate: ${((testResults.passed.length / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed.length > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.failed.forEach(failed => {
            console.log(`  - ${failed.name}: ${failed.error}`);
        });
    }
    
    console.log('\n🎯 Functionality Test Complete!');
    
    // Exit with appropriate code
    process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    testResults
};