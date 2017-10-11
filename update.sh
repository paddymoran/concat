mkdir -p prodbuild
source bin/activate
git pull
npm install
npm dedupe
python migrate.py config.py
NODE_ENV=production webpack --env.output=prodbuild
rm -rf public
mv prodbuild public
