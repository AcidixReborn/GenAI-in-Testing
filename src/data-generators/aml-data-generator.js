/**
 * AML (Anti-Money Laundering) Synthetic Data Generator
 *
 * Generates realistic test data for AML scenarios including:
 * - Transaction records
 * - Suspicious activity patterns
 * - Account relationships
 * - Sanctions screening results
 *
 * @module aml-data-generator
 * @requires @faker-js/faker
 */

const { faker } = require('@faker-js/faker');

/**
 * Transaction types
 */
const TRANSACTION_TYPES = {
  WIRE_TRANSFER: 'WIRE_TRANSFER',
  ACH_TRANSFER: 'ACH_TRANSFER',
  CASH_DEPOSIT: 'CASH_DEPOSIT',
  CASH_WITHDRAWAL: 'CASH_WITHDRAWAL',
  CHECK_DEPOSIT: 'CHECK_DEPOSIT',
  CARD_PAYMENT: 'CARD_PAYMENT',
  INTERNATIONAL_TRANSFER: 'INTERNATIONAL_TRANSFER',
  INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
  LOAN_PAYMENT: 'LOAN_PAYMENT',
  CRYPTOCURRENCY: 'CRYPTOCURRENCY'
};

/**
 * Transaction status options
 */
const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  BLOCKED: 'BLOCKED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REVERSED: 'REVERSED'
};

/**
 * Alert severity levels
 */
const ALERT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Alert status options
 */
const ALERT_STATUS = {
  NEW: 'NEW',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  INVESTIGATING: 'INVESTIGATING',
  ESCALATED: 'ESCALATED',
  FALSE_POSITIVE: 'FALSE_POSITIVE',
  SAR_FILED: 'SAR_FILED',
  CLOSED: 'CLOSED'
};

/**
 * Suspicious activity patterns
 */
const SUSPICIOUS_PATTERNS = {
  STRUCTURING: 'STRUCTURING',
  RAPID_MOVEMENT: 'RAPID_MOVEMENT',
  ROUND_AMOUNTS: 'ROUND_AMOUNTS',
  HIGH_RISK_COUNTRY: 'HIGH_RISK_COUNTRY',
  UNUSUAL_PATTERN: 'UNUSUAL_PATTERN',
  VELOCITY_SPIKE: 'VELOCITY_SPIKE',
  DORMANT_ACCOUNT: 'DORMANT_ACCOUNT',
  SANCTIONS_MATCH: 'SANCTIONS_MATCH',
  PEP_TRANSACTION: 'PEP_TRANSACTION',
  LAYERING: 'LAYERING'
};

/**
 * High-risk countries for AML purposes
 */
const HIGH_RISK_COUNTRIES = [
  'North Korea', 'Iran', 'Syria', 'Yemen', 'Myanmar',
  'Afghanistan', 'Libya', 'Somalia', 'South Sudan', 'Venezuela'
];

/**
 * Currency codes
 */
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'SGD', 'HKD', 'CNY'];

/**
 * Generates a unique transaction ID
 * @returns {string} Transaction ID
 */
function generateTransactionId() {
  return `TXN-${faker.string.alphanumeric(12).toUpperCase()}`;
}

/**
 * Generates a unique account number
 * @returns {string} Account number
 */
function generateAccountNumber() {
  return faker.string.numeric(12);
}

/**
 * Generates a standard transaction
 * @param {Object} options - Generation options
 * @returns {Object} Transaction object
 */
