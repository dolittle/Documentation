echo "Initiating submodules (this might take a while).."
cd /workspaces/Documentation
git submodule update --init --recursive

echo --------------------------------------------------------------------------
echo "Installing npm packages"
cd Source
npm install

echo --------------------------------------------------------------------------
echo "to run hugo execute 'hugo server' in /workspaces/Documentation/Source"
echo --------------------------------------------------------------------------