param(
    [switch]$CheckOnly,
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  THE PRESS ROOM 3D - Presentation QA Checker" -ForegroundColor Cyan
Write-Host "  Root: $ProjectRoot" -ForegroundColor DarkCyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Check HTML entry points
$entries = @("index.html", "press-room\index.html", "presentation\index.html")
foreach ($entry in $entries) {
    $full = Join-Path $ProjectRoot $entry
    if (Test-Path $full) {
        $size = (Get-Item $full).Length
        Write-Host "[OK] Entry found: $entry ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Missing entry: $entry" -ForegroundColor Yellow
    }
}

# 2. Check press-room images
$imgDir = Join-Path $ProjectRoot "press-room\images"
if (Test-Path $imgDir) {
    $jpgs = Get-ChildItem -Path $imgDir -Filter "*.jpg"
    Write-Host "[OK] Press Room real photos available: $($jpgs.Count) files in press-room/images/" -ForegroundColor Green
} else {
    Write-Host "[WARN] press-room/images directory not found." -ForegroundColor Yellow
}

# 3. Check config.js files
$configs = @("js\config.js", "press-room\js\config.js", "presentation\js\config.js")
foreach ($cfg in $configs) {
    $full = Join-Path $ProjectRoot $cfg
    if (Test-Path $full) {
        $content = Get-Content $full -Raw -Encoding UTF8
        if ($content -match "PRESS_CONFIG|DECK_CONFIG") {
            Write-Host "[OK] Valid config object in $cfg" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Config symbol missing in $cfg" -ForegroundColor Yellow
        }
    }
}

if ($CheckOnly) {
    Write-Host "`nQA Check completed (--CheckOnly)." -ForegroundColor Cyan
    exit 0
}

Write-Host "`nStarting local preview server on http://localhost:$Port ..." -ForegroundColor Cyan
if (Get-Command python -ErrorAction SilentlyContinue) {
    Push-Location $ProjectRoot
    python -m http.server $Port
    Pop-Location
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    npx --yes serve $ProjectRoot -l $Port
} else {
    Write-Host "Python or Node (npx) not found. Opening index.html directly..." -ForegroundColor Yellow
    Start-Process (Join-Path $ProjectRoot "press-room\index.html")
}
