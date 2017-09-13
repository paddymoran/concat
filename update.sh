source bin/activate
git pull
npm install
python migrate.py config.py
rm serviceIsLive.flag
rm -rf public/*
cp src/static/maintenance.html public/maintenance.html
NODE_ENV=production webpack
touch serviceIsLive.flag