function generateTransaction(options = {}) {
  const transactionType = options.type || faker.helpers.arrayElement(Object.values(TRANSACTION_TYPES));
  const isInternational = transactionType === TRANSACTION_TYPES.INTERNATIONAL_TRANSFER;
  const isCash = [TRANSACTION_TYPES.CASH_DEPOSIT, TRANSACTION_TYPES.CASH_WITHDRAWAL].includes(transactionType);

  // Generate amount based on transaction type
  let amount;
  if (options.amount) {
    amount = options.amount;
  } else if (isCash) {
    amount = faker.number.float({ min: 100, max: 9500, fractionDigits: 2 });
  } else if (isInternational) {
    amount = faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 });
  } else {
    amount = faker.number.float({ min: 10, max: 50000, fractionDigits: 2 });
  }

  const currency = options.currency || faker.helpers.arrayElement(CURRENCIES);
  const transactionDate = options.date || faker.date.recent({ days: 30 });

  return {
    transactionId: generateTransactionId(),
    accountNumber: options.accountNumber || generateAccountNumber(),
    customerId: options.customerId || `CUS-${faker.string.alphanumeric(8).toUpperCase()}`,
    transactionType,
    amount,
    currency,
    localAmount: currency === 'USD' ? amount : amount * faker.number.float({ min: 0.8, max: 1.5, fractionDigits: 4 }),
    localCurrency: 'USD',
    transactionDate: transactionDate.toISOString(),
    valueDate: new Date(transactionDate.getTime() + 86400000).toISOString().split('T')[0],
    status: options.status || faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS)),
    description: faker.finance.transactionDescription(),
    reference: faker.string.alphanumeric(16).toUpperCase(),
    channel: faker.helpers.arrayElement(['ONLINE', 'MOBILE', 'BRANCH', 'ATM', 'API']),
    counterparty: {
      name: faker.company.name(),
      accountNumber: generateAccountNumber(),
      bankName: faker.company.name() + ' Bank',
      bankCode: faker.string.alphanumeric(8).toUpperCase(),
      country: isInternational
        ? faker.helpers.arrayElement([...HIGH_RISK_COUNTRIES, 'United States', 'United Kingdom', 'Germany', 'France'])
        : 'United States'
    },
    metadata: {
      ipAddress: faker.internet.ip(),
      deviceId: faker.string.uuid(),
      location: {
        city: faker.location.city(),
        country: faker.location.country(),
        coordinates: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        }
      }
    }
  };
}

/**
 * Generates a suspicious transaction with specific pattern
 * @param {string} pattern - Type of suspicious pattern
 * @param {Object} options - Additional options
 * @returns {Object} Suspicious transaction
 */
function generateSuspiciousTransaction(pattern, options = {}) {
  const baseTransaction = generateTransaction(options);

  switch (pattern) {
    case SUSPICIOUS_PATTERNS.STRUCTURING:
      // Multiple transactions just under reporting threshold ($10,000)
      baseTransaction.amount = faker.number.float({ min: 9000, max: 9999, fractionDigits: 2 });
      baseTransaction.transactionType = TRANSACTION_TYPES.CASH_DEPOSIT;
      baseTransaction.suspiciousIndicators = ['Amount just below CTR threshold'];
      break;

    case SUSPICIOUS_PATTERNS.RAPID_MOVEMENT:
      // Money moved quickly through account
      baseTransaction.amount = faker.number.float({ min: 50000, max: 500000, fractionDigits: 2 });
      baseTransaction.suspiciousIndicators = ['Funds moved within 24 hours of receipt'];
      break;

    case SUSPICIOUS_PATTERNS.ROUND_AMOUNTS:
      // Suspiciously round transaction amounts
      baseTransaction.amount = faker.helpers.arrayElement([10000, 25000, 50000, 100000, 250000]);
      baseTransaction.suspiciousIndicators = ['Round amount transaction'];
      break;

    case SUSPICIOUS_PATTERNS.HIGH_RISK_COUNTRY:
      baseTransaction.transactionType = TRANSACTION_TYPES.INTERNATIONAL_TRANSFER;
      baseTransaction.counterparty.country = faker.helpers.arrayElement(HIGH_RISK_COUNTRIES);
      baseTransaction.suspiciousIndicators = ['High-risk jurisdiction'];
      break;

    case SUSPICIOUS_PATTERNS.VELOCITY_SPIKE:
      baseTransaction.amount = faker.number.float({ min: 20000, max: 100000, fractionDigits: 2 });
      baseTransaction.suspiciousIndicators = ['Transaction volume exceeds historical pattern by 500%'];
      break;

    case SUSPICIOUS_PATTERNS.DORMANT_ACCOUNT:
      baseTransaction.amount = faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 });
      baseTransaction.suspiciousIndicators = ['First activity in 12+ months'];
      break;

    case SUSPICIOUS_PATTERNS.LAYERING:
      baseTransaction.transactionType = faker.helpers.arrayElement([
        TRANSACTION_TYPES.WIRE_TRANSFER,
        TRANSACTION_TYPES.INTERNATIONAL_TRANSFER
      ]);
      baseTransaction.amount = faker.number.float({ min: 100000, max: 1000000, fractionDigits: 2 });
      baseTransaction.suspiciousIndicators = ['Multiple rapid transfers between accounts', 'Complex transaction chain'];
      break;

    default:
      baseTransaction.suspiciousIndicators = ['Unusual transaction pattern'];
  }

  baseTransaction.riskScore = faker.number.int({ min: 70, max: 100 });
  baseTransaction.flaggedAt = faker.date.recent({ days: 7 }).toISOString();
  baseTransaction.pattern = pattern;

  return baseTransaction;
}

