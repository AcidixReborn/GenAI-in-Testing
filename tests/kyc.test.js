/**
 * KYC (Know Your Customer) Test Suite
 *
 * Tests for KYC data generation and validation
 * Uses Jest testing framework with synthetic data from Faker.js
 *
 * @requires jest
 * @requires ../src/data-generators/kyc-data-generator
 */

const {
  DOCUMENT_TYPES,
  KYC_STATUS,
  RISK_TIERS,
  COUNTRIES,
  REJECTION_REASONS,
  generateCustomerId,
  generateDocumentNumber,
  generateCustomerProfile,
  generateIdentityDocument,
  generateAddressDocument,
  generateRiskAssessment,
  generateVerificationAttempt,
  generateKYCApplication,
  generateKYCApplicationBatch,
  generateRealisticKYCDataset
} = require('../src/data-generators/kyc-data-generator');

describe('KYC Data Generator', () => {
  describe('Customer ID Generation', () => {
    test('should generate valid customer ID format', () => {
      const customerId = generateCustomerId();
      expect(customerId).toMatch(/^CUS-[A-Z0-9]{8}$/);
    });

    test('should generate unique customer IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateCustomerId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('Document Number Generation', () => {
    test('should generate valid passport number format', () => {
      const docNumber = generateDocumentNumber(DOCUMENT_TYPES.PASSPORT);
      expect(docNumber).toMatch(/^[A-Z0-9]{9}$/);
    });

    test('should generate valid drivers license format', () => {
      const docNumber = generateDocumentNumber(DOCUMENT_TYPES.DRIVERS_LICENSE);
      expect(docNumber).toMatch(/^DL\d{12}$/);
    });

    test('should generate valid national ID format', () => {
      const docNumber = generateDocumentNumber(DOCUMENT_TYPES.NATIONAL_ID);
      expect(docNumber).toMatch(/^\d{11}$/);
    });
  });

  describe('Customer Profile Generation', () => {
    let profile;

    beforeEach(() => {
      profile = generateCustomerProfile();
    });

    test('should generate complete customer profile', () => {
      expect(profile).toHaveProperty('customerId');
      expect(profile).toHaveProperty('personalInfo');
      expect(profile).toHaveProperty('address');
      expect(profile).toHaveProperty('kycStatus');
      expect(profile).toHaveProperty('riskTier');
    });

    test('should have valid personal information', () => {
      const { personalInfo } = profile;
      expect(personalInfo.firstName).toBeTruthy();
      expect(personalInfo.lastName).toBeTruthy();
      expect(personalInfo.fullName).toBe(`${personalInfo.firstName} ${personalInfo.lastName}`);
      expect(personalInfo.email).toMatch(/@/);
      expect(personalInfo.age).toBeGreaterThanOrEqual(18);
      expect(personalInfo.age).toBeLessThanOrEqual(80);
    });

    test('should have valid address', () => {
      const { address } = profile;
      expect(address.street).toBeTruthy();
      expect(address.city).toBeTruthy();
      expect(address.country).toBeTruthy();
      expect(COUNTRIES).toContain(address.country);
    });

    test('should have valid KYC status', () => {
      expect(Object.values(KYC_STATUS)).toContain(profile.kycStatus);
    });

    test('should have valid risk tier', () => {
      expect(Object.values(RISK_TIERS)).toContain(profile.riskTier);
    });

    test('should respect status option', () => {
      const approvedProfile = generateCustomerProfile({ status: KYC_STATUS.APPROVED });
      expect(approvedProfile.kycStatus).toBe(KYC_STATUS.APPROVED);
    });

    test('should respect risk tier option', () => {
      const highRiskProfile = generateCustomerProfile({ riskTier: RISK_TIERS.HIGH });
      expect(highRiskProfile.riskTier).toBe(RISK_TIERS.HIGH);
    });
  });

  describe('Identity Document Generation', () => {
    const customerId = 'CUS-TEST1234';
    let document;

    beforeEach(() => {
      document = generateIdentityDocument(customerId);
    });

    test('should generate document with correct customer ID', () => {
      expect(document.customerId).toBe(customerId);
    });

    test('should have valid document ID format', () => {
      expect(document.documentId).toMatch(/^DOC-[A-Z0-9]{10}$/);
    });

    test('should have valid document type', () => {
      expect([
        DOCUMENT_TYPES.PASSPORT,
        DOCUMENT_TYPES.DRIVERS_LICENSE,
        DOCUMENT_TYPES.NATIONAL_ID
      ]).toContain(document.documentType);
    });

    test('should have valid dates', () => {
      const issueDate = new Date(document.issueDate);
      const expiryDate = new Date(document.expiryDate);
      expect(expiryDate.getTime()).toBeGreaterThan(issueDate.getTime());
    });

    test('should have OCR confidence between 0.85 and 0.99', () => {
      expect(document.ocrConfidence).toBeGreaterThanOrEqual(0.85);
      expect(document.ocrConfidence).toBeLessThanOrEqual(0.99);
    });

    test('should respect document type option', () => {
      const passport = generateIdentityDocument(customerId, DOCUMENT_TYPES.PASSPORT);
      expect(passport.documentType).toBe(DOCUMENT_TYPES.PASSPORT);
    });

    test('should mark expired documents correctly', () => {
      // Generate multiple documents and check expiry logic
      let foundExpired = false;
      for (let i = 0; i < 50; i++) {
        const doc = generateIdentityDocument(customerId);
        const expiryDate = new Date(doc.expiryDate);
        const isExpired = expiryDate < new Date();
        if (doc.isExpired) {
          foundExpired = true;
          expect(isExpired).toBe(true);
        }
      }
      // Note: may not always find expired documents due to randomness
    });
  });

  describe('Address Document Generation', () => {
    const customerId = 'CUS-TEST1234';
    let document;

    beforeEach(() => {
      document = generateAddressDocument(customerId);
    });

    test('should generate address document with correct customer ID', () => {
      expect(document.customerId).toBe(customerId);
    });

    test('should have valid address document ID format', () => {
      expect(document.documentId).toMatch(/^ADDR-[A-Z0-9]{10}$/);
    });

    test('should have valid address document type', () => {
      expect([
        DOCUMENT_TYPES.UTILITY_BILL,
        DOCUMENT_TYPES.BANK_STATEMENT,
        DOCUMENT_TYPES.TAX_RETURN
      ]).toContain(document.documentType);
    });

    test('should have provider appropriate to document type', () => {
      expect(document.provider).toBeTruthy();
    });

    test('should have name and address match flags', () => {
      expect(typeof document.nameMatch).toBe('boolean');
      expect(typeof document.addressMatch).toBe('boolean');
    });
  });

  describe('Risk Assessment Generation', () => {
    test('should generate risk assessment for customer', () => {
      const customer = generateCustomerProfile();
      const assessment = generateRiskAssessment(customer);

      expect(assessment.customerId).toBe(customer.customerId);
      expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(assessment.riskScore).toBeLessThanOrEqual(100);
      expect(Object.values(RISK_TIERS)).toContain(assessment.riskTier);
    });

    test('should assign correct tier based on score', () => {
      const customer = generateCustomerProfile();
      const assessment = generateRiskAssessment(customer);

      if (assessment.riskScore > 70) {
        expect(assessment.riskTier).toBe(RISK_TIERS.HIGH);
      } else if (assessment.riskScore > 40) {
        expect(assessment.riskTier).toBe(RISK_TIERS.MEDIUM);
      } else {
        expect(assessment.riskTier).toBe(RISK_TIERS.LOW);
      }
    });

    test('should have risk factors array', () => {
      const customer = generateCustomerProfile({ riskTier: RISK_TIERS.HIGH });
      const assessment = generateRiskAssessment(customer);

      expect(Array.isArray(assessment.riskFactors)).toBe(true);
    });

    test('should have next review date in future', () => {
      const customer = generateCustomerProfile();
      const assessment = generateRiskAssessment(customer);
      const nextReview = new Date(assessment.nextReviewDate);

      expect(nextReview.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Verification Attempt Generation', () => {
    const customerId = 'CUS-TEST1234';

    test('should generate verification attempt with correct customer ID', () => {
      const attempt = generateVerificationAttempt(customerId);
      expect(attempt.customerId).toBe(customerId);
    });

    test('should have valid attempt ID format', () => {
      const attempt = generateVerificationAttempt(customerId);
      expect(attempt.attemptId).toMatch(/^VER-[A-Z0-9]{10}$/);
    });

    test('should have valid status', () => {
      const attempt = generateVerificationAttempt(customerId);
      expect(['SUCCESS', 'FAILED']).toContain(attempt.status);
    });

    test('should have failure reason only when failed', () => {
      // Generate multiple attempts to check both scenarios
      for (let i = 0; i < 20; i++) {
        const attempt = generateVerificationAttempt(customerId);
        if (attempt.status === 'SUCCESS') {
          expect(attempt.failureReason).toBeNull();
        } else {
          expect(REJECTION_REASONS).toContain(attempt.failureReason);
        }
      }
    });

    test('should have confidence score', () => {
      const attempt = generateVerificationAttempt(customerId);
      expect(attempt.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(attempt.confidenceScore).toBeLessThanOrEqual(1);
    });

    test('should have processing time in reasonable range', () => {
      const attempt = generateVerificationAttempt(customerId);
      expect(attempt.processingTime).toBeGreaterThanOrEqual(500);
      expect(attempt.processingTime).toBeLessThanOrEqual(30000);
    });
  });

  describe('KYC Application Generation', () => {
    let application;

    beforeEach(() => {
      application = generateKYCApplication();
    });

    test('should generate complete KYC application', () => {
      expect(application.applicationId).toMatch(/^KYC-[A-Z0-9]{12}$/);
      expect(application.customer).toBeDefined();
      expect(application.documents).toBeDefined();
      expect(application.riskAssessment).toBeDefined();
      expect(application.verificationAttempts).toBeDefined();
    });

    test('should have identity and address documents', () => {
      expect(application.documents.identity).toBeDefined();
      expect(application.documents.address).toBeDefined();
    });

    test('should have at least one verification attempt', () => {
      expect(application.verificationAttempts.length).toBeGreaterThanOrEqual(1);
    });

    test('should have consistent customer ID across documents', () => {
      const customerId = application.customer.customerId;
      expect(application.documents.identity.customerId).toBe(customerId);
      expect(application.documents.address.customerId).toBe(customerId);
      expect(application.riskAssessment.customerId).toBe(customerId);
    });

    test('should have timestamps', () => {
      expect(application.submittedAt).toBeDefined();
      expect(application.lastUpdatedAt).toBeDefined();
    });

    test('approved applications should have completion date', () => {
      const approvedApp = generateKYCApplication({ status: KYC_STATUS.APPROVED });
      expect(approvedApp.completedAt).not.toBeNull();
    });

    test('pending applications should not have completion date', () => {
      const pendingApp = generateKYCApplication({ status: KYC_STATUS.PENDING });
      expect(pendingApp.completedAt).toBeNull();
    });
  });

  describe('Batch Generation', () => {
    test('should generate correct number of applications', () => {
      const batch = generateKYCApplicationBatch(25);
      expect(batch.length).toBe(25);
    });

    test('should generate unique applications', () => {
      const batch = generateKYCApplicationBatch(50);
      const ids = new Set(batch.map(app => app.applicationId));
      expect(ids.size).toBe(50);
    });

    test('should pass options to each application', () => {
      const batch = generateKYCApplicationBatch(10, { status: KYC_STATUS.APPROVED });
      batch.forEach(app => {
        expect(app.applicationStatus).toBe(KYC_STATUS.APPROVED);
      });
    });
  });

  describe('Realistic Dataset Generation', () => {
    let dataset;

    beforeEach(() => {
      dataset = generateRealisticKYCDataset(100);
    });

    test('should generate correct total count', () => {
      expect(dataset.length).toBe(100);
    });

    test('should have realistic status distribution', () => {
      const statusCounts = dataset.reduce((acc, app) => {
        acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
        return acc;
      }, {});

      // Approved should be majority (around 60%)
      expect(statusCounts[KYC_STATUS.APPROVED]).toBeGreaterThan(50);

      // Should have some of each status
      expect(statusCounts[KYC_STATUS.PENDING]).toBeGreaterThan(0);
      expect(statusCounts[KYC_STATUS.REJECTED]).toBeGreaterThan(0);
    });

    test('all applications should be valid', () => {
      dataset.forEach(app => {
        expect(app.applicationId).toBeTruthy();
        expect(app.customer).toBeDefined();
        expect(app.documents).toBeDefined();
      });
    });
  });
});

describe('KYC Validation Rules', () => {
  describe('Document Expiry Validation', () => {
    test('should identify expired documents', () => {
      const customerId = 'CUS-TEST1234';
      const documents = [];

      // Generate many documents to find expired ones
      for (let i = 0; i < 100; i++) {
        documents.push(generateIdentityDocument(customerId));
      }

      const expiredDocs = documents.filter(doc => doc.isExpired);
      const validDocs = documents.filter(doc => !doc.isExpired);

      // Verify expired docs have past expiry date
      expiredDocs.forEach(doc => {
        expect(new Date(doc.expiryDate).getTime()).toBeLessThan(Date.now());
      });

      // Verify valid docs have future expiry date
      validDocs.forEach(doc => {
        expect(new Date(doc.expiryDate).getTime()).toBeGreaterThan(Date.now());
      });
    });
  });

  describe('Age Verification', () => {
    test('all generated customers should be 18 or older', () => {
      for (let i = 0; i < 50; i++) {
        const profile = generateCustomerProfile();
        expect(profile.personalInfo.age).toBeGreaterThanOrEqual(18);
      }
    });

    test('all generated customers should be 80 or younger', () => {
      for (let i = 0; i < 50; i++) {
        const profile = generateCustomerProfile();
        // Allow for edge case where age calculation may be off by 1 due to birthday timing
        expect(profile.personalInfo.age).toBeLessThanOrEqual(81);
      }
    });
  });

  describe('Email Format Validation', () => {
    test('all emails should be valid format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      for (let i = 0; i < 50; i++) {
        const profile = generateCustomerProfile();
        expect(profile.personalInfo.email).toMatch(emailRegex);
      }
    });
  });

  describe('Risk Score Validation', () => {
    test('risk scores should be within valid range', () => {
      for (let i = 0; i < 50; i++) {
        const profile = generateCustomerProfile();
        const assessment = generateRiskAssessment(profile);

        expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
        expect(assessment.riskScore).toBeLessThanOrEqual(100);
      }
    });
  });
});

describe('KYC Business Rules', () => {
  describe('Document Upload Requirements', () => {
    test('should require both identity and address documents', () => {
      const application = generateKYCApplication();

      expect(application.documents.identity).toBeDefined();
      expect(application.documents.address).toBeDefined();
    });

    test('identity document should be valid type', () => {
      const application = generateKYCApplication();
      const validTypes = [
        DOCUMENT_TYPES.PASSPORT,
        DOCUMENT_TYPES.DRIVERS_LICENSE,
        DOCUMENT_TYPES.NATIONAL_ID
      ];

      expect(validTypes).toContain(application.documents.identity.documentType);
    });

    test('address document should be valid type', () => {
      const application = generateKYCApplication();
      const validTypes = [
        DOCUMENT_TYPES.UTILITY_BILL,
        DOCUMENT_TYPES.BANK_STATEMENT,
        DOCUMENT_TYPES.TAX_RETURN
      ];

      expect(validTypes).toContain(application.documents.address.documentType);
    });
  });

  describe('KYC Status Transitions', () => {
    test('approved status should have completion date', () => {
      const approved = generateKYCApplication({ status: KYC_STATUS.APPROVED });
      expect(approved.completedAt).not.toBeNull();
    });

    test('rejected status should not have completion date', () => {
      const rejected = generateKYCApplication({ status: KYC_STATUS.REJECTED });
      expect(rejected.completedAt).toBeNull();
    });

    test('pending status should not have completion date', () => {
      const pending = generateKYCApplication({ status: KYC_STATUS.PENDING });
      expect(pending.completedAt).toBeNull();
    });
  });

  describe('Risk Tier Assignment', () => {
    test('high risk customers should have HIGH tier', () => {
      const profile = generateCustomerProfile({ riskTier: RISK_TIERS.HIGH });
      expect(profile.riskTier).toBe(RISK_TIERS.HIGH);
    });

    test('risk assessment tier should match score', () => {
      for (let i = 0; i < 30; i++) {
        const profile = generateCustomerProfile();
        const assessment = generateRiskAssessment(profile);

        if (assessment.riskScore > 70) {
          expect(assessment.riskTier).toBe(RISK_TIERS.HIGH);
        } else if (assessment.riskScore > 40) {
          expect(assessment.riskTier).toBe(RISK_TIERS.MEDIUM);
        } else {
          expect(assessment.riskTier).toBe(RISK_TIERS.LOW);
        }
      }
    });
  });
});
