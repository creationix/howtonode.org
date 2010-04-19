mkdir ~/NodeLibs
cd ~/NodeLibs
git clone git://github.com/creationix/node-router.git
git clone git://github.com/creationix/haml-js.git
git clone git://github.com/creationix/proto.git
mkdir ~/.node_libraries
cd ~/.node_libraries
ln -s ~/NodeLibs/*/lib/* ./
