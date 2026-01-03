/**
 * Test Scenarios Definition Module
 *
 * Defines comprehensive test scenarios for KYC and AML testing
 * Maps scenarios to requirements for traceability
 *
 * @module test-scenarios
 */

/**
 * KYC Test Scenarios
 */
const KYC_SCENARIOS = {
  // Document Upload Scenarios
  DOC_UPLOAD: {
    id: 'KYC-TS-001',
    name: 'Document Upload Validation',
    description: 'Verify document upload functionality for various file types and sizes',
    category: 'Document Management',
    priority: 'High',
    requirements: ['KYC-CB-002', 'US-001'],
    testCases: [
      {
        id: 'KYC-TC-001',
        name: 'Upload valid passport image',
        description: 'Verify system accepts valid passport image in JPG format',
        preconditions: ['User is authenticated', 'KYC status is PENDING'],
        steps: [
          'Navigate to document upload page',
          'Select passport as document type',
          'Upload valid JPG file under 10MB',
          'Submit document'
        ],
        expectedResult: 'Document is accepted and status shows "Processing"',
        testData: { documentType: 'PASSPORT', fileFormat: 'JPG', fileSize: '2MB' }
      },
      {
        id: 'KYC-TC-002',
        name: 'Upload document exceeding size limit',
        description: 'Verify system rejects files larger than 10MB',
        preconditions: ['User is authenticated'],
        steps: [
          'Navigate to document upload page',
          'Attempt to upload file larger than 10MB'
        ],
        expectedResult: 'System displays error: "File size exceeds maximum limit of 10MB"',
        testData: { fileSize: '15MB' }
      },
      {
        id: 'KYC-TC-003',
        name: 'Upload unsupported file format',
        description: 'Verify system rejects unsupported file formats',
        preconditions: ['User is authenticated'],
        steps: [
          'Navigate to document upload page',
          'Attempt to upload .exe file'
        ],
        expectedResult: 'System displays error: "Unsupported file format"',
        testData: { fileFormat: 'EXE' }
      }
    ]
  },

  // Identity Verification Scenarios
  IDENTITY_VERIFICATION: {
    id: 'KYC-TS-002',
    name: 'Identity Verification Process',
    description: 'Verify biometric and document-based identity verification',
    category: 'Identity Verification',
    priority: 'High',
    requirements: ['US-003', 'KYC-INT-004', 'ACC-003'],
    testCases: [
      {
        id: 'KYC-TC-004',
        name: 'Successful facial recognition match',
        description: 'Verify successful facial recognition between selfie and ID photo',
        preconditions: ['User has uploaded valid ID document', 'Camera access granted'],
        steps: [
          'Navigate to identity verification',
          'Capture live selfie',
          'System compares with ID photo'
        ],
        expectedResult: 'Match confidence score > 90%, verification passes',
        testData: { matchThreshold: 0.9 }
      },
      {
        id: 'KYC-TC-005',
        name: 'Failed liveness detection',
        description: 'Verify system detects photo of photo spoofing attempt',
        preconditions: ['User has uploaded valid ID document'],
        steps: [
          'Navigate to identity verification',
          'Present printed photo instead of live face'
        ],
        expectedResult: 'System detects spoofing and requests new verification',
        testData: { spoofAttempt: true }
      },
      {
        id: 'KYC-TC-006',
        name: 'OCR data extraction accuracy',
        description: 'Verify OCR correctly extracts data from passport',
        preconditions: ['Valid passport document uploaded'],
        steps: [
          'System processes uploaded passport',
          'OCR extracts name, DOB, passport number',
          'Compare extracted data with original'
        ],
        expectedResult: 'OCR accuracy > 98% for all fields',
        testData: { expectedAccuracy: 0.98 }
      }
    ]
  },

  // KYC Status Scenarios
  STATUS_TRACKING: {
    id: 'KYC-TS-003',
    name: 'KYC Status Tracking',
    description: 'Verify KYC status updates and notifications',
    category: 'Status Management',
    priority: 'Medium',
    requirements: ['US-004', 'KYC-CB-003'],
    testCases: [
      {
        id: 'KYC-TC-007',
        name: 'View pending KYC status',
        description: 'Verify user can view pending KYC status',
        preconditions: ['User has submitted KYC documents'],
        steps: [
          'Navigate to KYC status page',
          'View current status'
        ],
        expectedResult: 'Status shows "PENDING" with document checklist',
        testData: { status: 'PENDING' }
      },
      {
        id: 'KYC-TC-008',
        name: 'Receive approval notification',
        description: 'Verify user receives notification on KYC approval',
        preconditions: ['KYC is under review'],
        steps: [
          'Compliance officer approves KYC',
          'System sends notification'
        ],
        expectedResult: 'User receives email and in-app notification',
        testData: { notificationType: ['EMAIL', 'IN_APP'] }
      }
    ]
  },

  // Risk Assessment Scenarios
  RISK_ASSESSMENT: {
    id: 'KYC-TS-004',
    name: 'Risk-Based Customer Assessment',
    description: 'Verify risk tier assignment based on KYC data',
    category: 'Risk Management',
    priority: 'High',
    requirements: ['US-006', 'AML-INT-005'],
    testCases: [
      {
        id: 'KYC-TC-009',
        name: 'Low risk tier assignment',
        description: 'Verify low-risk customers are assigned LOW tier',
        preconditions: ['Customer from low-risk country', 'No adverse findings'],
        steps: [
          'Submit KYC for standard customer',
          'System performs risk assessment'
        ],
        expectedResult: 'Customer assigned LOW risk tier',
        testData: { country: 'United States', pepStatus: false }
      },
      {
        id: 'KYC-TC-010',
        name: 'High risk tier for PEP',
        description: 'Verify PEP customers are assigned HIGH tier',
        preconditions: ['Customer flagged as PEP'],
        steps: [
          'Submit KYC for PEP customer',
          'System performs risk assessment'
        ],
        expectedResult: 'Customer assigned HIGH risk tier, enhanced due diligence required',
        testData: { pepStatus: true, expectedTier: 'HIGH' }
      }
    ]
  },

  // Rejection Handling Scenarios
  REJECTION_HANDLING: {
    id: 'KYC-TS-005',
    name: 'KYC Rejection and Resubmission',
    description: 'Verify rejection workflow and resubmission process',
    category: 'Error Handling',
    priority: 'High',
    requirements: ['US-005', 'KYC-CB-004'],
    testCases: [
      {
        id: 'KYC-TC-011',
        name: 'Clear rejection reason provided',
        description: 'Verify user receives clear rejection reason',
        preconditions: ['KYC documents submitted'],
        steps: [
          'Document verification fails',
          'System generates rejection'
        ],
        expectedResult: 'User sees specific rejection reason and required actions',
        testData: { rejectionReason: 'Document expired' }
      },
      {
        id: 'KYC-TC-012',
        name: 'Document resubmission workflow',
        description: 'Verify user can resubmit after rejection',
        preconditions: ['KYC was rejected'],
        steps: [
          'View rejection details',
          'Upload corrected document',
          'Resubmit KYC'
        ],
        expectedResult: 'KYC resubmitted successfully, status returns to PENDING',
        testData: { previousStatus: 'REJECTED', newStatus: 'PENDING' }
      }
    ]
  }
};

