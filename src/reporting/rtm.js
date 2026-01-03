/**
 * Requirements Traceability Matrix (RTM) Generator
 *
 * Maps test cases to requirements and generates traceability reports
 *
 * @module rtm
 */

const fs = require('fs');
const path = require('path');
const testScenarios = require('../test-scenarios/test-scenarios');

/**
 * Requirement definitions from requirements.md
 */
const REQUIREMENTS = {
  // Chatbot Requirements
  'CB-001': { id: 'CB-001', name: 'The chatbot shall provide 24/7 automated customer support', category: 'Chatbot', priority: 'High' },
  'CB-002': { id: 'CB-002', name: 'The chatbot shall handle multiple concurrent user sessions', category: 'Chatbot', priority: 'High' },
  'CB-003': { id: 'CB-003', name: 'The chatbot shall maintain conversation context', category: 'Chatbot', priority: 'High' },
  'CB-004': { id: 'CB-004', name: 'The chatbot shall provide seamless handoff to human agents', category: 'Chatbot', priority: 'Medium' },
  'CB-005': { id: 'CB-005', name: 'The chatbot shall support multi-language interactions', category: 'Chatbot', priority: 'Medium' },
  'CB-006': { id: 'CB-006', name: 'The chatbot shall log all conversations for audit', category: 'Chatbot', priority: 'High' },
  'CB-008': { id: 'CB-008', name: 'The chatbot shall provide guided workflows for KYC', category: 'Chatbot', priority: 'High' },

  // KYC Chatbot Requirements
  'KYC-CB-001': { id: 'KYC-CB-001', name: 'Guide customers through identity verification', category: 'KYC', priority: 'High' },
  'KYC-CB-002': { id: 'KYC-CB-002', name: 'Accept and validate document uploads', category: 'KYC', priority: 'High' },
  'KYC-CB-003': { id: 'KYC-CB-003', name: 'Provide real-time KYC status updates', category: 'KYC', priority: 'Medium' },
  'KYC-CB-004': { id: 'KYC-CB-004', name: 'Request additional documentation when verification fails', category: 'KYC', priority: 'High' },
  'KYC-CB-005': { id: 'KYC-CB-005', name: 'Explain KYC requirements in plain language', category: 'KYC', priority: 'Medium' },

  // AML Chatbot Requirements
  'AML-CB-001': { id: 'AML-CB-001', name: 'Notify customers of flagged transactions', category: 'AML', priority: 'High' },
  'AML-CB-005': { id: 'AML-CB-005', name: 'Enforce transaction limits based on KYC tier', category: 'AML', priority: 'High' },

  // NLP Requirements
  'NLP-001': { id: 'NLP-001', name: 'Achieve minimum 95% intent recognition accuracy', category: 'NLP', priority: 'High' },
  'NLP-005': { id: 'NLP-005', name: 'Understand context from previous messages', category: 'NLP', priority: 'High' },
  'NLP-010': { id: 'NLP-010', name: 'Provide confidence scores for classifications', category: 'NLP', priority: 'Medium' },

  // Integration Requirements
  'INT-001': { id: 'INT-001', name: 'Integrate with Core Banking System via REST APIs', category: 'Integration', priority: 'High' },
  'INT-002': { id: 'INT-002', name: 'Support real-time balance inquiries', category: 'Integration', priority: 'High' },
  'INT-008': { id: 'INT-008', name: 'Customer requesting to speak with human', category: 'Integration', priority: 'High' },

  // KYC Integration Requirements
  'KYC-INT-001': { id: 'KYC-INT-001', name: 'Integrate with document verification service', category: 'KYC Integration', priority: 'High' },
  'KYC-INT-002': { id: 'KYC-INT-002', name: 'Integrate with identity verification provider', category: 'KYC Integration', priority: 'High' },
  'KYC-INT-004': { id: 'KYC-INT-004', name: 'Integrate with biometric verification system', category: 'KYC Integration', priority: 'Medium' },

  // AML Integration Requirements
  'AML-INT-001': { id: 'AML-INT-001', name: 'Integrate with transaction monitoring system', category: 'AML Integration', priority: 'High' },
  'AML-INT-002': { id: 'AML-INT-002', name: 'Integrate with sanctions screening database', category: 'AML Integration', priority: 'High' },
  'AML-INT-003': { id: 'AML-INT-003', name: 'Integrate with PEP database', category: 'AML Integration', priority: 'High' },
  'AML-INT-004': { id: 'AML-INT-004', name: 'Integrate with case management system', category: 'AML Integration', priority: 'High' },
  'AML-INT-005': { id: 'AML-INT-005', name: 'Integrate with risk scoring engine', category: 'AML Integration', priority: 'High' },

  // External Integration Requirements
  'EXT-INT-001': { id: 'EXT-INT-001', name: 'Integrate with email notification service', category: 'External', priority: 'Medium' },
  'EXT-INT-002': { id: 'EXT-INT-002', name: 'Integrate with SMS gateway', category: 'External', priority: 'Medium' },
  'EXT-INT-005': { id: 'EXT-INT-005', name: 'Integrate with analytics platform', category: 'External', priority: 'Low' },

  // Scalability Requirements
  'SCALE-001': { id: 'SCALE-001', name: 'Support 10,000 concurrent users', category: 'Scalability', priority: 'High' },
  'SCALE-004': { id: 'SCALE-004', name: 'Support horizontal scaling', category: 'Scalability', priority: 'High' },
  'SCALE-005': { id: 'SCALE-005', name: 'Implement auto-scaling', category: 'Scalability', priority: 'Medium' },

  // Performance Requirements
  'PERF-001': { id: 'PERF-001', name: 'Chatbot response time < 2 seconds', category: 'Performance', priority: 'High' },
  'PERF-005': { id: 'PERF-005', name: 'Transaction screening < 1 second', category: 'Performance', priority: 'High' },
  'PERF-006': { id: 'PERF-006', name: 'Balance inquiry response < 1 second', category: 'Performance', priority: 'High' },

  // Accuracy Requirements
  'ACC-002': { id: 'ACC-002', name: 'Document OCR accuracy > 98%', category: 'Accuracy', priority: 'High' },
  'ACC-003': { id: 'ACC-003', name: 'Facial recognition match rate > 99%', category: 'Accuracy', priority: 'High' },
  'ACC-004': { id: 'ACC-004', name: 'AML false positive rate < 5%', category: 'Accuracy', priority: 'High' },
  'ACC-005': { id: 'ACC-005', name: 'Sanctions screening accuracy 100%', category: 'Accuracy', priority: 'High' },

  // Availability Requirements
  'AVAIL-001': { id: 'AVAIL-001', name: 'System uptime 99.9%', category: 'Availability', priority: 'High' },

  // Compliance Requirements
  'COMP-003': { id: 'COMP-003', name: 'Comply with BSA/AML regulations', category: 'Compliance', priority: 'High' },
  'COMP-004': { id: 'COMP-004', name: 'Maintain comprehensive audit trails', category: 'Compliance', priority: 'High' },

  // User Story Requirements
  'US-001': { id: 'US-001', name: 'Customer Document Upload', category: 'User Story', priority: 'High' },
  'US-003': { id: 'US-003', name: 'Identity Verification', category: 'User Story', priority: 'High' },
  'US-004': { id: 'US-004', name: 'KYC Status Tracking', category: 'User Story', priority: 'Medium' },
  'US-005': { id: 'US-005', name: 'KYC Rejection Handling', category: 'User Story', priority: 'High' },
  'US-006': { id: 'US-006', name: 'Risk-Based KYC Tiers', category: 'User Story', priority: 'High' },
  'US-007': { id: 'US-007', name: 'Real-Time Transaction Screening', category: 'User Story', priority: 'High' },
  'US-008': { id: 'US-008', name: 'Sanctions List Screening', category: 'User Story', priority: 'High' },
  'US-009': { id: 'US-009', name: 'PEP Screening', category: 'User Story', priority: 'High' },
  'US-010': { id: 'US-010', name: 'Suspicious Activity Alerts', category: 'User Story', priority: 'High' },
  'US-011': { id: 'US-011', name: 'Case Management for Investigations', category: 'User Story', priority: 'High' },
  'US-012': { id: 'US-012', name: 'Basic Chatbot Interaction', category: 'User Story', priority: 'High' },
  'US-013': { id: 'US-013', name: 'Intent Recognition', category: 'User Story', priority: 'High' },
  'US-014': { id: 'US-014', name: 'KYC Assistance via Chatbot', category: 'User Story', priority: 'High' },
  'US-017': { id: 'US-017', name: 'Core Banking API Integration', category: 'User Story', priority: 'High' },
  'US-020': { id: 'US-020', name: 'Notification Service Integration', category: 'User Story', priority: 'Medium' },
  'US-025': { id: 'US-025', name: 'Load Testing Implementation', category: 'User Story', priority: 'Medium' }
};

