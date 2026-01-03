/**
 * KYC (Know Your Customer) Synthetic Data Generator
 *
 * Generates realistic test data for KYC processes including:
 * - Customer profiles
 * - Identity documents
 * - Address verification
 * - Risk assessments
 *
 * @module kyc-data-generator
 * @requires @faker-js/faker
 */

const { faker } = require('@faker-js/faker');

/**
 * Document types supported for KYC verification
 */
const DOCUMENT_TYPES = {
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  NATIONAL_ID: 'NATIONAL_ID',
  UTILITY_BILL: 'UTILITY_BILL',
  BANK_STATEMENT: 'BANK_STATEMENT',
  TAX_RETURN: 'TAX_RETURN'
};

/**
 * KYC verification status options
 */
const KYC_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

/**
 * Risk tier classifications
 */
const RISK_TIERS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

/**
 * Countries for document issuance
 */
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Spain', 'Italy', 'Japan', 'Brazil',
  'Mexico', 'India', 'Singapore', 'Netherlands', 'Switzerland'
];

/**
 * Rejection reasons for failed KYC
 */
const REJECTION_REASONS = [
  'Document expired',
  'Document image unclear',
  'Information mismatch',
  'Suspected fraudulent document',
  'Incomplete documentation',
  'Failed identity verification',
  'Address verification failed',
  'Sanctions list match',
  'PEP match requiring review',
  'Insufficient proof of address'
];

/**
 * Generates a unique customer ID
 * @returns {string} Customer ID in format CUS-XXXXXXXX
 */
function generateCustomerId() {
  return `CUS-${faker.string.alphanumeric(8).toUpperCase()}`;
}

/**
 * Generates a document number based on document type
 * @param {string} documentType - Type of document
 * @returns {string} Document number
 */
function generateDocumentNumber(documentType) {
  switch (documentType) {
    case DOCUMENT_TYPES.PASSPORT:
      return faker.string.alphanumeric(9).toUpperCase();
    case DOCUMENT_TYPES.DRIVERS_LICENSE:
      return `DL${faker.string.numeric(12)}`;
    case DOCUMENT_TYPES.NATIONAL_ID:
      return faker.string.numeric(11);
    default:
      return faker.string.alphanumeric(10).toUpperCase();
  }
}

/**
 * Generates a complete customer profile
 * @param {Object} options - Generation options
 * @param {string} [options.status] - Specific KYC status to assign
 * @param {string} [options.riskTier] - Specific risk tier to assign
 * @returns {Object} Customer profile object
 */
function generateCustomerProfile(options = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const dateOfBirth = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });

  return {
    customerId: generateCustomerId(),
    personalInfo: {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      age: new Date().getFullYear() - dateOfBirth.getFullYear(),
      gender: faker.person.sexType(),
      nationality: faker.helpers.arrayElement(COUNTRIES),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number(),
      occupation: faker.person.jobTitle(),
      employer: faker.company.name()
    },
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.helpers.arrayElement(COUNTRIES),
      residencySince: faker.date.past({ years: 10 }).toISOString().split('T')[0]
    },
    kycStatus: options.status || faker.helpers.arrayElement(Object.values(KYC_STATUS)),
    riskTier: options.riskTier || faker.helpers.arrayElement(Object.values(RISK_TIERS)),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString()
  };
}

/**
 * Generates an identity document
 * @param {string} customerId - Customer ID for the document
 * @param {string} [documentType] - Specific document type
 * @returns {Object} Identity document object
 */
function generateIdentityDocument(customerId, documentType) {
  const docType = documentType || faker.helpers.arrayElement([
    DOCUMENT_TYPES.PASSPORT,
    DOCUMENT_TYPES.DRIVERS_LICENSE,
    DOCUMENT_TYPES.NATIONAL_ID
  ]);

  const issueDate = faker.date.past({ years: 5 });
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);

  const isExpired = expiryDate < new Date();

  return {
    documentId: `DOC-${faker.string.alphanumeric(10).toUpperCase()}`,
    customerId,
    documentType: docType,
    documentNumber: generateDocumentNumber(docType),
    issuingCountry: faker.helpers.arrayElement(COUNTRIES),
    issueDate: issueDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    isExpired,
    verificationStatus: isExpired ? 'EXPIRED' : faker.helpers.arrayElement(['PENDING', 'VERIFIED', 'REJECTED']),
    ocrConfidence: faker.number.float({ min: 0.85, max: 0.99, fractionDigits: 2 }),
    uploadedAt: faker.date.recent({ days: 7 }).toISOString(),
    fileSize: faker.number.int({ min: 500000, max: 5000000 }),
    mimeType: faker.helpers.arrayElement(['image/jpeg', 'image/png', 'application/pdf'])
  };
}