/**
 * AML Test Scenarios
 */
const AML_SCENARIOS = {
  // Transaction Screening Scenarios
  TRANSACTION_SCREENING: {
    id: 'AML-TS-001',
    name: 'Real-Time Transaction Screening',
    description: 'Verify transaction screening against AML rules',
    category: 'Transaction Monitoring',
    priority: 'High',
    requirements: ['US-007', 'PERF-005', 'ACC-004'],
    testCases: [
      {
        id: 'AML-TC-001',
        name: 'Screen normal transaction',
        description: 'Verify normal transaction passes screening',
        preconditions: ['Customer KYC approved', 'Account active'],
        steps: [
          'Initiate $500 wire transfer',
          'System screens transaction'
        ],
        expectedResult: 'Transaction processed within 1 second, no alerts',
        testData: { amount: 500, type: 'WIRE_TRANSFER' }
      },
      {
        id: 'AML-TC-002',
        name: 'Detect structuring pattern',
        description: 'Verify detection of structuring (multiple transactions below $10K)',
        preconditions: ['Account active'],
        steps: [
          'Perform 5 cash deposits of $9,500 each',
          'System monitors transaction pattern'
        ],
        expectedResult: 'Alert generated for structuring pattern',
        testData: { transactionCount: 5, amount: 9500, pattern: 'STRUCTURING' }
      },
      {
        id: 'AML-TC-003',
        name: 'High-risk country transaction',
        description: 'Verify flag for transactions to high-risk jurisdictions',
        preconditions: ['Account active'],
        steps: [
          'Initiate wire transfer to North Korea',
          'System screens transaction'
        ],
        expectedResult: 'Transaction blocked, CRITICAL alert generated',
        testData: { destinationCountry: 'North Korea', expectedSeverity: 'CRITICAL' }
      },
      {
        id: 'AML-TC-004',
        name: 'Velocity spike detection',
        description: 'Verify detection of unusual transaction velocity',
        preconditions: ['Account has normal transaction history'],
        steps: [
          'Perform 20 transactions in 1 hour (10x normal)',
          'System monitors velocity'
        ],
        expectedResult: 'Alert generated for velocity spike',
        testData: { transactionsPerHour: 20, normalRate: 2 }
      }
    ]
  },

  // Sanctions Screening Scenarios
  SANCTIONS_SCREENING: {
    id: 'AML-TS-002',
    name: 'Sanctions List Screening',
    description: 'Verify screening against OFAC, UN, EU sanctions lists',
    category: 'Sanctions',
    priority: 'High',
    requirements: ['US-008', 'AML-INT-002', 'ACC-005'],
    testCases: [
      {
        id: 'AML-TC-005',
        name: 'OFAC exact match',
        description: 'Verify exact match against OFAC SDN list',
        preconditions: ['OFAC list updated within 24 hours'],
        steps: [
          'Screen name matching OFAC entry exactly',
          'Review screening result'
        ],
        expectedResult: '100% match, transaction blocked',
        testData: { listType: 'OFAC', matchType: 'EXACT' }
      },
      {
        id: 'AML-TC-006',
        name: 'Fuzzy name matching',
        description: 'Verify fuzzy matching catches name variations',
        preconditions: ['Sanctions list loaded'],
        steps: [
          'Screen name with slight variation from sanctioned entity',
          'System performs fuzzy match'
        ],
        expectedResult: 'Potential match flagged for review with confidence score',
        testData: { matchType: 'FUZZY', threshold: 0.85 }
      },
      {
        id: 'AML-TC-007',
        name: 'Clear screening result',
        description: 'Verify legitimate names clear screening',
        preconditions: ['Sanctions list loaded'],
        steps: [
          'Screen common name not on any list',
          'Review result'
        ],
        expectedResult: 'Cleared status, no alerts',
        testData: { expectedStatus: 'CLEARED' }
      }
    ]
  },

  // PEP Screening Scenarios
  PEP_SCREENING: {
    id: 'AML-TS-003',
    name: 'PEP Screening',
    description: 'Verify screening for Politically Exposed Persons',
    category: 'PEP',
    priority: 'High',
    requirements: ['US-009', 'AML-INT-003'],
    testCases: [
      {
        id: 'AML-TC-008',
        name: 'Identify PEP customer',
        description: 'Verify PEP identification at onboarding',
        preconditions: ['PEP database integrated'],
        steps: [
          'Submit KYC for government official',
          'System screens against PEP database'
        ],
        expectedResult: 'PEP flag set, enhanced monitoring enabled',
        testData: { occupation: 'Government Minister' }
      },
      {
        id: 'AML-TC-009',
        name: 'PEP family member detection',
        description: 'Verify detection of PEP family members',
        preconditions: ['PEP database includes family relations'],
        steps: [
          'Submit KYC for spouse of known PEP',
          'System screens relationships'
        ],
        expectedResult: 'PEP associate flag set',
        testData: { relationship: 'SPOUSE' }
      }
    ]
  },

  // Alert Management Scenarios
  ALERT_MANAGEMENT: {
    id: 'AML-TS-004',
    name: 'Suspicious Activity Alerts',
    description: 'Verify alert generation and management workflow',
    category: 'Alert Management',
    priority: 'High',
    requirements: ['US-010', 'AML-CB-001', 'AML-CB-003'],
    testCases: [
      {
        id: 'AML-TC-010',
        name: 'Alert prioritization',
        description: 'Verify alerts are prioritized by risk score',
        preconditions: ['Multiple alerts generated'],
        steps: [
          'Generate alerts with different risk scores',
          'View alert queue'
        ],
        expectedResult: 'Critical alerts appear first, sorted by risk score',
        testData: { alertCount: 10 }
      },
      {
        id: 'AML-TC-011',
        name: 'Alert acknowledgment',
        description: 'Verify analyst can acknowledge and investigate alerts',
        preconditions: ['New alert exists'],
        steps: [
          'Select alert from queue',
          'Click acknowledge',
          'Add investigation notes'
        ],
        expectedResult: 'Alert status changes to INVESTIGATING',
        testData: { initialStatus: 'NEW', finalStatus: 'INVESTIGATING' }
      },
      {
        id: 'AML-TC-012',
        name: 'False positive disposition',
        description: 'Verify analyst can mark alert as false positive',
        preconditions: ['Alert under investigation'],
        steps: [
          'Review alert details',
          'Determine false positive',
          'Document reasoning',
          'Close as false positive'
        ],
        expectedResult: 'Alert closed, disposition recorded, improves model',
        testData: { disposition: 'FALSE_POSITIVE' }
      }
    ]
  },

  // Case Management Scenarios
  CASE_MANAGEMENT: {
    id: 'AML-TS-005',
    name: 'Investigation Case Management',
    description: 'Verify case creation and management for investigations',
    category: 'Case Management',
    priority: 'High',
    requirements: ['US-011', 'AML-INT-004'],
    testCases: [
      {
        id: 'AML-TC-013',
        name: 'Case creation from alert',
        description: 'Verify case can be created from escalated alert',
        preconditions: ['Alert escalated'],
        steps: [
          'Select escalated alert',
          'Click "Create Case"',
          'System generates case'
        ],
        expectedResult: 'Case created with alert linked, assigned to investigator',
        testData: { caseSource: 'ALERT' }
      },
      {
        id: 'AML-TC-014',
        name: 'Add evidence to case',
        description: 'Verify documents and notes can be added to case',
        preconditions: ['Case exists'],
        steps: [
          'Open case',
          'Upload supporting document',
          'Add investigation note'
        ],
        expectedResult: 'Evidence attached, audit trail updated',
        testData: {}
      },
      {
        id: 'AML-TC-015',
        name: 'SAR filing from case',
        description: 'Verify SAR can be filed from case',
        preconditions: ['Case investigation complete', 'SAR warranted'],
        steps: [
          'Review case findings',
          'Click "File SAR"',
          'Complete SAR form',
          'Submit to FinCEN'
        ],
        expectedResult: 'SAR filed, BSA ID received, case updated',
        testData: { sarRequired: true }
      }
    ]
  }
};