/**
 * Build RTM from test scenarios
 * @returns {Object} Complete RTM data
 */
function buildRTM() {
  const allTestCases = testScenarios.getAllTestCases();
  const rtm = {};

  // Initialize RTM with all requirements
  Object.keys(REQUIREMENTS).forEach(reqId => {
    rtm[reqId] = {
      ...REQUIREMENTS[reqId],
      testCases: [],
      coverage: 'Not Covered'
    };
  });

  // Map test cases to requirements
  allTestCases.forEach(testCase => {
    if (testCase.requirements) {
      testCase.requirements.forEach(reqId => {
        if (rtm[reqId]) {
          rtm[reqId].testCases.push({
            id: testCase.id,
            name: testCase.name,
            scenario: testCase.scenarioName,
            priority: testCase.priority
          });
          rtm[reqId].coverage = 'Covered';
        }
      });
    }
  });

  return rtm;
}

/**
 * Generate RTM summary statistics
 * @param {Object} rtm - RTM data
 * @returns {Object} Summary statistics
 */
function generateRTMSummary(rtm) {
  const stats = {
    totalRequirements: Object.keys(rtm).length,
    covered: 0,
    notCovered: 0,
    totalTestCases: 0,
    byCategory: {},
    byPriority: {
      High: { total: 0, covered: 0 },
      Medium: { total: 0, covered: 0 },
      Low: { total: 0, covered: 0 }
    }
  };

  Object.values(rtm).forEach(req => {
    if (req.coverage === 'Covered') {
      stats.covered++;
    } else {
      stats.notCovered++;
    }

    stats.totalTestCases += req.testCases.length;

    // By category
    if (!stats.byCategory[req.category]) {
      stats.byCategory[req.category] = { total: 0, covered: 0 };
    }
    stats.byCategory[req.category].total++;
    if (req.coverage === 'Covered') {
      stats.byCategory[req.category].covered++;
    }

    // By priority
    if (stats.byPriority[req.priority]) {
      stats.byPriority[req.priority].total++;
      if (req.coverage === 'Covered') {
        stats.byPriority[req.priority].covered++;
      }
    }
  });

  stats.coveragePercentage = ((stats.covered / stats.totalRequirements) * 100).toFixed(1);

  return stats;
}

