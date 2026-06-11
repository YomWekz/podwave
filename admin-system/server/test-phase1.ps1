$results = @()
$BASE = "http://localhost:4001"
$SVC = "podwave_service_token_dev_2024_changeme"

function Test($label, $status, $expect, $extra="") {
    $ok = $status -eq $expect
    $icon = if ($ok) { "PASS" } else { "FAIL" }
    $results += "${icon} | ${label} | got:${status} expect:${expect} ${extra}"
    return $ok
}

# 1. Health open
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/health" -Method GET -UseBasicParsing -TimeoutSec 5
    Test "Health open" $r.StatusCode 200 | Out-Null
} catch { $results += "FAIL | Health open | error: $($_.Exception.Message)" }

# 2. Login wrong password
try {
    $body = '{"username":"admin","password":"wrongpass"}'
    $r = Invoke-WebRequest -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Test "Login wrong pass" $r.StatusCode 401 | Out-Null
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Test "Login wrong pass" $code 401 | Out-Null
} catch { $results += "FAIL | Login wrong pass | error: $($_.Exception.Message)" }

# 3. Login correct
$tok = $null
try {
    $body = '{"username":"admin","password":"admin123"}'
    $r = Invoke-WebRequest -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 5
    $data = $r.Content | ConvertFrom-Json
    $tok = $data.token
    $role = $data.role
    $hasToken = ($tok -ne $null -and $tok -ne "")
    Test "Login correct gets token" $r.StatusCode 200 "role=$role token_present=$hasToken" | Out-Null
} catch { $results += "FAIL | Login correct | error: $($_.Exception.Message)" }

# 4. Feeds without token
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/feeds" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Test "Feeds no token" $r.StatusCode 401 | Out-Null
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Test "Feeds no token" $code 401 | Out-Null
} catch { $results += "FAIL | Feeds no token | error: $($_.Exception.Message)" }

# 5. Feeds with token
try {
    $headers = @{ "Authorization" = "Bearer $tok" }
    $r = Invoke-WebRequest -Uri "$BASE/api/feeds" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 5
    Test "Feeds with token" $r.StatusCode 200 | Out-Null
} catch { $results += "FAIL | Feeds with token | error: $($_.Exception.Message)" }

# 6. Stats no token
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/stats" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Test "Stats no token" $r.StatusCode 401 | Out-Null
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Test "Stats no token" $code 401 | Out-Null
} catch { $results += "FAIL | Stats no token | error: $($_.Exception.Message)" }

# 7. Stats with token
try {
    $headers = @{ "Authorization" = "Bearer $tok" }
    $r = Invoke-WebRequest -Uri "$BASE/api/stats" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 5
    Test "Stats with token" $r.StatusCode 200 | Out-Null
} catch { $results += "FAIL | Stats with token | error: $($_.Exception.Message)" }

# 8. Jobs/failed no token
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/jobs/failed" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Test "Jobs no token" $r.StatusCode 401 | Out-Null
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Test "Jobs no token" $code 401 | Out-Null
} catch { $results += "FAIL | Jobs no token | error: $($_.Exception.Message)" }

# 9. Integration status no token
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/integration/status" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Test "Integration no token" $r.StatusCode 403 | Out-Null
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Test "Integration no token" $code 403 | Out-Null
} catch { $results += "FAIL | Integration no token | error: $($_.Exception.Message)" }

# 10. Integration with user JWT (should still 403)
try {
    $headers = @{ "Authorization" = "Bearer $tok" }
    $r = Invoke-WebRequest -Uri "$BASE/api/integration/status" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Test "Integration user JWT wrong type" $r.StatusCode 403 | Out-Null
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Test "Integration user JWT wrong type" $code 403 | Out-Null
} catch { $results += "FAIL | Integration user JWT wrong type | error: $($_.Exception.Message)" }

# 11. Integration with service token
try {
    $headers = @{ "Authorization" = "Bearer $SVC" }
    $r = Invoke-WebRequest -Uri "$BASE/api/integration/status" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 5
    $data = $r.Content | ConvertFrom-Json
    Test "Integration service token" $r.StatusCode 200 "editorAvailable=$($data.editorAvailable)" | Out-Null
} catch { $results += "FAIL | Integration service token | error: $($_.Exception.Message)" }

# 12. Verify token
try {
    $headers = @{ "Authorization" = "Bearer $tok" }
    $r = Invoke-WebRequest -Uri "$BASE/api/auth/verify" -Method POST -Headers $headers -UseBasicParsing -TimeoutSec 5
    $data = $r.Content | ConvertFrom-Json
    Test "Verify token" $r.StatusCode 200 "valid=$($data.valid) role=$($data.user.role)" | Out-Null
} catch { $results += "FAIL | Verify token | error: $($_.Exception.Message)" }

# Write results
$output = @"
=== PHASE 1 AUTH TEST RESULTS ===
Token obtained: $(if ($tok) { "YES" } else { "NO" })

$($results -join "`n")

PASSED: $($results | Where-Object { $_ -like "PASS*" } | Measure-Object | Select-Object -ExpandProperty Count)
FAILED: $($results | Where-Object { $_ -like "FAIL*" } | Measure-Object | Select-Object -ExpandProperty Count)
"@

$output | Out-File -FilePath "C:\Users\AMD\Downloads\podwave_project\admin-system\server\phase1-test-results.txt" -Encoding utf8
Write-Host $output