/**
 * Integration Test Scenarios
 */
const INTEGRATION_SCENARIOS = {
  // Core Banking Integration
  CORE_BANKING: {
    id: 'INT-TS-001',
    name: 'Core Banking System Integration',
    description: 'Verify integration with core banking APIs',
    category: 'Integration',
    priority: 'High',
    requirements: ['US-017', 'INT-001', 'INT-002'],
    testCases: [
      {
        id: 'INT-TC-001',
        name: 'Balance inquiry response time',
        description: 'Verify balance inquiry returns within SLA',
        preconditions: ['Core banking connection established'],
        steps: [
          'Request account balance',
          'Measure response time'
        ],
        expectedResult: 'Response received in < 1 second',
        testData: { slaMs: 1000 }
      },
      {
        id: 'INT-TC-002',
        name: 'Transaction history retrieval',
        description: 'Verify transaction history retrieval',
        preconditions: ['Account has transactions'],
        steps: [
          'Request last 30 days transactions',
          'Verify data completeness'
        ],
        expectedResult: 'All transactions returned with correct details',
        testData: { dayRange: 30 }
      },
      {
        id: 'INT-TC-003',
        name: 'API error handling',
        description: 'Verify graceful handling of API errors',
        preconditions: ['Core banking API available'],
        steps: [
          'Simulate API timeout',
          'Verify retry behavior'
        ],
        expectedResult: 'System retries 3 times then shows user-friendly error',
        testData: { retryCount: 3 }
      }
    ]
  },

  // Chatbot Integration
  CHATBOT: {
    id: 'INT-TS-002',
    name: 'AI Chatbot Integration',
    description: 'Verify chatbot functionality and NLP accuracy',
    category: 'Chatbot',
    priority: 'High',
    requirements: ['US-012', 'US-013', 'US-014', 'NLP-001'],
    testCases: [
      {
        id: 'INT-TC-004',
        name: 'Intent recognition accuracy',
        description: 'Verify chatbot correctly identifies user intent',
        preconditions: ['Chatbot trained on banking intents'],
        steps: [
          'Send "What is my account balance?"',
          'Verify intent classification'
        ],
        expectedResult: 'Intent classified as "account_balance" with > 95% confidence',
        testData: { expectedIntent: 'account_balance', confidenceThreshold: 0.95 }
      },
      {
        id: 'INT-TC-005',
        name: 'KYC status inquiry via chatbot',
        description: 'Verify chatbot provides KYC status',
        preconditions: ['User authenticated', 'KYC in progress'],
        steps: [
          'Ask chatbot "What is my KYC status?"',
          'Verify response'
        ],
        expectedResult: 'Chatbot returns current KYC status with details',
        testData: { query: 'What is my KYC status?' }
      },
      {
        id: 'INT-TC-006',
        name: 'Human handoff trigger',
        description: 'Verify chatbot transfers to human agent',
        preconditions: ['Chatbot session active'],
        steps: [
          'Request to speak with human',
          'Verify handoff'
        ],
        expectedResult: 'Session transferred with full context',
        testData: { trigger: 'speak to human' }
      }
    ]
  },

  // Notification Integration
  NOTIFICATIONS: {
    id: 'INT-TS-003',
    name: 'Notification Service Integration',
    description: 'Verify email and SMS notification delivery',
    category: 'Notifications',
    priority: 'Medium',
    requirements: ['US-020', 'EXT-INT-001', 'EXT-INT-002'],
    testCases: [
      {
        id: 'INT-TC-007',
        name: 'KYC approval email',
        description: 'Verify KYC approval email is sent',
        preconditions: ['Email service configured'],
        steps: [
          'Approve customer KYC',
          'Verify email sent'
        ],
        expectedResult: 'Email received with correct content',
        testData: { notificationType: 'EMAIL', event: 'KYC_APPROVED' }
      },
      {
        id: 'INT-TC-008',
        name: 'Suspicious activity SMS alert',
        description: 'Verify SMS sent for suspicious activity',
        preconditions: ['SMS gateway configured', 'Customer phone verified'],
        steps: [
          'Flag suspicious transaction',
          'Verify SMS sent'
        ],
        expectedResult: 'SMS received within 30 seconds',
        testData: { notificationType: 'SMS', event: 'SUSPICIOUS_ACTIVITY' }
      }
    ]
  }
};

