# Powershell start script
# Determine script location for PowerShell
$ProjectDir = Split-Path $script:MyInvocation.MyCommand.Path
# Leave the "scripts" directory to the main directory.
$ProjectDir += "/../"


if (-not (Test-Path "$ProjectDir/public/lib")) {
    # Create library files if not already there.
    Copy-Item "$ProjectDir/node_modules/factorygame" "$ProjectDir/public/lib/factorygame" -r
}

# Compile typescript files.
npx tsc --project $ProjectDir