/**
 * Generates an AML alert
 * @param {Object} transaction - Transaction that triggered the alert
 * @returns {Object} AML alert object
 */
function generateAlert(transaction) {
  const severity = transaction.riskScore > 90
    ? ALERT_SEVERITY.CRITICAL
    : transaction.riskScore > 75
      ? ALERT_SEVERITY.HIGH
      : transaction.riskScore > 50
        ? ALERT_SEVERITY.MEDIUM
        : ALERT_SEVERITY.LOW;

  return {
    alertId: `ALT-${faker.string.alphanumeric(10).toUpperCase()}`,
    transactionId: transaction.transactionId,
    customerId: transaction.customerId,
    accountNumber: transaction.accountNumber,
    alertType: transaction.pattern || 'UNUSUAL_ACTIVITY',
    severity,
    status: faker.helpers.arrayElement(Object.values(ALERT_STATUS)),
    riskScore: transaction.riskScore || faker.number.int({ min: 50, max: 100 }),
    indicators: transaction.suspiciousIndicators || ['Suspicious activity detected'],
    createdAt: faker.date.recent({ days: 7 }).toISOString(),
    acknowledgedAt: faker.datatype.boolean(0.7) ? faker.date.recent({ days: 5 }).toISOString() : null,
    assignedTo: faker.datatype.boolean(0.6) ? faker.person.fullName() : null,
    caseId: faker.datatype.boolean(0.3) ? `CASE-${faker.string.alphanumeric(8).toUpperCase()}` : null,
    notes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
    disposition: faker.datatype.boolean(0.4)
      ? faker.helpers.arrayElement(['TRUE_POSITIVE', 'FALSE_POSITIVE', 'INCONCLUSIVE'])
      : null
  };
}

/**
 * Generates a sanctions screening result
 * @param {Object} options - Screening options
 * @returns {Object} Sanctions screening result
 */
function generateSanctionsScreening(options = {}) {
  const isMatch = options.forceMatch || faker.datatype.boolean(0.05);
  const matchScore = isMatch
    ? faker.number.float({ min: 0.85, max: 1.0, fractionDigits: 2 })
    : faker.number.float({ min: 0, max: 0.3, fractionDigits: 2 });

  return {
    screeningId: `SCR-${faker.string.alphanumeric(10).toUpperCase()}`,
    entityName: options.entityName || faker.person.fullName(),
    entityType: faker.helpers.arrayElement(['INDIVIDUAL', 'ORGANIZATION']),
    screenedAt: faker.date.recent({ days: 1 }).toISOString(),
    lists: [
      {
        listName: 'OFAC SDN',
        listVersion: faker.date.recent({ days: 7 }).toISOString().split('T')[0],
        matchFound: isMatch,
        matchScore: isMatch ? matchScore : 0,
        matchedEntry: isMatch ? {
          name: options.entityName || faker.person.fullName(),
          type: faker.helpers.arrayElement(['INDIVIDUAL', 'ENTITY']),
          program: faker.helpers.arrayElement(['SDGT', 'IRAN', 'SYRIA', 'DPRK']),
          listingDate: faker.date.past({ years: 5 }).toISOString().split('T')[0]
        } : null
      },
      {
        listName: 'UN Consolidated',
        listVersion: faker.date.recent({ days: 7 }).toISOString().split('T')[0],
        matchFound: isMatch && faker.datatype.boolean(0.5),
        matchScore: isMatch ? faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }) : 0
      },
      {
        listName: 'EU Sanctions',
        listVersion: faker.date.recent({ days: 7 }).toISOString().split('T')[0],
        matchFound: isMatch && faker.datatype.boolean(0.3),
        matchScore: isMatch ? faker.number.float({ min: 0.6, max: 0.9, fractionDigits: 2 }) : 0
      }
    ],
    overallMatch: isMatch,
    overallScore: matchScore,
    status: isMatch ? 'REQUIRES_REVIEW' : 'CLEARED',
    reviewedBy: isMatch ? faker.person.fullName() : null,
    reviewedAt: isMatch && faker.datatype.boolean(0.6) ? faker.date.recent({ days: 3 }).toISOString() : null,
    disposition: isMatch
      ? faker.helpers.arrayElement(['PENDING', 'TRUE_MATCH', 'FALSE_POSITIVE'])
      : 'NO_MATCH'
  };
}