/**
 * Performance Test Scenarios
 */
const PERFORMANCE_SCENARIOS = {
  LOAD_TESTING: {
    id: 'PERF-TS-001',
    name: 'System Load Testing',
    description: 'Verify system performance under load',
    category: 'Performance',
    priority: 'Medium',
    requirements: ['US-025', 'SCALE-001', 'PERF-001'],
    testCases: [
      {
        id: 'PERF-TC-001',
        name: 'Concurrent user load test',
        description: 'Verify system handles 10,000 concurrent users',
        preconditions: ['Load testing environment ready'],
        steps: [
          'Simulate 10,000 concurrent users',
          'Measure response times',
          'Check error rates'
        ],
        expectedResult: 'Response time < 2s, error rate < 1%',
        testData: { users: 10000, maxResponseTime: 2000, maxErrorRate: 0.01 }
      },
      {
        id: 'PERF-TC-002',
        name: 'Transaction throughput test',
        description: 'Verify system handles 500 TPS',
        preconditions: ['Load testing environment ready'],
        steps: [
          'Generate 500 transactions per second',
          'Measure processing time'
        ],
        expectedResult: 'All transactions processed within SLA',
        testData: { tps: 500 }
      }
    ]
  }
};

/**
 * Get all test scenarios
 * @returns {Object} All test scenarios organized by category
 */