/**
 * Generate RTM markdown report
 * @param {Object} rtm - RTM data
 * @param {Object} summary - Summary statistics
 * @returns {string} Markdown content
 */
function generateRTMMarkdown(rtm, summary) {
  let markdown = `# Requirements Traceability Matrix (RTM)
## AI-Driven Customer Support Platform with KYC/AML Capabilities

### Document Information
- **Project:** TechSpark Solutions - KYC/AML Banking Platform
- **Generated:** ${new Date().toISOString()}
- **Generated Using:** Generative AI Tools

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Requirements | ${summary.totalRequirements} |
| Covered Requirements | ${summary.covered} |
| Not Covered | ${summary.notCovered} |
| Coverage Percentage | ${summary.coveragePercentage}% |
| Total Test Cases | ${summary.totalTestCases} |

---

## Coverage by Priority

| Priority | Total | Covered | Coverage % |
|----------|-------|---------|------------|
| High | ${summary.byPriority.High.total} | ${summary.byPriority.High.covered} | ${((summary.byPriority.High.covered / summary.byPriority.High.total) * 100).toFixed(1)}% |
| Medium | ${summary.byPriority.Medium.total} | ${summary.byPriority.Medium.covered} | ${summary.byPriority.Medium.total > 0 ? ((summary.byPriority.Medium.covered / summary.byPriority.Medium.total) * 100).toFixed(1) : 'N/A'}% |
| Low | ${summary.byPriority.Low.total} | ${summary.byPriority.Low.covered} | ${summary.byPriority.Low.total > 0 ? ((summary.byPriority.Low.covered / summary.byPriority.Low.total) * 100).toFixed(1) : 'N/A'}% |

---

## Coverage by Category

| Category | Total | Covered | Coverage % |
|----------|-------|---------|------------|
`;

  Object.entries(summary.byCategory).forEach(([category, data]) => {
    const pct = data.total > 0 ? ((data.covered / data.total) * 100).toFixed(1) : 'N/A';
    markdown += `| ${category} | ${data.total} | ${data.covered} | ${pct}% |\n`;
  });

  markdown += `
---

## Detailed Traceability Matrix

`;

  // Group by category
  const byCategory = {};
  Object.values(rtm).forEach(req => {
    if (!byCategory[req.category]) {
      byCategory[req.category] = [];
    }
    byCategory[req.category].push(req);
  });

  Object.entries(byCategory).forEach(([category, requirements]) => {
    markdown += `### ${category}\n\n`;
    markdown += `| Req ID | Requirement | Priority | Coverage | Test Cases |\n`;
    markdown += `|--------|-------------|----------|----------|------------|\n`;

    requirements.forEach(req => {
      const testCaseList = req.testCases.length > 0
        ? req.testCases.map(tc => tc.id).join(', ')
        : '-';
      const coverage = req.coverage === 'Covered' ? '✅ Covered' : '❌ Not Covered';
      markdown += `| ${req.id} | ${req.name} | ${req.priority} | ${coverage} | ${testCaseList} |\n`;
    });

    markdown += '\n';
  });

  markdown += `---

## Test Case Details

`;

  const allTestCases = testScenarios.getAllTestCases();
  const testCasesByScenario = {};

  allTestCases.forEach(tc => {
    if (!testCasesByScenario[tc.scenarioName]) {
      testCasesByScenario[tc.scenarioName] = [];
    }
    testCasesByScenario[tc.scenarioName].push(tc);
  });

  Object.entries(testCasesByScenario).forEach(([scenario, cases]) => {
    markdown += `### ${scenario}\n\n`;
    markdown += `| Test Case ID | Name | Priority | Requirements |\n`;
    markdown += `|--------------|------|----------|---------------|\n`;

    cases.forEach(tc => {
      const reqs = tc.requirements ? tc.requirements.join(', ') : '-';
      markdown += `| ${tc.id} | ${tc.name} | ${tc.priority} | ${reqs} |\n`;
    });

    markdown += '\n';
  });

  markdown += `---

## Gaps Analysis

### Uncovered Requirements

`;

  const uncovered = Object.values(rtm).filter(req => req.coverage !== 'Covered');
  if (uncovered.length === 0) {
    markdown += `All requirements are covered by test cases.\n`;
  } else {
    markdown += `| Req ID | Requirement | Category | Priority |\n`;
    markdown += `|--------|-------------|----------|----------|\n`;
    uncovered.forEach(req => {
      markdown += `| ${req.id} | ${req.name} | ${req.category} | ${req.priority} |\n`;
    });
  }

  markdown += `
---

## Recommendations

1. **High Priority Gaps:** Address any uncovered high-priority requirements immediately
2. **Integration Testing:** Ensure all integration points have corresponding test cases
3. **Performance Testing:** Validate performance requirements with load tests
4. **Compliance:** Verify all compliance-related requirements have audit trail tests

---

*Report generated with assistance from Generative AI tools for TechSpark Solutions Test Management Framework*
`;

  return markdown;
}

