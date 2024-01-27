# Clean up old executables
rm -rf /srv/ovpnrental/node_modules;
rm -rf /srv/ovpnrental/dist;
rm -rf /srv/ovpnrental/.git;
rm -rf /srv/ovpnrental/src;

# Replace with the new version
unzip -o ovpnrental.zip -d /srv/ovpnrental;
rm -f ovpnrental.zip;
cd /srv/ovpnrental;

# Build new version and launch
yarn install;
yarn build;
pm2 restart ovpnrental;

# Remove build script
rm -f install.sh;