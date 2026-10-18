<#
.SYNOPSIS
  E1 - Build reproductible du monorepo (8 services Maven + frontend Next.js).

.DESCRIPTION
  Par defaut : compile et package SANS tests Spring (pas besoin de MySQL).
  Option -RunTests : execute aussi les tests (necessite souvent MySQL/Eureka up).

.EXAMPLE
  .\scripts\build-all.ps1
  .\scripts\build-all.ps1 -SkipFrontend
  .\scripts\build-all.ps1 -RunTests
#>
param(
    [switch]$RunTests,
    [switch]$SkipFrontend,
    [switch]$SkipBackend
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Services = @(
    "backend\discovery-server\discovery-server",
    "backend\config-server\config-server",
    "backend\auth-service\auth-service",
    "backend\user-service\user-service",
    "backend\client-service\client-service",
    "backend\courier-service\courier-service",
    "backend\package-service\package-service",
    "backend\api-gateway\api-gateway"
)

$MavenGoals = if ($RunTests) { @("test", "package") } else { @("-DskipTests", "package") }
$Failed = @()
$Ok = @()

Write-Host "=== E1 Build monorepo ===" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host "Maven goals: $($MavenGoals -join ' ')"
Write-Host ""

if (-not $SkipBackend) {
    foreach ($Rel in $Services) {
        $Dir = Join-Path $Root $Rel
        $Name = Split-Path $Rel -Leaf
        $Mvnw = Join-Path $Dir "mvnw.cmd"

        if (-not (Test-Path $Mvnw)) {
            Write-Host "[FAIL] $Name - mvnw.cmd introuvable dans $Dir" -ForegroundColor Red
            $Failed += $Name
            continue
        }

        Write-Host "--- Building $Name ---" -ForegroundColor Yellow
        Push-Location $Dir
        try {
            & .\mvnw.cmd -q @MavenGoals
            if ($LASTEXITCODE -ne 0) {
                throw "Maven exit code $LASTEXITCODE"
            }
            Write-Host "[OK] $Name" -ForegroundColor Green
            $Ok += $Name
        }
        catch {
            Write-Host "[FAIL] $Name - $_" -ForegroundColor Red
            $Failed += $Name
        }
        finally {
            Pop-Location
        }
    }
}

if (-not $SkipFrontend) {
    $Front = Join-Path $Root "frontend\delivery-app-frontend"
    Write-Host "--- Building frontend (Next.js) ---" -ForegroundColor Yellow
    Push-Location $Front
    try {
        if (-not (Test-Path "node_modules")) {
            npm ci
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed ($LASTEXITCODE)" }
        }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed ($LASTEXITCODE)" }
        Write-Host "[OK] frontend" -ForegroundColor Green
        $Ok += "frontend"
    }
    catch {
        Write-Host "[FAIL] frontend - $_" -ForegroundColor Red
        $Failed += "frontend"
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "=== Resume ===" -ForegroundColor Cyan
if ($Ok.Count -gt 0) {
    Write-Host ("OK   : " + ($Ok -join ", "))
} else {
    Write-Host "OK   : (aucun)"
}
if ($Failed.Count -gt 0) {
    Write-Host ("FAIL : " + ($Failed -join ", "))
} else {
    Write-Host "FAIL : (aucun)"
}

if ($Failed.Count -gt 0) {
    exit 1
}

Write-Host "E1 build OK." -ForegroundColor Green
exit 0