/**
 * Generate and save RTM report
 * @param {string} outputPath - Path to save the report
 */
function generateAndSaveRTM(outputPath) {
  const rtm = buildRTM();
  const summary = generateRTMSummary(rtm);
  const markdown = generateRTMMarkdown(rtm, summary);

  const fullPath = outputPath || path.join(__dirname, '../../docs/rtm-matrix.md');

  fs.writeFileSync(fullPath, markdown);
  console.log(`RTM report generated: ${fullPath}`);

  return { rtm, summary };
}

/**
 * Get RTM data as JSON
 * @returns {Object} RTM data with summary
 */
function getRTMData() {
  const rtm = buildRTM();
  const summary = generateRTMSummary(rtm);

  return {
    rtm,
    summary,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  REQUIREMENTS,
  buildRTM,
  generateRTMSummary,
  generateRTMMarkdown,
  generateAndSaveRTM,
  getRTMData
};

// If run directly, generate the report
if (require.main === module) {
  console.log('Generating Requirements Traceability Matrix...\n');

  const { rtm, summary } = generateAndSaveRTM();

  console.log('\nRTM Summary:');
  console.log(`  Total Requirements: ${summary.totalRequirements}`);
  console.log(`  Covered: ${summary.covered}`);
  console.log(`  Not Covered: ${summary.notCovered}`);
  console.log(`  Coverage: ${summary.coveragePercentage}%`);
  console.log(`  Total Test Cases: ${summary.totalTestCases}`);
}
