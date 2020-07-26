# Powershell start script

if (-not (Test-Path "public/folktales/include")) {
    # Create library files if not already there.
    New-Item -Path public/folktales/include -Type Directory
    Copy-Item node_modules/factorygame/include/* public/folktales/include -Recurse
}

# Compile typescript files.
npx tsc