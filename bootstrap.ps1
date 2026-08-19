# Maison des Tontines - Bootstrap Script for Windows
# This script checks and installs all prerequisites locally

param(
    [switch]$SkipDatabase,
    [switch]$SkipMobile,
    [switch]$SkipApi,
    [switch]$UseSqlite,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-NodeVersion {
    if (Test-Command "node") {
        return (node --version)
    }
    return $null
}

function Get-NpmVersion {
    if (Test-Command "npm") {
        return (npm --version)
    }
    return $null
}

function Get-PostgresVersion {
    if (Test-Command "psql") {
        return (psql --version)
    }
    return $null
}

function Install-NodeJs {
    Write-Info "Node.js not found. Attempting to install via winget..."
    
    if (-not (Test-Command "winget")) {
        Write-Error "winget not found. Please install Node.js manually from https://nodejs.org/"
        exit 1
    }
    
    try {
        winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        $nodeVersion = Get-NodeVersion
        if ($nodeVersion) {
            Write-Success "Node.js installed: $nodeVersion"
        } else {
            Write-Warning "Node.js installation completed but version not detected. Please restart your terminal."
        }
    } catch {
        Write-Error "Failed to install Node.js: $_"
        exit 1
    }
}

function Install-PostgreSql {
    Write-Info "PostgreSQL not found. Attempting to install via winget..."
    
    if (-not (Test-Command "winget")) {
        Write-Error "winget not found. Please install PostgreSQL manually from https://www.postgresql.org/download/windows/"
        exit 1
    }
    
    try {
        winget install --id PostgreSQL.PostgreSQL --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        # Wait for PostgreSQL to be ready
        Write-Info "Waiting for PostgreSQL to initialize..."
        Start-Sleep -Seconds 5
        
        $pgVersion = Get-PostgresVersion
        if ($pgVersion) {
            Write-Success "PostgreSQL installed: $pgVersion"
        } else {
            Write-Warning "PostgreSQL installation completed. Please restart your terminal and run 'initdb' if needed."
        }
    } catch {
        Write-Error "Failed to install PostgreSQL: $_"
        exit 1
    }
}

function Use-SqliteMode {
    param([string]$EnvPath)
    
    Write-Info "Configuring SQLite mode for local development..."
    
    $envFile = "$EnvPath\.env"
    $envExample = "$EnvPath\.env.example"
    
    if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
        Copy-Item $envExample $envFile
    }
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        $content = $content -replace 'DATABASE_URL=postgresql://[^\r\n]+', 'DATABASE_URL=file:./dev.db'
        Set-Content $envFile $content
        Write-Success "SQLite mode configured in $envFile"
    }
}

function Initialize-Database {
    param([string]$DbUrl)
    
    Write-Info "Setting up database..."
    
    # Extract database connection details from URL
    # Format: postgresql://user:pass@host:port/dbname
    if ($DbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
        $user = $matches[1]
        $pass = $matches[2]
        $host = $matches[3]
        $port = $matches[4]
        $dbname = $matches[5]
        
        # Try to create database if it doesn't exist
        $env:PGPASSWORD = $pass
        try {
            $result = psql -U $user -h $host -p $port -tc "SELECT 1 FROM pg_database WHERE datname = '$dbname';" 2>&1
            if ($result -notmatch "1") {
                Write-Info "Creating database '$dbname'..."
                createdb -U $user -h $host -p $port $dbname
                Write-Success "Database created."
            } else {
                Write-Success "Database '$dbname' already exists."
            }
        } catch {
            Write-Warning "Could not verify/create database. Please create it manually: CREATE DATABASE $dbname;"
        }
    } else {
        Write-Warning "Could not parse DATABASE_URL. Please ensure your database exists."
    }
}

function Install-Dependencies {
    param([string]$Path, [string]$Name)
    
    Write-Info "Installing dependencies for $Name..."
    
    Push-Location $Path
    
    try {
        npm install --legacy-peer-deps
        Write-Success "$Name dependencies installed."
    } catch {
        Write-Error "Failed to install $Name dependencies: $_"
        exit 1
    } finally {
        Pop-Location
    }
}

function Start-ApiServer {
    Write-Info "Starting API server..."
    
    Push-Location "$PROJECT_ROOT\apps\api"
    
    # Set environment variables if not set
    if (-not $env:DATABASE_URL) {
        $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/maison_tontines?schema=public"
    }
    
    try {
        npx prisma generate
        Write-Success "Prisma client generated."
    } catch {
        Write-Warning "Prisma generate failed. Make sure PostgreSQL is running."
    }
    
    try {
        npm run dev
    } catch {
        Write-Error "Failed to start API server: $_"
        exit 1
    } finally {
        Pop-Location
    }
}