function getAllScenarios() {
  return {
    kyc: KYC_SCENARIOS,
    aml: AML_SCENARIOS,
    integration: INTEGRATION_SCENARIOS,
    performance: PERFORMANCE_SCENARIOS
  };
}

/**
 * Get test cases by requirement ID
 * @param {string} requirementId - Requirement ID to filter by
 * @returns {Array} Test cases linked to the requirement
 */
function getTestCasesByRequirement(requirementId) {
  const allScenarios = getAllScenarios();
  const linkedTestCases = [];

  for (const category of Object.values(allScenarios)) {
    for (const scenario of Object.values(category)) {
      if (scenario.requirements && scenario.requirements.includes(requirementId)) {
        linkedTestCases.push(...scenario.testCases.map(tc => ({
          ...tc,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          category: scenario.category
        })));
      }
    }
  }

  return linkedTestCases;
}

/**
 * Get test case count summary
 * @returns {Object} Summary of test cases by category
 */
function getTestCaseSummary() {
  const allScenarios = getAllScenarios();
  const summary = {};

  for (const [categoryName, category] of Object.entries(allScenarios)) {
    let totalCases = 0;
    let highPriority = 0;
    let mediumPriority = 0;

    for (const scenario of Object.values(category)) {
      totalCases += scenario.testCases.length;
      if (scenario.priority === 'High') {
        highPriority += scenario.testCases.length;
      } else if (scenario.priority === 'Medium') {
        mediumPriority += scenario.testCases.length;
      }
    }

    summary[categoryName] = {
      scenarios: Object.keys(category).length,
      testCases: totalCases,
      highPriority,
      mediumPriority
    };
  }

  return summary;
}