/**
 * Generates a SAR (Suspicious Activity Report)
 * @param {Object} alert - Alert that triggered the SAR
 * @returns {Object} SAR object
 */
function generateSAR(alert) {
  return {
    sarId: `SAR-${faker.string.alphanumeric(12).toUpperCase()}`,
    alertIds: [alert.alertId],
    customerId: alert.customerId,
    filingType: faker.helpers.arrayElement(['INITIAL', 'CONTINUING', 'JOINT']),
    suspiciousActivityType: faker.helpers.arrayElement([
      'STRUCTURING',
      'TERRORIST_FINANCING',
      'FRAUD',
      'MONEY_LAUNDERING',
      'BRIBERY',
      'IDENTITY_THEFT',
      'OTHER'
    ]),
    amountInvolved: faker.number.float({ min: 10000, max: 5000000, fractionDigits: 2 }),
    dateRangeStart: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    dateRangeEnd: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    narrative: faker.lorem.paragraphs(3),
    subjectInfo: {
      name: faker.person.fullName(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
      ssn: `XXX-XX-${faker.string.numeric(4)}`,
      address: faker.location.streetAddress(),
      occupation: faker.person.jobTitle()
    },
    filingInstitution: {
      name: 'TechSpark Banking',
      rssd: faker.string.numeric(7),
      address: faker.location.streetAddress()
    },
    preparedBy: faker.person.fullName(),
    preparedAt: faker.date.recent({ days: 14 }).toISOString(),
    reviewedBy: faker.person.fullName(),
    reviewedAt: faker.date.recent({ days: 7 }).toISOString(),
    filedAt: faker.datatype.boolean(0.8) ? faker.date.recent({ days: 3 }).toISOString() : null,
    bsaId: faker.datatype.boolean(0.8) ? faker.string.numeric(14) : null,
    status: faker.helpers.arrayElement(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'FILED', 'ACKNOWLEDGED'])
  };
}

/**
 * Generates a complete AML case
 * @param {Object} options - Case generation options
 * @returns {Object} Complete AML case with transactions, alerts, and SAR
 */
function generateAMLCase(options = {}) {
  const customerId = `CUS-${faker.string.alphanumeric(8).toUpperCase()}`;
  const accountNumber = generateAccountNumber();
  const pattern = options.pattern || faker.helpers.arrayElement(Object.values(SUSPICIOUS_PATTERNS));

  // Generate suspicious transactions
  const transactionCount = faker.number.int({ min: 3, max: 10 });
  const transactions = [];
  for (let i = 0; i < transactionCount; i++) {
    transactions.push(generateSuspiciousTransaction(pattern, { customerId, accountNumber }));
  }

  // Generate alert from first transaction
  const alert = generateAlert(transactions[0]);
  alert.customerId = customerId;
  alert.accountNumber = accountNumber;

  // Generate SAR if high severity
  const sar = alert.severity === ALERT_SEVERITY.CRITICAL || alert.severity === ALERT_SEVERITY.HIGH
    ? generateSAR(alert)
    : null;

  // Generate sanctions screening
  const sanctionsScreening = generateSanctionsScreening({ entityName: faker.person.fullName() });

  return {
    caseId: `CASE-${faker.string.alphanumeric(10).toUpperCase()}`,
    customerId,
    accountNumber,
    caseType: pattern,
    status: faker.helpers.arrayElement(['OPEN', 'INVESTIGATING', 'ESCALATED', 'CLOSED']),
    priority: alert.severity,
    transactions,
    alerts: [alert],
    sanctionsScreening,
    sar,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
    openedAt: faker.date.past({ years: 1 }).toISOString(),
    assignedTo: faker.person.fullName(),
    lastActivityAt: faker.date.recent({ days: 7 }).toISOString(),
    notes: [
      {
        noteId: faker.string.uuid(),
        author: faker.person.fullName(),
        content: faker.lorem.paragraph(),
        createdAt: faker.date.recent({ days: 14 }).toISOString()
      }
    ]
  };
}

/**
 * Generates a batch of transactions
 * @param {number} count - Number of transactions
 * @param {Object} options - Generation options
 * @returns {Array} Array of transactions
 */
