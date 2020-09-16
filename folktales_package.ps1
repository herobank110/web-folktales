# Trigger a full build of the game.
./folktales_start.ps1

# Create a copy of the necessary folders.
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
}

New-Item -Type Directory dist
Copy-Item -Recurse ./public/* -Destination dist

# Add the redirecting root html file.
$indexFile = New-Item -Type File dist/index.html
$contents = '<html><head><meta http-equiv="refresh" content="0; ./folktales"></head></html>'
Set-Content $indexFile $contents
        
# Remove unnecessary files.
Remove-Item -Recurse -Force dist/folktales/include/three/src
Remove-Item -Recurse -Force dist/folktales/include/three/build
Remove-Item -Recurse -Force dist/folktales/include/three/examples/fonts
Remove-Item -Recurse -Force dist/folktales/include/three/examples/js
Remove-Item -Recurse -Force dist -Include .DS_Store,*.d.ts

# Zip into one package.
zip -r dist.zip dist
