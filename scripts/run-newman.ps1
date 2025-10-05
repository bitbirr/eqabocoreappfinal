Param(
  [string]$Collection = "postman/Smoke-Workflow-Current-API.postman_collection.json",
  [string]$Environment = "postman/Smoke-Workflow-Current-API.postman_environment.json"
)

$ErrorActionPreference = 'Stop'

# Ensure PG SSL for Neon
if (-not $env:PGSSLMODE) { $env:PGSSLMODE = 'require' }

Write-Host "Building project..."
npm run build | Write-Host

function Wait-ForHealth($url, [int]$retries = 40) {
  for ($i = 0; $i -lt $retries; $i++) {
    try {
      $resp = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 2
      if ($resp.success -eq $true) { return $true }
    } catch { Start-Sleep -Milliseconds 500 }
  }
  return $false
}

Write-Host "Starting server..."
$server = Start-Process -FilePath node -ArgumentList 'dist/server.js' -PassThru
try {
  if (-not (Wait-ForHealth 'http://localhost:3000/api/health')) {
    throw 'Server did not become healthy in time'
  }
  
  # Compute date variables for environment if placeholders present
  $envPath = Resolve-Path $Environment
  $envJson = Get-Content $envPath -Raw | ConvertFrom-Json
  $ci = (Get-Date).AddDays(7).ToString('yyyy-MM-dd')
  $co = (Get-Date).AddDays(9).ToString('yyyy-MM-dd')
  $envJson.values | ForEach-Object {
    if ($_.key -eq 'checkin' -or $_.key -eq 'calculated_checkin') { $_.value = $ci }
    if ($_.key -eq 'checkout' -or $_.key -eq 'calculated_checkout') { $_.value = $co }
  }
  $tmpEnv = New-TemporaryFile
  $envJson | ConvertTo-Json -Depth 6 | Set-Content -Path $tmpEnv -Encoding UTF8

  Write-Host "Running Newman..."
  $rand = Get-Random -Minimum 10000000 -Maximum 99999999
  $guestPhone = "+2519$rand"
  npx --yes newman run $Collection -e $tmpEnv --env-var guest_phone=$guestPhone --timeout-request 60000 --delay-request 200 --reporters cli --bail
} finally {
  if ($server -and !$server.HasExited) { 
    Write-Host "Stopping server..."
    Stop-Process -Id $server.Id -Force 
  }
}
