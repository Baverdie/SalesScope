# 🧪 SalesScope - Guide des Tests

## 📋 Overview

Ce fichier contient des exemples de tests pour t'aider à écrire tes propres tests pendant les semaines 2-4.

---

## 🔧 Backend Tests (Jest)

### Setup Test Environment

**Fichier** : `apps/api/src/test/setup.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

const prismaBinary = join(__dirname, '..', '..', 'node_modules', '.bin', 'prisma');

const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset database
  execSync(`${prismaBinary} migrate reset --force --skip-seed`, {
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
  });

  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up data between tests
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

export { prisma };
```

### Exemple 1 : Test du Password Utils

**Fichier** : `apps/api/src/utils/password.test.ts`

```typescript
import { passwordUtils } from './password';

describe('Password Utils', () => {
  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'Test123!@#';
      const hash = await passwordUtils.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Test123!@#';
      const hash1 = await passwordUtils.hash(password);
      const hash2 = await passwordUtils.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should verify correct password', async () => {
      const password = 'Test123!@#';
      const hash = await passwordUtils.hash(password);

      const isValid = await passwordUtils.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'Test123!@#';
      const hash = await passwordUtils.hash(password);

      const isValid = await passwordUtils.verify('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('validate', () => {
    it('should accept valid password', () => {
      const result = passwordUtils.validate('Test123!@#');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject too short password', () => {
      const result = passwordUtils.validate('Test1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase', () => {
      const result = passwordUtils.validate('test123!@#');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = passwordUtils.validate('TEST123!@#');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = passwordUtils.validate('TestTest!@#');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special char', () => {
      const result = passwordUtils.validate('Test1234567');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });
});
```

### Exemple 2 : Test du Token Utils

**Fichier** : `apps/api/src/utils/token.test.ts`

```typescript
import { tokenUtils } from './token';
import { prisma } from '../test/setup';

describe('Token Utils', () => {
  let userId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
      },
    });
    userId = user.id;
  });

  describe('generateRefreshToken', () => {
    it('should generate a random token', () => {
      const token1 = tokenUtils.generateRefreshToken();
      const token2 = tokenUtils.generateRefreshToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64);
    });
  });

  describe('createRefreshToken', () => {
    it('should create and store a refresh token', async () => {
      const token = await tokenUtils.createRefreshToken(userId);

      expect(token).toBeDefined();

      const stored = await prisma.refreshToken.findUnique({
        where: { token },
      });

      expect(stored).toBeDefined();
      expect(stored?.userId).toBe(userId);
      expect(stored?.revoked).toBe(false);
    });

    it('should store IP and user agent', async () => {
      const token = await tokenUtils.createRefreshToken(
        userId,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      const stored = await prisma.refreshToken.findUnique({
        where: { token },
      });

      expect(stored?.ipAddress).toBe('192.168.1.1');
      expect(stored?.userAgent).toBe('Mozilla/5.0');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid token', async () => {
      const token = await tokenUtils.createRefreshToken(userId);

      const result = await tokenUtils.verifyRefreshToken(token);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-existent token', async () => {
      const result = await tokenUtils.verifyRefreshToken('fake-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token not found');
    });

    it('should reject revoked token', async () => {
      const token = await tokenUtils.createRefreshToken(userId);
      await tokenUtils.revokeRefreshToken(token);

      const result = await tokenUtils.verifyRefreshToken(token);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token has been revoked');
    });
  });
});
```

### Exemple 3 : Test des Routes Auth

**Fichier** : `apps/api/src/modules/auth/auth.routes.test.ts`

```typescript
import { buildServer } from '../../server';
import { prisma } from '../../test/setup';

describe('Auth Routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'newuser@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.user.email).toBe('newuser@example.com');
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
    });

    it('should reject weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'weak',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject duplicate email', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashed',
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'existing@example.com',
          password: 'Test123!@#',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user to login with
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'login@example.com',
          password: 'Test123!@#',
        },
      });
    });

    it('should login with correct credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'Test123!@#',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'notfound@example.com',
          password: 'Test123!@#',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'me@example.com',
          password: 'Test123!@#',
          firstName: 'Test',
        },
      });
      const body = JSON.parse(response.body);
      accessToken = body.data.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.email).toBe('me@example.com');
      expect(body.data.firstName).toBe('Test');
    });

    it('should reject without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
```

