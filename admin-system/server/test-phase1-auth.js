/**
 * Phase 1 Auth Test Script — Admin Backend
 * Run from: admin-system/server/
 * Usage: node test-phase1-auth.js
 *
 * Tests every route category:
 *  - Open routes (health)
 *  - Auth routes (login, verify)
 *  - Protected routes with/without token (feeds, jobs, stats)
 *  - Integration routes with/without service token
 */

const BASE = 'http://localhost:4001';
const SERVICE_TOKEN = 'podwave_service_token_dev_2024_changeme';

let adminToken = null;
let passed = 0;
let failed = 0;

async function test(label, fn) {
    try {
        const result = await fn();
        const ok = result.ok;
        if (ok) {
            console.log(`  ✅  ${label}`);
            passed++;
        } else {
            console.log(`  ❌  ${label}`);
            console.log(`      Got: ${JSON.stringify(result.data)}`);
            failed++;
        }
    } catch (err) {
        console.log(`  ❌  ${label}`);
        console.log(`      Error: ${err.message}`);
        failed++;
    }
}

async function req(method, path, { body, token, serviceToken } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (serviceToken) headers['Authorization'] = `Bearer ${serviceToken}`;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, ok: res.ok };
}

(async () => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   Phase 1 Admin Auth Test Suite                  ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ─── 1. OPEN ROUTES ────────────────────────────────────────────────────────
    console.log('── 1. Open Routes (no auth required) ──');

    await test('GET /api/health → 200', async () => {
        const r = await req('GET', '/api/health');
        return { ...r, ok: r.status === 200 && r.data.status === 'ok' };
    });

    await test('GET /api/health/db → 200', async () => {
        const r = await req('GET', '/api/health/db');
        return { ...r, ok: r.status === 200 };
    });

    // ─── 2. LOGIN ──────────────────────────────────────────────────────────────
    console.log('\n── 2. Auth — Login ──');

    await test('POST /api/auth/login with wrong password → 401', async () => {
        const r = await req('POST', '/api/auth/login', { body: { username: 'admin', password: 'wrongpass' } });
        return { ...r, ok: r.status === 401 };
    });

    await test('POST /api/auth/login with wrong username → 401', async () => {
        const r = await req('POST', '/api/auth/login', { body: { username: 'hacker', password: 'admin123' } });
        return { ...r, ok: r.status === 401 };
    });

    await test('POST /api/auth/login with no body → 400', async () => {
        const r = await req('POST', '/api/auth/login', { body: {} });
        return { ...r, ok: r.status === 400 };
    });

    await test('POST /api/auth/login with correct credentials → 200 + token', async () => {
        const r = await req('POST', '/api/auth/login', { body: { username: 'admin', password: 'admin123' } });
        if (r.ok && r.data.token) adminToken = r.data.token;
        return { ...r, ok: r.status === 200 && !!r.data.token && r.data.role === 'admin' };
    });

    // ─── 3. VERIFY ─────────────────────────────────────────────────────────────
    console.log('\n── 3. Auth — Verify ──');

    await test('POST /api/auth/verify with valid token → 200', async () => {
        const r = await req('POST', '/api/auth/verify', { token: adminToken });
        return { ...r, ok: r.status === 200 && r.data.valid === true };
    });

    await test('POST /api/auth/verify with no token → 401', async () => {
        const r = await req('POST', '/api/auth/verify');
        return { ...r, ok: r.status === 401 };
    });

    await test('POST /api/auth/verify with bad token → 401', async () => {
        const r = await req('POST', '/api/auth/verify', { token: 'invalid.token.here' });
        return { ...r, ok: r.status === 401 };
    });

    // ─── 4. PROTECTED ROUTES — WITHOUT TOKEN ───────────────────────────────────
    console.log('\n── 4. Protected Routes — No Token (should all be 401) ──');

    await test('GET /api/feeds without token → 401', async () => {
        const r = await req('GET', '/api/feeds');
        return { ...r, ok: r.status === 401 };
    });

    await test('GET /api/jobs/logs without token → 401', async () => {
        const r = await req('GET', '/api/jobs/logs');
        return { ...r, ok: r.status === 401 };
    });

    await test('GET /api/jobs/failed without token → 401', async () => {
        const r = await req('GET', '/api/jobs/failed');
        return { ...r, ok: r.status === 401 };
    });

    await test('GET /api/stats without token → 401', async () => {
        const r = await req('GET', '/api/stats');
        return { ...r, ok: r.status === 401 };
    });

    // ─── 5. PROTECTED ROUTES — WITH VALID TOKEN ────────────────────────────────
    console.log('\n── 5. Protected Routes — With Valid Token (should all be 200) ──');

    await test('GET /api/feeds with token → 200', async () => {
        const r = await req('GET', '/api/feeds', { token: adminToken });
        return { ...r, ok: r.status === 200 };
    });

    await test('GET /api/jobs/logs with token → 200', async () => {
        const r = await req('GET', '/api/jobs/logs', { token: adminToken });
        return { ...r, ok: r.status === 200 };
    });

    await test('GET /api/stats with token → 200', async () => {
        const r = await req('GET', '/api/stats', { token: adminToken });
        return { ...r, ok: r.status === 200 };
    });

    // ─── 6. INTEGRATION ROUTES — SERVICE TOKEN ─────────────────────────────────
    console.log('\n── 6. Integration Routes — Service Token Auth ──');

    await test('GET /api/integration/status without service token → 403', async () => {
        const r = await req('GET', '/api/integration/status');
        return { ...r, ok: r.status === 403 };
    });

    await test('GET /api/integration/status with user JWT (wrong token type) → 403', async () => {
        const r = await req('GET', '/api/integration/status', { token: adminToken });
        return { ...r, ok: r.status === 403 };
    });

    await test('GET /api/integration/status with service token → 200', async () => {
        const r = await req('GET', '/api/integration/status', { serviceToken: SERVICE_TOKEN });
        return { ...r, ok: r.status === 200 };
    });

    await test('POST /api/integration/batch-send-to-editor without service token → 403', async () => {
        const r = await req('POST', '/api/integration/batch-send-to-editor', { body: { feedIds: [1] } });
        return { ...r, ok: r.status === 403 };
    });

    // ─── 7. SUMMARY ────────────────────────────────────────────────────────────
    const total = passed + failed;
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  Results: ${passed}/${total} passed, ${failed} failed`.padEnd(51) + '║');
    console.log(`║  Admin Token obtained: ${adminToken ? 'YES ✅' : 'NO ❌'}`.padEnd(51) + '║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    if (adminToken) {
        console.log('Token for manual testing:');
        console.log(adminToken);
    }

    process.exit(failed > 0 ? 1 : 0);
})();
