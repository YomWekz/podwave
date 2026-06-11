/**
 * Phase 1 Complete Test Runner
 * Starts the admin server as a child process, runs all 12 tests, prints results.
 * Run from: admin-system/server/
 * Usage: node run-phase1-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

const BASE = 'http://127.0.0.1:4001';
const SERVICE_TOKEN = 'podwave_service_token_dev_2024_changeme';
const DEV_AUTH_ENV = {
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: '$2b$10$dIxjBU5CsXN7uj/YAitgD.jJI5r1IPnaB0L9nEASfDZU3o.zQIBga',
    ADMIN_JWT_SECRET: 'phase1_admin_auth_test_secret_change_me',
    JWT_EXPIRES_IN: '8h',
    SERVICE_TOKEN
};

let passed = 0;
let failed = 0;
let adminToken = null;

// ── Helpers ─────────────────────────────────────────────────────────────────

async function req(method, url, { body, token, serviceToken } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token)       headers['Authorization'] = `Bearer ${token}`;
    if (serviceToken) headers['Authorization'] = `Bearer ${serviceToken}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    let data = {};
    try { data = await r.json(); } catch {}
    return { status: r.status, ok: r.ok, data };
}

async function test(label, expectStatus, fn) {
    try {
        const r = await fn();
        const ok = r.status === expectStatus;
        if (ok) {
            console.log(`  ✅  ${label} → ${r.status}`);
            passed++;
        } else {
            console.log(`  ❌  ${label} → got ${r.status}, expected ${expectStatus}`);
            console.log(`       body: ${JSON.stringify(r.data)}`);
            failed++;
        }
        return r;
    } catch (e) {
        console.log(`  ❌  ${label} → ERROR: ${e.message}`);
        failed++;
        return null;
    }
}

async function waitForServer(retries = 20) {
    for (let i = 0; i < retries; i++) {
        try {
            await fetch(`${BASE}/api/health`);
            return true;
        } catch {
            await new Promise(r => setTimeout(r, 300));
        }
    }
    return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
    // Start the server as a child process
    console.log('\n═══ Starting admin server for testing ═══');
    const server = spawn('node', ['src/index.js'], {
        cwd: path.resolve(__dirname),
        env: { ...process.env, ...DEV_AUTH_ENV },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    server.stdout.on('data', d => process.stdout.write('[SERVER] ' + d));
    server.stderr.on('data', d => process.stderr.write('[SERVER ERR] ' + d));

    const up = await waitForServer();
    if (!up) {
        console.error('❌ Server failed to start in time');
        server.kill();
        process.exit(1);
    }

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   Phase 1 Admin Auth — Full Test Suite           ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ── 1. Open Routes ──────────────────────────────────────────────────────
    console.log('── 1. Open Routes (no auth required) ──');

    await test('GET /api/health → 200', 200, () => req('GET', `${BASE}/api/health`));
    await test('GET /api/health/db → 200', 200, () => req('GET', `${BASE}/api/health/db`));

    // ── 2. Login ───────────────────────────────────────────────────────────
    console.log('\n── 2. Login ──');

    await test('POST /api/auth/login — no body → 400', 400,
        () => req('POST', `${BASE}/api/auth/login`, { body: {} }));

    await test('POST /api/auth/login — wrong password → 401', 401,
        () => req('POST', `${BASE}/api/auth/login`, { body: { username: 'admin', password: 'wrong' } }));

    await test('POST /api/auth/login — wrong username → 401', 401,
        () => req('POST', `${BASE}/api/auth/login`, { body: { username: 'hacker', password: 'admin123' } }));

    const loginResult = await test('POST /api/auth/login — correct → 200 + token', 200,
        () => req('POST', `${BASE}/api/auth/login`, { body: { username: 'admin', password: 'admin123' } }));

    if (loginResult?.data?.token) {
        adminToken = loginResult.data.token;
        console.log(`       role: ${loginResult.data.role}, expiresIn: ${loginResult.data.expiresIn}`);
    }

    // ── 3. Verify ──────────────────────────────────────────────────────────
    console.log('\n── 3. Token Verify ──');

    await test('POST /api/auth/verify — no token → 401', 401,
        () => req('POST', `${BASE}/api/auth/verify`));

    await test('POST /api/auth/verify — bad token → 401', 401,
        () => req('POST', `${BASE}/api/auth/verify`, { token: 'invalid.token.here' }));

    const verifyResult = await test('POST /api/auth/verify — valid token → 200', 200,
        () => req('POST', `${BASE}/api/auth/verify`, { token: adminToken }));

    if (verifyResult?.data?.user) {
        console.log(`       user.role: ${verifyResult.data.user.role}`);
    }

    // ── 4. Protected Routes — No Token ─────────────────────────────────────
    console.log('\n── 4. Protected Routes — No Token → 401 ──');

    await test('GET /api/feeds — no token → 401', 401,
        () => req('GET', `${BASE}/api/feeds`));

    await test('GET /api/stats — no token → 401', 401,
        () => req('GET', `${BASE}/api/stats`));

    await test('GET /api/jobs/failed — no token → 401', 401,
        () => req('GET', `${BASE}/api/jobs/failed`));

    // ── 5. Protected Routes — With Token ───────────────────────────────────
    console.log('\n── 5. Protected Routes — With Token → 200 ──');

    await test('GET /api/feeds — with token → 200', 200,
        () => req('GET', `${BASE}/api/feeds`, { token: adminToken }));

    await test('GET /api/stats — with token → 200', 200,
        () => req('GET', `${BASE}/api/stats`, { token: adminToken }));

    await test('GET /api/jobs/failed — with token → 200', 200,
        () => req('GET', `${BASE}/api/jobs/failed`, { token: adminToken }));

    // ── 6. Integration Routes — Service Token ──────────────────────────────
    console.log('\n── 6. Integration Routes — Service Token ──');

    await test('GET /api/integration/status — no token → 403', 403,
        () => req('GET', `${BASE}/api/integration/status`));

    await test('GET /api/integration/status — user JWT (wrong type) → 403', 403,
        () => req('GET', `${BASE}/api/integration/status`, { token: adminToken }));

    await test('GET /api/integration/status — service token → 200', 200,
        () => req('GET', `${BASE}/api/integration/status`, { serviceToken: SERVICE_TOKEN }));

    // ── Summary ────────────────────────────────────────────────────────────
    const total = passed + failed;
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  Results: ${passed}/${total} passed, ${failed} failed`.padEnd(51) + '║');
    console.log(`║  Token: ${adminToken ? 'OBTAINED ✅' : 'MISSING ❌'}`.padEnd(51) + '║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    if (adminToken) {
        console.log('Token for manual testing:');
        console.log(adminToken);
        console.log('');
    }

    server.kill('SIGTERM');
    process.exit(failed > 0 ? 1 : 0);
})();