---

## 🌐 Frontend Tests (Jest + React Testing Library)

### Exemple 1 : Test du API Client

**Fichier** : `apps/web/src/lib/api/client.test.ts`

```typescript
import { apiClient, ApiError } from './client';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    apiClient.setAccessToken(null);
  });

  describe('register', () => {
    it('should make POST request to /api/auth/register', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: { id: '1', email: 'test@example.com' },
            accessToken: 'token',
          },
        }),
      });

      const result = await apiClient.register({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Test123!@#',
          }),
        })
      );
    });

    it('should throw ApiError on failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation failed' }),
      });

      await expect(
        apiClient.register({
          email: 'invalid',
          password: 'weak',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('login', () => {
    it('should store access token after login', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: { id: '1' },
            accessToken: 'new-token',
            refreshToken: 'refresh-token',
          },
        }),
      });

      await apiClient.login({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      expect(apiClient.getAccessToken()).toBe('new-token');
    });
  });

  describe('authenticated requests', () => {
    it('should include Authorization header when token is set', async () => {
      apiClient.setAccessToken('my-token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiClient.getMe();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });
  });
});
```

---

## 🎭 E2E Tests (Playwright)

### Configuration Playwright

**Fichier** : `apps/web/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Exemple E2E : Parcours complet

**Fichier** : `apps/web/e2e/auth-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register, login and access dashboard', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/SalesScope/);

    // Click register
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/\/auth\/register/);

    // Fill registration form
    await page.fill('[name="email"]', 'playwright@example.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.fill('[name="firstName"]', 'Playwright');
    await page.fill('[name="lastName"]', 'Test');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

---

## 🎯 Coverage Goal

### Target: 70% minimum

```bash
# Run tests with coverage
pnpm test:coverage

# Output example:
# -------------------------|---------|----------|---------|---------|
# File                     | % Stmts | % Branch | % Funcs | % Lines |
# -------------------------|---------|----------|---------|---------|
# All files                |   85.2  |   78.4   |   82.1  |   85.8  |
#  utils/                  |   92.1  |   85.3   |   90.0  |   93.2  |
#   password.ts            |   95.0  |   87.5   |   92.8  |   96.1  |
#   token.ts               |   89.2  |   83.1   |   87.2  |   90.3  |
#  modules/auth/           |   78.5  |   71.6   |   74.2  |   79.1  |
# -------------------------|---------|----------|---------|---------|
```

### Priority

1. **Critical paths** : Auth, upload, payment
2. **Business logic** : Services, utils
3. **Edge cases** : Error handling
4. **Happy paths** : Main user flows

---

## 📝 Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('should do something', async () => {
  // Arrange - Setup
  const user = await createTestUser();

  // Act - Execute
  const result = await someFunction(user.id);

  // Assert - Verify
  expect(result).toBe(expectedValue);
});
```

### 2. Test Isolation

```typescript
// ✅ GOOD - Each test is independent
beforeEach(async () => {
  await cleanDatabase();
});

// ❌ BAD - Tests depend on each other
test('create user', () => {
  user = createUser(); // Creates global state
});

test('update user', () => {
  updateUser(user); // Depends on previous test
});
```

### 3. Mock External Services

```typescript
// Mock Redis
jest.mock('../config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock email service
jest.mock('../services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
```

### 4. Test Naming

```typescript
// ✅ GOOD - Descriptive
it('should reject password without uppercase letter', () => {});

// ❌ BAD - Vague
it('password validation works', () => {});
```

---

**Ready to write tests! 🧪**

Ces exemples te donnent une base solide pour tester ton code pendant les prochaines semaines.
