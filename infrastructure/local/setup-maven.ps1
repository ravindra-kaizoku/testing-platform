# Setup Portable Maven if not present in PATH
$ErrorActionPreference = "Stop"

$mvnInPath = Get-Command mvn -ErrorAction SilentlyContinue
if ($mvnInPath) {
    Write-Host "Maven is already available in PATH: $($mvnInPath.Source)"
    exit 0
}

$mavenVersion = "3.9.6"
$targetDir = "$env:USERPROFILE\.m2\portable-maven"
$mavenHome = "$targetDir\apache-maven-$mavenVersion"
$binPath = "$mavenHome\bin"

if (Test-Path "$binPath\mvn.cmd") {
    Write-Host "Portable Maven already installed at: $mavenHome"
    Write-Host "Adding to PATH for this process..."
    $env:PATH += ";$binPath"
    exit 0
}

Write-Host "Downloading Apache Maven $mavenVersion..."
$downloadUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$tempZip = "$env:TEMP\maven-$mavenVersion.zip"

if (Test-Path $targetDir) {
    Remove-Item -Path $targetDir -Recurse -Force
}
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

Invoke-WebRequest -Uri $downloadUrl -OutFile $tempZip -UseBasicParsing
Write-Host "Extracting Maven..."
Expand-Archive -Path $tempZip -DestinationPath $targetDir -Force
Remove-Item -Path $tempZip -Force

if (Test-Path "$binPath\mvn.cmd") {
    Write-Host "Maven successfully set up at $mavenHome"
    $env:PATH += ";$binPath"
} else {
    Write-Error "Failed to install Maven correctly."
    exit 1
}