function Start-MobileServer {
    Write-Info "Starting Expo mobile app..."
    
    Push-Location "$PROJECT_ROOT\apps\mobile"
    
    try {
        npx expo start
    } catch {
        Write-Error "Failed to start Expo: $_"
        exit 1
    } finally {
        Pop-Location
    }
}

# Main execution
if ($Help) {
    Write-Host @"
Maison des Tontines - Bootstrap Script

Usage: .\bootstrap.ps1 [options]

Options:
  -SkipDatabase    Skip database installation/check
  -SkipMobile      Skip mobile app setup
  -SkipApi         Skip API server setup
  -UseSqlite       Use SQLite instead of PostgreSQL for development
  -Help            Show this help message

Examples:
  .\bootstrap.ps1                     # Full setup with PostgreSQL
  .\bootstrap.ps1 -UseSqlite           # Setup with SQLite for development
  .\bootstrap.ps1 -SkipMobile          # Setup only API
  .\bootstrap.ps1 -SkipDatabase        # Setup without database
"@
    exit 0
}

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏠  Maison des Tontines - Bootstrap Script              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check prerequisites
Write-Info "Checking prerequisites..."

$nodeVersion = Get-NodeVersion
$npmVersion = Get-NpmVersion
$pgVersion = Get-PostgresVersion

Write-Host ""
Write-Host "Prerequisites Status:" -ForegroundColor Cyan
Write-Host "  Node.js: $nodeVersion" -ForegroundColor $(if ($nodeVersion) { "Green" } else { "Red" })
Write-Host "  npm:     $npmVersion" -ForegroundColor $(if ($npmVersion) { "Green" } else { "Red" })
Write-Host "  PostgreSQL: $pgVersion" -ForegroundColor $(if ($pgVersion) { "Green" } else { "Yellow" })
if (-not $pgVersion -and -not $UseSqlite) {
    Write-Host "  (Use -UseSqlite flag to run without PostgreSQL)" -ForegroundColor Yellow
}
Write-Host ""

# Install missing prerequisites
if (-not $nodeVersion) {
    Install-NodeJs
}

if (-not $pgVersion -and -not $SkipDatabase -and -not $UseSqlite) {
    Install-PostgreSql
}

# Configure database
if (-not $SkipDatabase) {
    if ($UseSqlite) {
        Use-SqliteMode -EnvPath "$PROJECT_ROOT\apps\api"
    } elseif ($pgVersion) {
        # Load .env if exists
        $envFile = "$PROJECT_ROOT\apps\api\.env"
        if (-not (Test-Path $envFile)) {
            $envExample = "$PROJECT_ROOT\apps\api\.env.example"
            if (Test-Path $envExample) {
                Copy-Item $envExample $envFile
                Write-Success "Created .env from .env.example"
            }
        }
        
        if (Test-Path $envFile) {
            Get-Content $envFile | ForEach-Object {
                if ($_ -match '^([^=]+)=(.*)$') {
                    $key = $matches[1]
                    $value = $matches[2]
                    Set-Item -Path "env:$key" -Value $value
                }
            }
        }
        
        Initialize-Database -DbUrl $env:DATABASE_URL
    }
}

# Install dependencies
Write-Info "Installing project dependencies..."
Install-Dependencies -Path "$PROJECT_ROOT\apps\api" -Name "API"
Install-Dependencies -Path "$PROJECT_ROOT\apps\mobile" -Name "Mobile"

Write-Success "All dependencies installed!"
Write-Host ""

# Start servers
if ($SkipApi -and $SkipMobile) {
    Write-Success "Bootstrap complete! Run 'npm run dev' in apps/api and 'npx expo start' in apps/mobile to start."
    exit 0
}

if ($SkipApi) {
    Start-MobileServer
    exit 0
}

if ($SkipMobile) {
    Start-ApiServer
    exit 0
}

# Start both servers (requires separate terminals)
Write-Info "Starting servers..."
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  1. API Server:   cd apps/api && npm run dev" -ForegroundColor White
Write-Host "  2. Mobile App:   cd apps/mobile && npx expo start" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Do you want to start the API server now? (y/N)"
if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    Start-ApiServer
}
