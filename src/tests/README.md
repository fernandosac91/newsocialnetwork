# Test Suite for News Social Network

This directory contains test cases for the News Social Network application.

## Test Environment Setup

The tests are designed to run in a separate test environment with its own database to avoid affecting the production data.

### Prerequisites

To run these tests, you need to install Jest and related dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest jest-environment-node
```

### Test Database Configuration

Create a `.env.test` file in the project root with the following content:

```
# Test Database
TEST_DATABASE_URL=sqlite:./prisma/test.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-nextauth-secret-key
JWT_SECRET=test-jwt-secret-key

# Stripe (Mock Values)
STRIPE_SECRET_KEY=sk_test_mock_key
STRIPE_WEBHOOK_SECRET=whsec_mock_secret
STRIPE_PRICE_ID=price_mock_id

# Test Settings
NODE_ENV=test
```

### Setting Up Jest Configuration

Add the following Jest configuration to your `package.json` file:

```json
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/*.test.ts"],
  "setupFilesAfterEnv": ["<rootDir>/src/tests/setup.ts"]
}
```

Or create a `jest.config.js` file in the project root:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};
```

## Running the Tests

Add the following scripts to your `package.json` file:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

Then run the tests with:

```bash
npm run test
```

## Test Cases

The test suite includes the following test files:

1. **Role-based Access Control** (`role-based-access.test.ts`)
   - Tests access control for events based on user roles and community membership
   - Verifies that admins can view all events
   - Ensures users can only view events in their own community
   - Confirms pending users cannot access events

2. **Circle Membership and Viewing** (`circle-membership.test.ts`)
   - Tests joining circles and viewing circle content
   - Verifies users can view circles in their community
   - Tests that pending users cannot join circles
   - Ensures users cannot join circles from other communities

3. **User Approval Flow** (`user-approval.test.ts`)
   - Tests the user approval process
   - Verifies admins can view, approve, and reject pending users
   - Tests role-based approval permissions
   - Confirms approved users can access community features

4. **Subscription Gating** (`subscription-gating.test.ts`)
   - Tests subscription-based feature access
   - Verifies users with active subscriptions can access premium features
   - Ensures users without subscriptions cannot access premium features
   - Tests that expired subscriptions do not grant access to premium features

## Seed Data

The tests use seed data created in `helpers/seed-test-data.ts`, which includes:

- 3 communities (Bonn, Cologne, Düsseldorf)
- 10 users with different roles and statuses
- 3 events per community
- 2 circles per community

The seed data is automatically created when running the tests.

## Troubleshooting

- If you encounter database errors, make sure the test database path is correct and writable
- For Prisma-related issues, try running `npx prisma generate` to update the Prisma client 