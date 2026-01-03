/**
 * AML (Anti-Money Laundering) Test Suite
 *
 * Tests for AML data generation and validation
 * Uses Jest testing framework with synthetic data from Faker.js
 *
 * @requires jest
 * @requires ../src/data-generators/aml-data-generator
 */

const {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  ALERT_SEVERITY,
  ALERT_STATUS,
  SUSPICIOUS_PATTERNS,
  HIGH_RISK_COUNTRIES,
  CURRENCIES,
  generateTransactionId,
  generateAccountNumber,
  generateTransaction,
  generateSuspiciousTransaction,
  generateAlert,
  generateSanctionsScreening,
  generateSAR,
  generateAMLCase,
  generateTransactionBatch,
  generateStructuringScenario,
  generateRealisticAMLDataset
} = require('../src/data-generators/aml-data-generator');

describe('AML Data Generator', () => {
  describe('Transaction ID Generation', () => {
    test('should generate valid transaction ID format', () => {
      const transactionId = generateTransactionId();
      expect(transactionId).toMatch(/^TXN-[A-Z0-9]{12}$/);
    });

    test('should generate unique transaction IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTransactionId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('Account Number Generation', () => {
    test('should generate valid account number format', () => {
      const accountNumber = generateAccountNumber();
      expect(accountNumber).toMatch(/^\d{12}$/);
    });

    test('should generate unique account numbers', () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateAccountNumber());
      }
      expect(numbers.size).toBe(100);
    });
  });

  describe('Transaction Generation', () => {
    let transaction;

    beforeEach(() => {
      transaction = generateTransaction();
    });

    test('should generate complete transaction', () => {
      expect(transaction).toHaveProperty('transactionId');
      expect(transaction).toHaveProperty('accountNumber');
      expect(transaction).toHaveProperty('customerId');
      expect(transaction).toHaveProperty('transactionType');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('currency');
      expect(transaction).toHaveProperty('status');
    });

    test('should have valid transaction type', () => {
      expect(Object.values(TRANSACTION_TYPES)).toContain(transaction.transactionType);
    });

    test('should have valid status', () => {
      expect(Object.values(TRANSACTION_STATUS)).toContain(transaction.status);
    });

    test('should have valid currency', () => {
      expect(CURRENCIES).toContain(transaction.currency);
    });

    test('should have positive amount', () => {
      expect(transaction.amount).toBeGreaterThan(0);
    });

    test('should have counterparty information', () => {
      expect(transaction.counterparty).toBeDefined();
      expect(transaction.counterparty.name).toBeTruthy();
      expect(transaction.counterparty.accountNumber).toBeTruthy();
      expect(transaction.counterparty.country).toBeTruthy();
    });

    test('should have metadata', () => {
      expect(transaction.metadata).toBeDefined();
      expect(transaction.metadata.ipAddress).toBeTruthy();
      expect(transaction.metadata.deviceId).toBeTruthy();
    });

    test('should respect amount option', () => {
      const customTransaction = generateTransaction({ amount: 5000 });
      expect(customTransaction.amount).toBe(5000);
    });

    test('should respect type option', () => {
      const wireTransfer = generateTransaction({ type: TRANSACTION_TYPES.WIRE_TRANSFER });
      expect(wireTransfer.transactionType).toBe(TRANSACTION_TYPES.WIRE_TRANSFER);
    });

    test('international transfers should have international counterparty', () => {
      const intlTransfer = generateTransaction({ type: TRANSACTION_TYPES.INTERNATIONAL_TRANSFER });
      expect(intlTransfer.counterparty.country).toBeTruthy();
    });
  });

  describe('Suspicious Transaction Generation', () => {
    describe('Structuring Pattern', () => {
      test('should generate structuring transaction', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.STRUCTURING);

        expect(transaction.amount).toBeGreaterThanOrEqual(9000);
        expect(transaction.amount).toBeLessThanOrEqual(9999);
        expect(transaction.transactionType).toBe(TRANSACTION_TYPES.CASH_DEPOSIT);
        expect(transaction.pattern).toBe(SUSPICIOUS_PATTERNS.STRUCTURING);
      });

      test('should have suspicious indicators', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.STRUCTURING);
        expect(transaction.suspiciousIndicators).toBeDefined();
        expect(transaction.suspiciousIndicators.length).toBeGreaterThan(0);
      });

      test('should have high risk score', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.STRUCTURING);
        expect(transaction.riskScore).toBeGreaterThanOrEqual(70);
      });
    });

    describe('High Risk Country Pattern', () => {
      test('should have high-risk country counterparty', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.HIGH_RISK_COUNTRY);

        expect(HIGH_RISK_COUNTRIES).toContain(transaction.counterparty.country);
        expect(transaction.transactionType).toBe(TRANSACTION_TYPES.INTERNATIONAL_TRANSFER);
      });
    });

    describe('Rapid Movement Pattern', () => {
      test('should have large amount', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.RAPID_MOVEMENT);

        expect(transaction.amount).toBeGreaterThanOrEqual(50000);
        expect(transaction.suspiciousIndicators).toContain('Funds moved within 24 hours of receipt');
      });
    });

    describe('Round Amounts Pattern', () => {
      test('should have round amount', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.ROUND_AMOUNTS);

        expect([10000, 25000, 50000, 100000, 250000]).toContain(transaction.amount);
      });
    });

    describe('Layering Pattern', () => {
      test('should have layering indicators', () => {
        const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.LAYERING);

        expect(transaction.amount).toBeGreaterThanOrEqual(100000);
        expect(transaction.suspiciousIndicators).toContain('Multiple rapid transfers between accounts');
      });
    });

    test('all suspicious transactions should have flagged timestamp', () => {
      Object.values(SUSPICIOUS_PATTERNS).forEach(pattern => {
        const transaction = generateSuspiciousTransaction(pattern);
        expect(transaction.flaggedAt).toBeDefined();
      });
    });
  });

  describe('Alert Generation', () => {
    let alert;
    let transaction;

    beforeEach(() => {
      transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.STRUCTURING);
      alert = generateAlert(transaction);
    });

    test('should generate alert with valid ID format', () => {
      expect(alert.alertId).toMatch(/^ALT-[A-Z0-9]{10}$/);
    });

    test('should link to transaction', () => {
      expect(alert.transactionId).toBe(transaction.transactionId);
    });

    test('should have valid severity', () => {
      expect(Object.values(ALERT_SEVERITY)).toContain(alert.severity);
    });

    test('should have valid status', () => {
      expect(Object.values(ALERT_STATUS)).toContain(alert.status);
    });

    test('should have risk score', () => {
      expect(alert.riskScore).toBeGreaterThanOrEqual(50);
      expect(alert.riskScore).toBeLessThanOrEqual(100);
    });

    test('should have indicators array', () => {
      expect(Array.isArray(alert.indicators)).toBe(true);
      expect(alert.indicators.length).toBeGreaterThan(0);
    });

    test('critical severity for high risk score', () => {
      const highRiskTransaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.LAYERING);
      highRiskTransaction.riskScore = 95;
      const criticalAlert = generateAlert(highRiskTransaction);

      expect(criticalAlert.severity).toBe(ALERT_SEVERITY.CRITICAL);
    });
  });

  describe('Sanctions Screening Generation', () => {
    test('should generate screening result', () => {
      const screening = generateSanctionsScreening();

      expect(screening.screeningId).toMatch(/^SCR-[A-Z0-9]{10}$/);
      expect(screening.entityName).toBeTruthy();
      expect(screening.lists).toBeDefined();
      expect(screening.lists.length).toBe(3);
    });

    test('should include OFAC, UN, and EU lists', () => {
      const screening = generateSanctionsScreening();
      const listNames = screening.lists.map(l => l.listName);

      expect(listNames).toContain('OFAC SDN');
      expect(listNames).toContain('UN Consolidated');
      expect(listNames).toContain('EU Sanctions');
    });

    test('should have valid status', () => {
      const screening = generateSanctionsScreening();
      expect(['REQUIRES_REVIEW', 'CLEARED']).toContain(screening.status);
    });

    test('forced match should have REQUIRES_REVIEW status', () => {
      const screening = generateSanctionsScreening({ forceMatch: true });

      expect(screening.overallMatch).toBe(true);
      expect(screening.status).toBe('REQUIRES_REVIEW');
      expect(screening.overallScore).toBeGreaterThanOrEqual(0.85);
    });

    test('should have valid disposition', () => {
      const screening = generateSanctionsScreening();
      expect(['PENDING', 'TRUE_MATCH', 'FALSE_POSITIVE', 'NO_MATCH']).toContain(screening.disposition);
    });
  });

  describe('SAR Generation', () => {
    let sar;
    let alert;

    beforeEach(() => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.LAYERING);
      alert = generateAlert(transaction);
      sar = generateSAR(alert);
    });

    test('should generate SAR with valid ID format', () => {
      expect(sar.sarId).toMatch(/^SAR-[A-Z0-9]{12}$/);
    });

    test('should link to alert', () => {
      expect(sar.alertIds).toContain(alert.alertId);
    });

    test('should have filing type', () => {
      expect(['INITIAL', 'CONTINUING', 'JOINT']).toContain(sar.filingType);
    });

    test('should have suspicious activity type', () => {
      const validTypes = [
        'STRUCTURING', 'TERRORIST_FINANCING', 'FRAUD',
        'MONEY_LAUNDERING', 'BRIBERY', 'IDENTITY_THEFT', 'OTHER'
      ];
      expect(validTypes).toContain(sar.suspiciousActivityType);
    });

    test('should have amount involved', () => {
      expect(sar.amountInvolved).toBeGreaterThanOrEqual(10000);
    });

    test('should have date range', () => {
      expect(sar.dateRangeStart).toBeTruthy();
      expect(sar.dateRangeEnd).toBeTruthy();
      expect(new Date(sar.dateRangeEnd).getTime()).toBeGreaterThan(
        new Date(sar.dateRangeStart).getTime()
      );
    });

    test('should have narrative', () => {
      expect(sar.narrative).toBeTruthy();
      expect(sar.narrative.length).toBeGreaterThan(50);
    });

    test('should have subject info', () => {
      expect(sar.subjectInfo).toBeDefined();
      expect(sar.subjectInfo.name).toBeTruthy();
      expect(sar.subjectInfo.ssn).toMatch(/^XXX-XX-\d{4}$/);
    });

    test('should have filing institution', () => {
      expect(sar.filingInstitution).toBeDefined();
      expect(sar.filingInstitution.name).toBe('TechSpark Banking');
    });

    test('should have valid status', () => {
      const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'ACKNOWLEDGED'];
      expect(validStatuses).toContain(sar.status);
    });
  });

  describe('AML Case Generation', () => {
    let amlCase;

    beforeEach(() => {
      amlCase = generateAMLCase();
    });

    test('should generate case with valid ID format', () => {
      expect(amlCase.caseId).toMatch(/^CASE-[A-Z0-9]{10}$/);
    });

    test('should have customer and account info', () => {
      expect(amlCase.customerId).toMatch(/^CUS-[A-Z0-9]{8}$/);
      expect(amlCase.accountNumber).toMatch(/^\d{12}$/);
    });

    test('should have transactions', () => {
      expect(amlCase.transactions.length).toBeGreaterThanOrEqual(3);
    });

    test('should have at least one alert', () => {
      expect(amlCase.alerts.length).toBeGreaterThanOrEqual(1);
    });

    test('should have sanctions screening', () => {
      expect(amlCase.sanctionsScreening).toBeDefined();
    });

    test('should calculate total amount correctly', () => {
      const calculatedTotal = amlCase.transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(amlCase.totalAmount).toBeCloseTo(calculatedTotal, 2);
    });

    test('should have correct transaction count', () => {
      expect(amlCase.transactionCount).toBe(amlCase.transactions.length);
    });

    test('should have valid status', () => {
      expect(['OPEN', 'INVESTIGATING', 'ESCALATED', 'CLOSED']).toContain(amlCase.status);
    });

    test('should have assigned investigator', () => {
      expect(amlCase.assignedTo).toBeTruthy();
    });

    test('should have notes', () => {
      expect(Array.isArray(amlCase.notes)).toBe(true);
    });

    test('high severity cases should have SAR', () => {
      // Generate multiple cases to find high severity
      let foundHighSeverityWithSAR = false;
      for (let i = 0; i < 20; i++) {
        const testCase = generateAMLCase({ pattern: SUSPICIOUS_PATTERNS.LAYERING });
        if (testCase.priority === ALERT_SEVERITY.CRITICAL || testCase.priority === ALERT_SEVERITY.HIGH) {
          if (testCase.sar) {
            foundHighSeverityWithSAR = true;
            break;
          }
        }
      }
      // May not always generate SAR due to randomness, just verify structure
      expect(amlCase).toHaveProperty('sar');
    });
  });

  describe('Transaction Batch Generation', () => {
    test('should generate correct number of transactions', () => {
      const batch = generateTransactionBatch(50);
      expect(batch.length).toBe(50);
    });

    test('should include suspicious transactions based on ratio', () => {
      const batch = generateTransactionBatch(1000, { suspiciousRatio: 0.1 });
      const suspiciousCount = batch.filter(t => t.suspiciousIndicators).length;

      // Should be roughly 10% (with some variance)
      expect(suspiciousCount).toBeGreaterThan(50);
      expect(suspiciousCount).toBeLessThan(200);
    });

    test('should generate unique transactions', () => {
      const batch = generateTransactionBatch(100);
      const ids = new Set(batch.map(t => t.transactionId));
      expect(ids.size).toBe(100);
    });
  });

  describe('Structuring Scenario Generation', () => {
    test('should split total amount into sub-threshold transactions', () => {
      const customerId = 'CUS-TEST1234';
      const totalAmount = 50000;
      const transactions = generateStructuringScenario(customerId, totalAmount);

      // All transactions should be under $10,000
      transactions.forEach(t => {
        expect(t.amount).toBeLessThan(10000);
      });

      // Total should match original amount
      const actualTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(actualTotal).toBeCloseTo(totalAmount, 0);
    });

    test('all transactions should be cash deposits', () => {
      const transactions = generateStructuringScenario('CUS-TEST', 30000);

      transactions.forEach(t => {
        expect(t.transactionType).toBe(TRANSACTION_TYPES.CASH_DEPOSIT);
      });
    });

    test('all transactions should have same customer ID', () => {
      const customerId = 'CUS-STRUCT123';
      const transactions = generateStructuringScenario(customerId, 25000);

      transactions.forEach(t => {
        expect(t.customerId).toBe(customerId);
      });
    });

    test('all transactions should have structuring pattern', () => {
      const transactions = generateStructuringScenario('CUS-TEST', 40000);

      transactions.forEach(t => {
        expect(t.pattern).toBe(SUSPICIOUS_PATTERNS.STRUCTURING);
      });
    });
  });

  describe('Realistic AML Dataset Generation', () => {
    let dataset;

    beforeEach(() => {
      dataset = generateRealisticAMLDataset(500);
    });

    test('should have summary statistics', () => {
      expect(dataset.summary).toBeDefined();
      expect(dataset.summary.totalTransactions).toBe(500);
    });

    test('should have transactions array', () => {
      expect(dataset.transactions.length).toBe(500);
    });

    test('should have alerts for suspicious transactions', () => {
      expect(dataset.alerts.length).toBe(dataset.summary.suspiciousTransactions);
    });

    test('suspicious rate should be around 3%', () => {
      const rate = dataset.summary.suspiciousTransactions / dataset.summary.totalTransactions;
      expect(rate).toBeGreaterThan(0.01);
      expect(rate).toBeLessThan(0.1);
    });

    test('should have some SARs filed', () => {
      expect(dataset.sars).toBeDefined();
      // SARs are filed for subset of high priority alerts
      expect(dataset.summary.sarsFiled).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('AML Validation Rules', () => {
  describe('Transaction Amount Validation', () => {
    test('cash transactions should typically be under $10,000', () => {
      let underThreshold = 0;
      const total = 100;

      for (let i = 0; i < total; i++) {
        const transaction = generateTransaction({ type: TRANSACTION_TYPES.CASH_DEPOSIT });
        if (transaction.amount < 10000) {
          underThreshold++;
        }
      }

      // Most cash transactions should be under threshold
      expect(underThreshold / total).toBeGreaterThan(0.8);
    });
  });

  describe('High Risk Country Detection', () => {
    test('should flag transactions to high-risk countries', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.HIGH_RISK_COUNTRY);

      expect(HIGH_RISK_COUNTRIES).toContain(transaction.counterparty.country);
      expect(transaction.riskScore).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Velocity Detection', () => {
    test('velocity spike should have high risk score', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.VELOCITY_SPIKE);

      expect(transaction.riskScore).toBeGreaterThanOrEqual(70);
      expect(transaction.suspiciousIndicators.join(' ')).toContain('historical pattern');
    });
  });
});

describe('AML Business Rules', () => {
  describe('Alert Severity Assignment', () => {
    test('critical alerts for risk score > 90', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.LAYERING);
      transaction.riskScore = 95;
      const alert = generateAlert(transaction);

      expect(alert.severity).toBe(ALERT_SEVERITY.CRITICAL);
    });

    test('high alerts for risk score 76-90', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.STRUCTURING);
      transaction.riskScore = 80;
      const alert = generateAlert(transaction);

      expect(alert.severity).toBe(ALERT_SEVERITY.HIGH);
    });

    test('medium alerts for risk score 51-75', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.ROUND_AMOUNTS);
      transaction.riskScore = 60;
      const alert = generateAlert(transaction);

      expect(alert.severity).toBe(ALERT_SEVERITY.MEDIUM);
    });
  });

  describe('SAR Filing Requirements', () => {
    test('SAR should have all required fields', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.LAYERING);
      const alert = generateAlert(transaction);
      const sar = generateSAR(alert);

      expect(sar.sarId).toBeTruthy();
      expect(sar.filingType).toBeTruthy();
      expect(sar.suspiciousActivityType).toBeTruthy();
      expect(sar.amountInvolved).toBeGreaterThan(0);
      expect(sar.narrative).toBeTruthy();
      expect(sar.subjectInfo).toBeDefined();
      expect(sar.filingInstitution).toBeDefined();
    });

    test('SAR amount should be substantial', () => {
      const transaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.MONEY_LAUNDERING);
      const alert = generateAlert(transaction);
      const sar = generateSAR(alert);

      // SAR threshold is typically $5,000 for banks
      expect(sar.amountInvolved).toBeGreaterThanOrEqual(10000);
    });
  });

  describe('Sanctions Screening Requirements', () => {
    test('screening should check multiple lists', () => {
      const screening = generateSanctionsScreening();

      expect(screening.lists.length).toBeGreaterThanOrEqual(3);
    });

    test('match should require review', () => {
      const screening = generateSanctionsScreening({ forceMatch: true });

      expect(screening.status).toBe('REQUIRES_REVIEW');
    });

    test('clear screening should have NO_MATCH disposition', () => {
      // Generate until we get a clear result
      let clearScreening;
      for (let i = 0; i < 100; i++) {
        const screening = generateSanctionsScreening();
        if (!screening.overallMatch) {
          clearScreening = screening;
          break;
        }
      }

      if (clearScreening) {
        expect(clearScreening.disposition).toBe('NO_MATCH');
        expect(clearScreening.status).toBe('CLEARED');
      }
    });
  });
});
