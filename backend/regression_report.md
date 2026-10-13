# Feature 21: Full Regression Validation Report

**Total Tests:** 20
**Passed:** 0
**Failed:** 20
**Total Execution Time:** 51.48s

## Detailed Results

| Test Suite | Status | Execution Time | Notes |
|---|---|---|---|
| `test-acknowledgements.ts` | ❌ FAIL | 2571ms | See error log below |
| `test-adaptive-difficulty-depth.ts` | ❌ FAIL | 2753ms | See error log below |
| `test-ai-interview-security-isolation.ts` | ❌ FAIL | 3621ms | See error log below |
| `test-closing-flow.ts` | ❌ FAIL | 3044ms | See error log below |
| `test-concurrency-data-consistency.ts` | ❌ FAIL | 2879ms | See error log below |
| `test-context-memory-anti-repetition.ts` | ❌ FAIL | 3075ms | See error log below |
| `test-error-recovery-resilience.ts` | ❌ FAIL | 2586ms | See error log below |
| `test-evaluation-final-results.ts` | ❌ FAIL | 2470ms | See error log below |
| `test-interruption-pause-repeat.ts` | ❌ FAIL | 3675ms | See error log below |
| `test-interview-config-jd-rules.ts` | ❌ FAIL | 2749ms | See error log below |
| `test-interview-configuration-multitype.ts` | ❌ FAIL | 2212ms | See error log below |
| `test-interview-lifecycle-recovery.ts` | ❌ FAIL | 2151ms | See error log below |
| `test-intro-flow.ts` | ❌ FAIL | 2318ms | See error log below |
| `test-jd-interview-orchestration.ts` | ❌ FAIL | 2765ms | See error log below |
| `test-multitype-question-generation-enforcement.ts` | ❌ FAIL | 2269ms | See error log below |
| `test-production-failure-recovery.ts` | ❌ FAIL | 2024ms | See error log below |
| `test-question-quality.ts` | ❌ FAIL | 2150ms | See error log below |
| `test-realtime-state-frontend-sync.ts` | ❌ FAIL | 1902ms | See error log below |
| `test-smart-answer-understanding.ts` | ❌ FAIL | 1985ms | See error log below |
| `test-student-response-handling.ts` | ❌ FAIL | 2262ms | See error log below |

## Failure Details

### `test-acknowledgements.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-acknowledgements.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-acknowledgements.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-acknowledgements.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-acknowledgements.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-acknowledgements.ts'
}

Node.js v22.12.0

```

### `test-adaptive-difficulty-depth.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-adaptive-difficulty-depth.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-adaptive-difficulty-depth.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-adaptive-difficulty-depth.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-adaptive-difficulty-depth.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-adaptive-difficulty-depth.ts'
}

Node.js v22.12.0

```

### `test-ai-interview-security-isolation.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-ai-interview-security-isolation.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-ai-interview-security-isolation.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-ai-interview-security-isolation.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-ai-interview-security-isolation.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-ai-interview-security-isolation.ts'
}

Node.js v22.12.0

```

### `test-closing-flow.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-closing-flow.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-closing-flow.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-closing-flow.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-closing-flow.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-closing-flow.ts'
}

Node.js v22.12.0

```

### `test-concurrency-data-consistency.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-concurrency-data-consistency.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-concurrency-data-consistency.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-concurrency-data-consistency.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-concurrency-data-consistency.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-concurrency-data-consistency.ts'
}

Node.js v22.12.0

```

### `test-context-memory-anti-repetition.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-context-memory-anti-repetition.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-context-memory-anti-repetition.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-context-memory-anti-repetition.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-context-memory-anti-repetition.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-context-memory-anti-repetition.ts'
}

Node.js v22.12.0

```

### `test-error-recovery-resilience.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-error-recovery-resilience.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-error-recovery-resilience.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-error-recovery-resilience.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-error-recovery-resilience.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-error-recovery-resilience.ts'
}

