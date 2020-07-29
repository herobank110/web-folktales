# Bash start script

if [ ! -d public/folktales/include ]
then
    # Create library files if not already there.
    mkdir public/folktales/include
    cp node_modules/factorygame/include/* public/folktales/include/factorygame -r
    cp node_modules/three public/folktales/include -r
fi

ls public/folktales/include/three/examples/jsm/loaders

# Compile typescript files.
npx tsc