/**
 * Get flat list of all test cases
 * @returns {Array} All test cases as flat array
 */
function getAllTestCases() {
  const allScenarios = getAllScenarios();
  const testCases = [];

  for (const category of Object.values(allScenarios)) {
    for (const scenario of Object.values(category)) {
      testCases.push(...scenario.testCases.map(tc => ({
        ...tc,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        category: scenario.category,
        priority: scenario.priority,
        requirements: scenario.requirements
      })));
    }
  }

  return testCases;
}

module.exports = {
  KYC_SCENARIOS,
  AML_SCENARIOS,
  INTEGRATION_SCENARIOS,
  PERFORMANCE_SCENARIOS,
  getAllScenarios,
  getTestCasesByRequirement,
  getTestCaseSummary,
  getAllTestCases
};

// If run directly, display summary
if (require.main === module) {
  console.log('Test Scenarios Summary\n');
  console.log('======================\n');

  const summary = getTestCaseSummary();

  for (const [category, data] of Object.entries(summary)) {
    console.log(`${category.toUpperCase()}:`);
    console.log(`  Scenarios: ${data.scenarios}`);
    console.log(`  Test Cases: ${data.testCases}`);
    console.log(`  High Priority: ${data.highPriority}`);
    console.log(`  Medium Priority: ${data.mediumPriority}`);
    console.log('');
  }

  const allTestCases = getAllTestCases();
  console.log(`Total Test Cases: ${allTestCases.length}`);
}