/**
 * Generates address verification document
 * @param {string} customerId - Customer ID
 * @returns {Object} Address document object
 */
function generateAddressDocument(customerId) {
  const docType = faker.helpers.arrayElement([
    DOCUMENT_TYPES.UTILITY_BILL,
    DOCUMENT_TYPES.BANK_STATEMENT,
    DOCUMENT_TYPES.TAX_RETURN
  ]);

  const documentDate = faker.date.recent({ days: 90 });
  const isRecent = (new Date() - documentDate) / (1000 * 60 * 60 * 24) <= 90;

  return {
    documentId: `ADDR-${faker.string.alphanumeric(10).toUpperCase()}`,
    customerId,
    documentType: docType,
    documentDate: documentDate.toISOString().split('T')[0],
    isWithinValidPeriod: isRecent,
    provider: docType === DOCUMENT_TYPES.UTILITY_BILL
      ? faker.helpers.arrayElement(['Electric Company', 'Gas Provider', 'Water Utility', 'Internet Provider'])
      : docType === DOCUMENT_TYPES.BANK_STATEMENT
        ? faker.company.name() + ' Bank'
        : 'Tax Authority',
    verificationStatus: isRecent
      ? faker.helpers.arrayElement(['PENDING', 'VERIFIED', 'REJECTED'])
      : 'REJECTED',
    addressMatch: faker.datatype.boolean(0.9),
    nameMatch: faker.datatype.boolean(0.95),
    uploadedAt: faker.date.recent({ days: 7 }).toISOString()
  };
}

/**
 * Generates risk assessment data
 * @param {Object} customer - Customer profile
 * @returns {Object} Risk assessment object
 */
function generateRiskAssessment(customer) {
  const riskFactors = [];
  let riskScore = faker.number.int({ min: 0, max: 30 });

  // Add risk factors based on conditions
  if (customer.riskTier === RISK_TIERS.HIGH) {
    riskScore += faker.number.int({ min: 40, max: 70 });
    riskFactors.push({
      factor: 'High-risk jurisdiction',
      weight: faker.number.int({ min: 20, max: 40 }),
      details: 'Customer associated with high-risk country'
    });
  }

  if (faker.datatype.boolean(0.1)) {
    riskScore += 30;
    riskFactors.push({
      factor: 'PEP association',
      weight: 30,
      details: 'Customer or close associate is a Politically Exposed Person'
    });
  }

  if (faker.datatype.boolean(0.15)) {
    riskScore += 20;
    riskFactors.push({
      factor: 'Adverse media',
      weight: 20,
      details: 'Negative news coverage identified'
    });
  }

  if (faker.datatype.boolean(0.2)) {
    riskScore += 15;
    riskFactors.push({
      factor: 'Complex ownership structure',
      weight: 15,
      details: 'Business ownership structure is complex'
    });
  }

  // Normalize score to 0-100
  riskScore = Math.min(100, riskScore);

  return {
    assessmentId: `RISK-${faker.string.alphanumeric(10).toUpperCase()}`,
    customerId: customer.customerId,
    assessmentDate: faker.date.recent({ days: 30 }).toISOString(),
    riskScore,
    riskTier: riskScore > 70 ? RISK_TIERS.HIGH : riskScore > 40 ? RISK_TIERS.MEDIUM : RISK_TIERS.LOW,
    riskFactors,
    pepStatus: faker.datatype.boolean(0.05),
    sanctionsMatch: faker.datatype.boolean(0.02),
    adverseMedia: faker.datatype.boolean(0.1),
    nextReviewDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
    reviewedBy: faker.person.fullName(),
    approvedBy: riskScore > 50 ? faker.person.fullName() : null
  };
}

/**
 * Generates KYC verification attempt record
 * @param {string} customerId - Customer ID
 * @returns {Object} Verification attempt object
 */
