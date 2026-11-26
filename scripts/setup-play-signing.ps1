<#
  Bloom Merge – one-time Google Play signing setup (Windows PowerShell)

  What it does:
    1. Creates your private signing key in  %USERPROFILE%\bloom-merge-signing\bloom-merge.jks
       (outside the repo – it is never committed)
    2. Adds the 4 secrets GitHub needs to build the signed Play bundle (.aab):
       ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
       - automatically, if the GitHub CLI (gh) is installed and logged in
       - otherwise it shows you exactly what to paste on GitHub

  Run it from the repo folder:
    powershell -ExecutionPolicy Bypass -File scripts\setup-play-signing.ps1

  BACK UP the .jks file and your password (e.g. a USB stick + a password manager).
  If you lose them you can never update the app on Google Play.
#>

$ErrorActionPreference = 'Stop'
$Repo  = 'engkhkh/bloom-merge'
$Alias = 'bloom'
$Dir   = Join-Path $env:USERPROFILE 'bloom-merge-signing'
$Jks   = Join-Path $Dir 'bloom-merge.jks'

function Find-Keytool {
  $cmd = Get-Command keytool -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:JAVA_HOME\bin\keytool.exe",
    "$env:ProgramFiles\Android\Android Studio\jbr\bin\keytool.exe",
    "$env:ProgramFiles\Android\Android Studio\jre\bin\keytool.exe"
  ) + (Get-ChildItem "$env:USERPROFILE\.jdks\*\bin\keytool.exe" -ErrorAction SilentlyContinue | ForEach-Object FullName) `
    + (Get-ChildItem "$env:ProgramFiles\Java\*\bin\keytool.exe" -ErrorAction SilentlyContinue | ForEach-Object FullName) `
    + (Get-ChildItem "$env:ProgramFiles\Eclipse Adoptium\*\bin\keytool.exe" -ErrorAction SilentlyContinue | ForEach-Object FullName)
  foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
  throw "keytool not found. Install Android Studio (it includes Java), then run this script again."
}

function Read-Password {
  while ($true) {
    $a = Read-Host 'Choose a password for the signing key (at least 6 characters)' -AsSecureString
    $b = Read-Host 'Type it again' -AsSecureString
    $pa = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($a))
    $pb = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($b))
    if ($pa.Length -lt 6) { Write-Host 'Too short, try again.' -ForegroundColor Yellow; continue }
    if ($pa -ne $pb) { Write-Host 'The two passwords are different, try again.' -ForegroundColor Yellow; continue }
    return $pa
  }
}

Write-Host "`n=== Bloom Merge: Google Play signing setup ===`n" -ForegroundColor Green

if (Test-Path $Jks) {
  Write-Host "A key already exists at $Jks" -ForegroundColor Yellow
  Write-Host 'Keeping it (never replace a key you have already used on Google Play).'
  $Password = Read-Host 'Enter its password to (re)upload the GitHub secrets' -AsSecureString
  $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))
} else {
  $keytool = Find-Keytool
  $Password = Read-Password
  New-Item -ItemType Directory -Force -Path $Dir | Out-Null
  & $keytool -genkeypair -v -keystore $Jks -alias $Alias -keyalg RSA -keysize 2048 -validity 10000 `
    -storepass $Password -keypass $Password -dname 'CN=Bloom Merge, OU=Games, O=Bloom Merge, C=SA' | Out-Null
  if (-not (Test-Path $Jks)) { throw 'keytool did not create the key.' }
  Write-Host "Key created: $Jks" -ForegroundColor Green
}

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($Jks))
$secrets = [ordered]@{
  'ANDROID_KEYSTORE_BASE64'   = $b64
  'ANDROID_KEYSTORE_PASSWORD' = $Password
  'ANDROID_KEY_ALIAS'         = $Alias
  'ANDROID_KEY_PASSWORD'      = $Password
}

$gh = Get-Command gh -ErrorAction SilentlyContinue
$ghReady = $false
if ($gh) { & gh auth status 2>$null | Out-Null; $ghReady = ($LASTEXITCODE -eq 0) }

if ($ghReady) {
  foreach ($k in $secrets.Keys) {
    $secrets[$k] | & gh secret set $k --repo $Repo | Out-Null
    Write-Host "  secret $k added" -ForegroundColor Green
  }
  Write-Host "`nDone! The next GitHub build will include bloom-merge-play.aab for Google Play." -ForegroundColor Green
} else {
  Write-Host "`nGitHub CLI (gh) is not installed or not logged in, so add the secrets by hand:" -ForegroundColor Yellow
  Write-Host "  Open https://github.com/$Repo/settings/secrets/actions -> 'New repository secret'"
  Write-Host "  1. ANDROID_KEYSTORE_BASE64  = (already copied to your clipboard: just paste)"
  Write-Host "  2. ANDROID_KEYSTORE_PASSWORD = the password you chose"
  Write-Host "  3. ANDROID_KEY_ALIAS         = $Alias"
  Write-Host "  4. ANDROID_KEY_PASSWORD      = the password you chose"
  Set-Clipboard -Value $b64
}

Write-Host "`nIMPORTANT: back up $Dir and your password somewhere safe." -ForegroundColor Cyan
