# GenAI-in-Testing
## AI-Driven Customer Support Platform with KYC/AML Capabilities

A comprehensive testing framework for TechSpark Solutions' KYC (Know Your Customer) and AML (Anti-Money Laundering) banking platform, developed using Generative AI tools.

### Project Overview

As a Test Manager at TechSpark Solutions, this project demonstrates the use of generative AI tools to:
- Create comprehensive requirements documentation
- Develop epics and user stories
- Plan sprints with story point estimation
- Generate synthetic test data using Faker.js
- Build automated test suites using Jest
- Create Requirements Traceability Matrix (RTM)
- Generate test execution reports

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Generate RTM report
npm run generate:rtm

# Generate test report
npm run generate:report
```

### Project Structure

```
GenAI-in-Testing/
├── package.json              # Project configuration
├── jest.config.js            # Jest test configuration
├── README.md
├── docs/
│   ├── requirements.md       # 108 requirements documented
│   ├── epics-and-user-stories.md  # 27 user stories, 6 epics
│   ├── sprint-planning.md    # 6 sprints, 226 story points
│   ├── rtm-matrix.md         # Requirements Traceability Matrix
│   ├── test-report.md        # Test execution report
│   └── final-report.md       # Complete project analysis
├── src/
│   ├── data-generators/
│   │   ├── kyc-data-generator.js   # KYC synthetic data
│   │   └── aml-data-generator.js   # AML synthetic data
│   ├── test-scenarios/
│   │   └── test-scenarios.js       # Test scenario definitions
│   └── reporting/
│       ├── rtm.js                  # RTM generator
│       └── test-report-generator.js # Report generator
└── tests/
    ├── kyc.test.js           # KYC test suite
    ├── aml.test.js           # AML test suite
    └── integration.test.js   # Integration tests
```

### Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| Requirements | 108 requirements across 7 categories |
| User Stories | 27 stories organized into 6 epics |
| Story Points | 226 points planned across 6 sprints |
| Test Cases | 37+ automated test cases |
| Test Coverage | 179 passing tests |

### Technology Stack

- **Runtime:** Node.js 18+
- **Testing Framework:** Jest 29.x
- **Data Generation:** Faker.js 8.x

### Documentation

- [Requirements](docs/requirements.md) - Complete requirements specification
- [Epics & User Stories](docs/epics-and-user-stories.md) - Agile artifacts
- [Sprint Planning](docs/sprint-planning.md) - Sprint breakdown
- [RTM](docs/rtm-matrix.md) - Requirements Traceability Matrix
- [Test Report](docs/test-report.md) - Test execution results
- [Final Report](docs/final-report.md) - Project analysis

### Generated with Generative AI

This project demonstrates the practical application of Generative AI in software testing, achieving:
- 60-70% reduction in documentation time
- Comprehensive test coverage
- Automated traceability
- Realistic synthetic data generation
