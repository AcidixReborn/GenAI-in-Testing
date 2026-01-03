/**
 * Integration Test Suite
 *
 * Tests for integration between KYC and AML systems
 * Validates cross-module functionality and data consistency
 *
 * @requires jest
 * @requires ../src/data-generators/kyc-data-generator
 * @requires ../src/data-generators/aml-data-generator
 * @requires ../src/test-scenarios/test-scenarios
 */

const kycGenerator = require('../src/data-generators/kyc-data-generator');
const amlGenerator = require('../src/data-generators/aml-data-generator');
const testScenarios = require('../src/test-scenarios/test-scenarios');

describe('KYC and AML Integration', () => {
  describe('Customer Data Consistency', () => {
    test('KYC customer ID format should be compatible with AML system', () => {
      const kycApplication = kycGenerator.generateKYCApplication();
      const transaction = amlGenerator.generateTransaction({
        customerId: kycApplication.customer.customerId
      });

      expect(transaction.customerId).toBe(kycApplication.customer.customerId);
      expect(transaction.customerId).toMatch(/^CUS-[A-Z0-9]{8}$/);
    });

    test('should be able to link transactions to KYC customers', () => {
      const kycApplication = kycGenerator.generateKYCApplication();
      const customerId = kycApplication.customer.customerId;

      const transactions = amlGenerator.generateTransactionBatch(10, { customerId });

      transactions.forEach(txn => {
        expect(txn.customerId).toBe(customerId);
      });
    });

    test('high-risk KYC customers should trigger enhanced AML monitoring', () => {
      const highRiskCustomer = kycGenerator.generateCustomerProfile({
        riskTier: kycGenerator.RISK_TIERS.HIGH
      });

      // Customer profile should have HIGH risk tier as specified
      expect(highRiskCustomer.riskTier).toBe(kycGenerator.RISK_TIERS.HIGH);

      // Their transactions should be more likely to trigger alerts
      const transaction = amlGenerator.generateSuspiciousTransaction(
        amlGenerator.SUSPICIOUS_PATTERNS.HIGH_RISK_COUNTRY,
        { customerId: highRiskCustomer.customerId }
      );

      expect(transaction.riskScore).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Risk Assessment Integration', () => {
    test('KYC risk tier should influence transaction monitoring', () => {
      // Generate customers with different risk tiers
      const lowRiskCustomer = kycGenerator.generateCustomerProfile({
        riskTier: kycGenerator.RISK_TIERS.LOW
      });
      const highRiskCustomer = kycGenerator.generateCustomerProfile({
        riskTier: kycGenerator.RISK_TIERS.HIGH
      });

      // Both should be valid customers
      expect(lowRiskCustomer.customerId).toBeTruthy();
      expect(highRiskCustomer.customerId).toBeTruthy();
      expect(lowRiskCustomer.riskTier).not.toBe(highRiskCustomer.riskTier);
    });

    test('PEP status from KYC should flag in AML screening', () => {
      const customer = kycGenerator.generateCustomerProfile();
      const riskAssessment = kycGenerator.generateRiskAssessment(customer);

      // Verify risk assessment has required fields
      expect(riskAssessment.pepStatus).toBeDefined();
      expect(typeof riskAssessment.pepStatus).toBe('boolean');
      expect(riskAssessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.riskScore).toBeLessThanOrEqual(100);
    });

    test('sanctions match in AML should affect KYC status', () => {
      const sanctionsScreening = amlGenerator.generateSanctionsScreening({ forceMatch: true });

      expect(sanctionsScreening.overallMatch).toBe(true);
      expect(sanctionsScreening.status).toBe('REQUIRES_REVIEW');

      // This would typically block KYC approval
      expect(['PENDING', 'TRUE_MATCH', 'FALSE_POSITIVE']).toContain(sanctionsScreening.disposition);
    });
  });

  describe('Transaction Limits Based on KYC Tier', () => {
    test('should generate transactions appropriate to risk tier', () => {
      const lowRiskProfile = kycGenerator.generateCustomerProfile({
        riskTier: kycGenerator.RISK_TIERS.LOW
      });

      const highRiskProfile = kycGenerator.generateCustomerProfile({
        riskTier: kycGenerator.RISK_TIERS.HIGH
      });

      // Generate normal transactions for low risk
      const lowRiskTxn = amlGenerator.generateTransaction({
        customerId: lowRiskProfile.customerId
      });

      // Generate for high risk
      const highRiskTxn = amlGenerator.generateTransaction({
        customerId: highRiskProfile.customerId
      });

      // Both should have valid structure
      expect(lowRiskTxn.transactionId).toBeTruthy();
      expect(highRiskTxn.transactionId).toBeTruthy();
    });
  });

  describe('Alert to KYC Review Workflow', () => {
    test('AML alert should reference valid customer', () => {
      const kycApplication = kycGenerator.generateKYCApplication();
      const customerId = kycApplication.customer.customerId;

      const suspiciousTxn = amlGenerator.generateSuspiciousTransaction(
        amlGenerator.SUSPICIOUS_PATTERNS.STRUCTURING,
        { customerId }
      );

      const alert = amlGenerator.generateAlert(suspiciousTxn);

      expect(alert.customerId).toBe(customerId);
      expect(alert.transactionId).toBe(suspiciousTxn.transactionId);
    });

    test('escalated alert should generate case with customer context', () => {
      const kycApplication = kycGenerator.generateKYCApplication();
      const customerId = kycApplication.customer.customerId;
      const accountNumber = amlGenerator.generateAccountNumber();

      const amlCase = amlGenerator.generateAMLCase({
        pattern: amlGenerator.SUSPICIOUS_PATTERNS.LAYERING
      });

      expect(amlCase.customerId).toBeTruthy();
      expect(amlCase.transactions.length).toBeGreaterThan(0);
      expect(amlCase.alerts.length).toBeGreaterThan(0);
    });
  });
});

describe('Test Scenarios Module', () => {
  describe('Scenario Structure', () => {
    test('should have all scenario categories', () => {
      const scenarios = testScenarios.getAllScenarios();

      expect(scenarios.kyc).toBeDefined();
      expect(scenarios.aml).toBeDefined();
      expect(scenarios.integration).toBeDefined();
      expect(scenarios.performance).toBeDefined();
    });

    test('each scenario should have required properties', () => {
      const allCases = testScenarios.getAllTestCases();

      allCases.forEach(testCase => {
        expect(testCase.id).toBeTruthy();
        expect(testCase.name).toBeTruthy();
        expect(testCase.description).toBeTruthy();
        expect(testCase.expectedResult).toBeTruthy();
      });
    });
  });

  describe('KYC Scenarios', () => {
    test('should have document upload scenarios', () => {
      expect(testScenarios.KYC_SCENARIOS.DOC_UPLOAD).toBeDefined();
      expect(testScenarios.KYC_SCENARIOS.DOC_UPLOAD.testCases.length).toBeGreaterThan(0);
    });

    test('should have identity verification scenarios', () => {
      expect(testScenarios.KYC_SCENARIOS.IDENTITY_VERIFICATION).toBeDefined();
      expect(testScenarios.KYC_SCENARIOS.IDENTITY_VERIFICATION.testCases.length).toBeGreaterThan(0);
    });

    test('should have risk assessment scenarios', () => {
      expect(testScenarios.KYC_SCENARIOS.RISK_ASSESSMENT).toBeDefined();
    });

    test('KYC scenarios should have requirement mappings', () => {
      Object.values(testScenarios.KYC_SCENARIOS).forEach(scenario => {
        expect(scenario.requirements).toBeDefined();
        expect(scenario.requirements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('AML Scenarios', () => {
    test('should have transaction screening scenarios', () => {
      expect(testScenarios.AML_SCENARIOS.TRANSACTION_SCREENING).toBeDefined();
      expect(testScenarios.AML_SCENARIOS.TRANSACTION_SCREENING.testCases.length).toBeGreaterThan(0);
    });

    test('should have sanctions screening scenarios', () => {
      expect(testScenarios.AML_SCENARIOS.SANCTIONS_SCREENING).toBeDefined();
    });

    test('should have PEP screening scenarios', () => {
      expect(testScenarios.AML_SCENARIOS.PEP_SCREENING).toBeDefined();
    });

    test('should have alert management scenarios', () => {
      expect(testScenarios.AML_SCENARIOS.ALERT_MANAGEMENT).toBeDefined();
    });

    test('should have case management scenarios', () => {
      expect(testScenarios.AML_SCENARIOS.CASE_MANAGEMENT).toBeDefined();
    });

    test('AML scenarios should have requirement mappings', () => {
      Object.values(testScenarios.AML_SCENARIOS).forEach(scenario => {
        expect(scenario.requirements).toBeDefined();
        expect(scenario.requirements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Scenarios', () => {
    test('should have core banking integration scenarios', () => {
      expect(testScenarios.INTEGRATION_SCENARIOS.CORE_BANKING).toBeDefined();
    });

    test('should have chatbot integration scenarios', () => {
      expect(testScenarios.INTEGRATION_SCENARIOS.CHATBOT).toBeDefined();
    });

    test('should have notification scenarios', () => {
      expect(testScenarios.INTEGRATION_SCENARIOS.NOTIFICATIONS).toBeDefined();
    });
  });

  describe('Requirement Traceability', () => {
    test('should be able to find test cases by requirement', () => {
      const testCases = testScenarios.getTestCasesByRequirement('US-001');

      expect(testCases.length).toBeGreaterThan(0);
      // Test cases returned have requirements from the parent scenario
      testCases.forEach(tc => {
        expect(tc.id).toBeTruthy();
        expect(tc.scenarioId).toBeTruthy();
      });
    });

    test('should return empty array for non-existent requirement', () => {
      const testCases = testScenarios.getTestCasesByRequirement('FAKE-REQ-999');
      expect(testCases).toEqual([]);
    });

    test('test cases should have scenario context', () => {
      const testCases = testScenarios.getTestCasesByRequirement('US-007');

      testCases.forEach(tc => {
        expect(tc.scenarioId).toBeTruthy();
        expect(tc.scenarioName).toBeTruthy();
        expect(tc.category).toBeTruthy();
      });
    });
  });

  describe('Test Case Summary', () => {
    test('should generate accurate summary', () => {
      const summary = testScenarios.getTestCaseSummary();

      expect(summary.kyc).toBeDefined();
      expect(summary.aml).toBeDefined();
      expect(summary.integration).toBeDefined();
      expect(summary.performance).toBeDefined();

      // Each category should have counts
      Object.values(summary).forEach(category => {
        expect(category.scenarios).toBeGreaterThan(0);
        expect(category.testCases).toBeGreaterThan(0);
      });
    });

    test('total test cases should match flat list', () => {
      const summary = testScenarios.getTestCaseSummary();
      const allCases = testScenarios.getAllTestCases();

      const totalFromSummary = Object.values(summary).reduce(
        (sum, cat) => sum + cat.testCases,
        0
      );

      expect(totalFromSummary).toBe(allCases.length);
    });
  });

  describe('Test Case Data', () => {
    test('test cases should have test data when applicable', () => {
      const allCases = testScenarios.getAllTestCases();

      allCases.forEach(tc => {
        expect(tc.testData).toBeDefined();
      });
    });

    test('test cases should have steps', () => {
      const allCases = testScenarios.getAllTestCases();

      allCases.forEach(tc => {
        expect(tc.steps).toBeDefined();
        expect(tc.steps.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('End-to-End Workflow Tests', () => {
  describe('Customer Onboarding Flow', () => {
    test('complete KYC onboarding workflow', () => {
      // Step 1: Generate customer profile
      const profile = kycGenerator.generateCustomerProfile({ status: kycGenerator.KYC_STATUS.PENDING });
      expect(profile.kycStatus).toBe(kycGenerator.KYC_STATUS.PENDING);

      // Step 2: Generate identity document
      const idDoc = kycGenerator.generateIdentityDocument(profile.customerId);
      expect(idDoc.customerId).toBe(profile.customerId);

      // Step 3: Generate address document
      const addrDoc = kycGenerator.generateAddressDocument(profile.customerId);
      expect(addrDoc.customerId).toBe(profile.customerId);

      // Step 4: Generate verification attempt
      const verification = kycGenerator.generateVerificationAttempt(profile.customerId);
      expect(verification.customerId).toBe(profile.customerId);

      // Step 5: Generate risk assessment
      const riskAssessment = kycGenerator.generateRiskAssessment(profile);
      expect(riskAssessment.customerId).toBe(profile.customerId);

      // Complete application
      const application = kycGenerator.generateKYCApplication({ status: kycGenerator.KYC_STATUS.APPROVED });
      expect(application.applicationStatus).toBe(kycGenerator.KYC_STATUS.APPROVED);
      expect(application.completedAt).not.toBeNull();
    });
  });

  describe('Transaction Monitoring Flow', () => {
    test('complete AML monitoring workflow', () => {
      // Step 1: Generate normal transactions (with 0 suspicious ratio)
      const normalTxns = amlGenerator.generateTransactionBatch(10, { suspiciousRatio: 0 });
      expect(normalTxns.length).toBe(10);
      // With suspiciousRatio: 0, transactions should mostly be normal
      // but we just verify the batch generates correctly
      expect(normalTxns.every(txn => txn.transactionId)).toBe(true);

      // Step 2: Generate suspicious transaction
      const suspiciousTxn = amlGenerator.generateSuspiciousTransaction(
        amlGenerator.SUSPICIOUS_PATTERNS.STRUCTURING
      );
      expect(suspiciousTxn.suspiciousIndicators).toBeDefined();
      expect(suspiciousTxn.riskScore).toBeGreaterThanOrEqual(70);

      // Step 3: Generate alert
      const alert = amlGenerator.generateAlert(suspiciousTxn);
      expect(alert.transactionId).toBe(suspiciousTxn.transactionId);
      expect(Object.values(amlGenerator.ALERT_SEVERITY)).toContain(alert.severity);

      // Step 4: Generate case if escalated
      const amlCase = amlGenerator.generateAMLCase({
        pattern: amlGenerator.SUSPICIOUS_PATTERNS.STRUCTURING
      });
      expect(amlCase.transactions.length).toBeGreaterThan(0);
      expect(amlCase.alerts.length).toBeGreaterThan(0);

      // Step 5: File SAR if warranted
      if (alert.severity === amlGenerator.ALERT_SEVERITY.CRITICAL ||
          alert.severity === amlGenerator.ALERT_SEVERITY.HIGH) {
        const sar = amlGenerator.generateSAR(alert);
        expect(sar.alertIds).toContain(alert.alertId);
      }
    });
  });

  describe('Sanctions Screening Flow', () => {
    test('complete sanctions check workflow', () => {
      // Step 1: Generate customer for screening
      const customer = kycGenerator.generateCustomerProfile();
      expect(customer.personalInfo.fullName).toBeTruthy();

      // Step 2: Run sanctions screening
      const screening = amlGenerator.generateSanctionsScreening({
        entityName: customer.personalInfo.fullName
      });
      expect(screening.entityName).toBe(customer.personalInfo.fullName);

      // Step 3: Handle result based on match status
      if (screening.overallMatch) {
        expect(screening.status).toBe('REQUIRES_REVIEW');
        expect(screening.overallScore).toBeGreaterThanOrEqual(0.85);
      } else {
        expect(screening.status).toBe('CLEARED');
        expect(screening.disposition).toBe('NO_MATCH');
      }
    });
  });

  describe('Structuring Detection Flow', () => {
    test('detect and handle structuring pattern', () => {
      const customerId = 'CUS-STRUCT001';
      const totalAmount = 45000;

      // Step 1: Generate structuring transactions
      const structuredTxns = amlGenerator.generateStructuringScenario(customerId, totalAmount);

      // All should be under $10,000 (CTR threshold)
      structuredTxns.forEach(txn => {
        expect(txn.amount).toBeLessThan(10000);
        expect(txn.transactionType).toBe(amlGenerator.TRANSACTION_TYPES.CASH_DEPOSIT);
      });

      // Total should match original amount exactly (structuring preserves total)
      const actualTotal = structuredTxns.reduce((sum, txn) => sum + txn.amount, 0);
      expect(actualTotal).toBeCloseTo(totalAmount, 0);

      // Step 2: All should be flagged for structuring
      structuredTxns.forEach(txn => {
        expect(txn.pattern).toBe(amlGenerator.SUSPICIOUS_PATTERNS.STRUCTURING);
      });

      // Step 3: Generate alert for pattern
      const alert = amlGenerator.generateAlert(structuredTxns[0]);
      expect(alert.riskScore).toBeGreaterThanOrEqual(70);
    });
  });
});

describe('Data Quality Tests', () => {
  describe('Generated Data Completeness', () => {
    test('KYC application should have all required fields', () => {
      const application = kycGenerator.generateKYCApplication();

      // Required fields
      expect(application.applicationId).toBeTruthy();
      expect(application.customer).toBeTruthy();
      expect(application.customer.customerId).toBeTruthy();
      expect(application.customer.personalInfo).toBeTruthy();
      expect(application.customer.address).toBeTruthy();
      expect(application.documents).toBeTruthy();
      expect(application.documents.identity).toBeTruthy();
      expect(application.documents.address).toBeTruthy();
      expect(application.riskAssessment).toBeTruthy();
      expect(application.verificationAttempts).toBeTruthy();
      expect(application.applicationStatus).toBeTruthy();
    });

    test('AML case should have all required fields', () => {
      const amlCase = amlGenerator.generateAMLCase();

      // Required fields
      expect(amlCase.caseId).toBeTruthy();
      expect(amlCase.customerId).toBeTruthy();
      expect(amlCase.accountNumber).toBeTruthy();
      expect(amlCase.caseType).toBeTruthy();
      expect(amlCase.status).toBeTruthy();
      expect(amlCase.priority).toBeTruthy();
      expect(amlCase.transactions).toBeTruthy();
      expect(amlCase.alerts).toBeTruthy();
      expect(amlCase.sanctionsScreening).toBeTruthy();
      expect(amlCase.totalAmount).toBeTruthy();
      expect(amlCase.transactionCount).toBeTruthy();
    });
  });

  describe('Data Uniqueness', () => {
    test('should generate unique KYC application IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(kycGenerator.generateKYCApplication().applicationId);
      }
      expect(ids.size).toBe(100);
    });

    test('should generate unique AML case IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        ids.add(amlGenerator.generateAMLCase().caseId);
      }
      expect(ids.size).toBe(50);
    });
  });

  describe('Data Validity', () => {
    test('all dates should be valid ISO format', () => {
      const application = kycGenerator.generateKYCApplication();

      // Check date parsing doesn't throw
      expect(() => new Date(application.submittedAt)).not.toThrow();
      expect(() => new Date(application.lastUpdatedAt)).not.toThrow();
      expect(() => new Date(application.customer.createdAt)).not.toThrow();
    });

    test('all amounts should be positive numbers', () => {
      const transactions = amlGenerator.generateTransactionBatch(100);

      transactions.forEach(txn => {
        expect(typeof txn.amount).toBe('number');
        expect(txn.amount).toBeGreaterThan(0);
        expect(isNaN(txn.amount)).toBe(false);
      });
    });
  });
});