function generateTransactionBatch(count = 100, options = {}) {
  const transactions = [];
  const suspiciousRatio = options.suspiciousRatio || 0.05;

  for (let i = 0; i < count; i++) {
    if (faker.datatype.boolean(suspiciousRatio)) {
      const pattern = faker.helpers.arrayElement(Object.values(SUSPICIOUS_PATTERNS));
      transactions.push(generateSuspiciousTransaction(pattern, options));
    } else {
      transactions.push(generateTransaction(options));
    }
  }

  return transactions;
}

/**
 * Generates structuring scenario (multiple transactions below threshold)
 * @param {string} customerId - Customer ID
 * @param {number} totalAmount - Total amount to structure
 * @returns {Array} Array of structured transactions
 */
function generateStructuringScenario(customerId, totalAmount = 50000) {
  const transactions = [];
  let remaining = totalAmount;
  const accountNumber = generateAccountNumber();

  while (remaining > 0) {
    const amount = Math.min(
      faker.number.float({ min: 8000, max: 9900, fractionDigits: 2 }),
      remaining
    );
    remaining -= amount;

    // Create transaction directly without going through generateSuspiciousTransaction
    // to preserve the exact amount for structuring scenario
    const baseTransaction = generateTransaction({
      customerId,
      accountNumber,
      type: TRANSACTION_TYPES.CASH_DEPOSIT
    });

    baseTransaction.amount = amount;
    baseTransaction.suspiciousIndicators = ['Amount just below CTR threshold'];
    baseTransaction.riskScore = faker.number.int({ min: 70, max: 100 });
    baseTransaction.flaggedAt = faker.date.recent({ days: 7 }).toISOString();
    baseTransaction.pattern = SUSPICIOUS_PATTERNS.STRUCTURING;

    transactions.push(baseTransaction);
  }

  return transactions;
}

/**
 * Generates realistic AML dataset with various scenarios
 * @param {number} transactionCount - Number of transactions
 * @returns {Object} Dataset with transactions, alerts, and cases
 */
function generateRealisticAMLDataset(transactionCount = 1000) {
  const transactions = generateTransactionBatch(transactionCount, { suspiciousRatio: 0.03 });

  const suspiciousTransactions = transactions.filter(t => t.suspiciousIndicators);
  const alerts = suspiciousTransactions.map(t => generateAlert(t));

  const highPriorityAlerts = alerts.filter(a =>
    a.severity === ALERT_SEVERITY.HIGH || a.severity === ALERT_SEVERITY.CRITICAL
  );

  const sars = highPriorityAlerts
    .filter(() => faker.datatype.boolean(0.3))
    .map(a => generateSAR(a));

  return {
    summary: {
      totalTransactions: transactions.length,
      suspiciousTransactions: suspiciousTransactions.length,
      alertsGenerated: alerts.length,
      sarsFiled: sars.length
    },
    transactions,
    alerts,
    sars
  };
}

// Export all functions and constants
module.exports = {
  // Constants
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  ALERT_SEVERITY,
  ALERT_STATUS,
  SUSPICIOUS_PATTERNS,
  HIGH_RISK_COUNTRIES,
  CURRENCIES,

  // Generator functions
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
};

// If run directly, generate sample data
if (require.main === module) {
  console.log('Generating sample AML data...\n');

  console.log('=== Sample Transaction ===');
  const sampleTransaction = generateTransaction();
  console.log(JSON.stringify(sampleTransaction, null, 2));

  console.log('\n=== Suspicious Transaction (Structuring) ===');
  const suspiciousTransaction = generateSuspiciousTransaction(SUSPICIOUS_PATTERNS.STRUCTURING);
  console.log(JSON.stringify(suspiciousTransaction, null, 2));

  console.log('\n=== AML Case ===');
  const amlCase = generateAMLCase({ pattern: SUSPICIOUS_PATTERNS.LAYERING });
  console.log(`Case ID: ${amlCase.caseId}`);
  console.log(`Transactions: ${amlCase.transactions.length}`);
  console.log(`Total Amount: $${amlCase.totalAmount.toFixed(2)}`);
  console.log(`SAR Filed: ${amlCase.sar ? 'Yes' : 'No'}`);

  console.log('\n=== Dataset Summary ===');
  const dataset = generateRealisticAMLDataset(500);
  console.log(JSON.stringify(dataset.summary, null, 2));
}