function generateVerificationAttempt(customerId) {
  const isSuccessful = faker.datatype.boolean(0.8);

  return {
    attemptId: `VER-${faker.string.alphanumeric(10).toUpperCase()}`,
    customerId,
    attemptDate: faker.date.recent({ days: 14 }).toISOString(),
    verificationType: faker.helpers.arrayElement(['DOCUMENT', 'BIOMETRIC', 'ADDRESS', 'IDENTITY']),
    status: isSuccessful ? 'SUCCESS' : 'FAILED',
    failureReason: isSuccessful ? null : faker.helpers.arrayElement(REJECTION_REASONS),
    confidenceScore: isSuccessful
      ? faker.number.float({ min: 0.85, max: 0.99, fractionDigits: 2 })
      : faker.number.float({ min: 0.3, max: 0.7, fractionDigits: 2 }),
    processingTime: faker.number.int({ min: 500, max: 30000 }),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    deviceFingerprint: faker.string.alphanumeric(32)
  };
}

/**
 * Generates a complete KYC application package
 * @param {Object} options - Generation options
 * @returns {Object} Complete KYC application data
 */
function generateKYCApplication(options = {}) {
  const customer = generateCustomerProfile(options);
  const identityDoc = generateIdentityDocument(customer.customerId);
  const addressDoc = generateAddressDocument(customer.customerId);
  const riskAssessment = generateRiskAssessment(customer);

  const verificationAttempts = [];
  const attemptCount = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < attemptCount; i++) {
    verificationAttempts.push(generateVerificationAttempt(customer.customerId));
  }

  return {
    applicationId: `KYC-${faker.string.alphanumeric(12).toUpperCase()}`,
    customer,
    documents: {
      identity: identityDoc,
      address: addressDoc
    },
    riskAssessment,
    verificationAttempts,
    applicationStatus: customer.kycStatus,
    submittedAt: faker.date.past({ years: 1 }).toISOString(),
    lastUpdatedAt: faker.date.recent({ days: 7 }).toISOString(),
    completedAt: customer.kycStatus === KYC_STATUS.APPROVED
      ? faker.date.recent({ days: 30 }).toISOString()
      : null
  };
}

/**
 * Generates multiple KYC applications
 * @param {number} count - Number of applications to generate
 * @param {Object} options - Generation options
 * @returns {Array} Array of KYC applications
 */
function generateKYCApplicationBatch(count = 10, options = {}) {
  const applications = [];
  for (let i = 0; i < count; i++) {
    applications.push(generateKYCApplication(options));
  }
  return applications;
}

/**
 * Generates KYC data with specific distribution of statuses
 * @param {number} count - Total number of records
 * @returns {Array} Array of KYC applications with realistic status distribution
 */
function generateRealisticKYCDataset(count = 100) {
  const distribution = {
    APPROVED: Math.floor(count * 0.6),
    PENDING: Math.floor(count * 0.15),
    IN_REVIEW: Math.floor(count * 0.1),
    REJECTED: Math.floor(count * 0.1),
    EXPIRED: Math.floor(count * 0.05)
  };

  const applications = [];

  for (const [status, statusCount] of Object.entries(distribution)) {
    for (let i = 0; i < statusCount; i++) {
      applications.push(generateKYCApplication({ status }));
    }
  }

  // Shuffle the array
  return applications.sort(() => Math.random() - 0.5);
}

// Export all functions and constants
module.exports = {
  // Constants
  DOCUMENT_TYPES,
  KYC_STATUS,
  RISK_TIERS,
  COUNTRIES,
  REJECTION_REASONS,

  // Generator functions
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
};

// If run directly, generate sample data
if (require.main === module) {
  console.log('Generating sample KYC data...\n');

  const sampleApplication = generateKYCApplication();
  console.log('Sample KYC Application:');
  console.log(JSON.stringify(sampleApplication, null, 2));

  console.log('\n--- Batch Generation ---');
  const batch = generateKYCApplicationBatch(5);
  console.log(`Generated ${batch.length} KYC applications`);

  console.log('\n--- Realistic Dataset ---');
  const dataset = generateRealisticKYCDataset(100);
  const statusCounts = dataset.reduce((acc, app) => {
    acc[app.applicationStatus] = (acc[app.applicationStatus] || 0) + 1;
    return acc;
  }, {});
  console.log('Status distribution:', statusCounts);
}