Node.js v22.12.0

```

### `test-evaluation-final-results.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-evaluation-final-results.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-evaluation-final-results.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-evaluation-final-results.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-evaluation-final-results.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-evaluation-final-results.ts'
}

Node.js v22.12.0

```

### `test-interruption-pause-repeat.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interruption-pause-repeat.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interruption-pause-repeat.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interruption-pause-repeat.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interruption-pause-repeat.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interruption-pause-repeat.ts'
}

Node.js v22.12.0

```

### `test-interview-config-jd-rules.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-config-jd-rules.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-config-jd-rules.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interview-config-jd-rules.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-config-jd-rules.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interview-config-jd-rules.ts'
}

Node.js v22.12.0

```

### `test-interview-configuration-multitype.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-configuration-multitype.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-configuration-multitype.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interview-configuration-multitype.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-configuration-multitype.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interview-configuration-multitype.ts'
}

Node.js v22.12.0

```

### `test-interview-lifecycle-recovery.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-lifecycle-recovery.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-lifecycle-recovery.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interview-lifecycle-recovery.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-interview-lifecycle-recovery.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-interview-lifecycle-recovery.ts'
}

Node.js v22.12.0

```

### `test-intro-flow.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-intro-flow.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-intro-flow.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-intro-flow.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-intro-flow.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-intro-flow.ts'
}

Node.js v22.12.0

```

### `test-jd-interview-orchestration.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-jd-interview-orchestration.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-jd-interview-orchestration.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-jd-interview-orchestration.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-jd-interview-orchestration.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-jd-interview-orchestration.ts'
}

Node.js v22.12.0

```

### `test-multitype-question-generation-enforcement.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-multitype-question-generation-enforcement.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-multitype-question-generation-enforcement.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-multitype-question-generation-enforcement.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-multitype-question-generation-enforcement.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-multitype-question-generation-enforcement.ts'
}

Node.js v22.12.0

```

### `test-production-failure-recovery.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-production-failure-recovery.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-production-failure-recovery.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-production-failure-recovery.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-production-failure-recovery.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-production-failure-recovery.ts'
}

Node.js v22.12.0

```

### `test-question-quality.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-question-quality.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-question-quality.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-question-quality.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-question-quality.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-question-quality.ts'
}

Node.js v22.12.0

```

### `test-realtime-state-frontend-sync.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-realtime-state-frontend-sync.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-realtime-state-frontend-sync.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-realtime-state-frontend-sync.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-realtime-state-frontend-sync.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-realtime-state-frontend-sync.ts'
}

Node.js v22.12.0

```

### `test-smart-answer-understanding.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-smart-answer-understanding.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-smart-answer-understanding.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-smart-answer-understanding.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-smart-answer-understanding.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-smart-answer-understanding.ts'
}

Node.js v22.12.0

```

### `test-student-response-handling.ts`
**Error Details:**
```
Command failed: npx tsx C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-student-response-handling.ts

node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-student-response-handling.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-student-response-handling.ts'
}

Node.js v22.12.0

```
**Output:**
```


node:internal/modules/run_main:122
    triggerUncaughtException(
    ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\tests\e2e\test-student-response-handling.ts' imported from C:\Users\risla\OneDrive\Documents\Career-Hub-Test\CareerHub\backend\
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:932:10)
    at defaultResolve (node:internal/modules/esm/resolve:1056:11)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at resolveBase (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:8141)
    at resolveDirectory (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:9227)
    at resolveTsPaths (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:10757)
    at resolve2 (file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/node_modules/tsx/dist/register-CqMfTiWi.mjs:2:11938)
    at nextResolve (node:internal/modules/esm/hooks:748:28)
    at Hooks.resolve (node:internal/modules/esm/hooks:240:30) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/risla/OneDrive/Documents/Career-Hub-Test/CareerHub/backend/tests/e2e/test-student-response-handling.ts'
}

Node.js v22.12.0

```

