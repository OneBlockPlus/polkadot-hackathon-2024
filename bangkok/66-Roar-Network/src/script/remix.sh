apt-get -y install nodejs
apt-get -y install npm
apt-get -y install python3-pip
sudo pip3 install slither-analyzer
npm install -g @remix-project/remixd
remixd -s ./contracts/ --remix-ide http://remix.ethereum.org/
