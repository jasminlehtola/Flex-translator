rm -rf frontend
mkdir frontend
cd frontend
git clone https://gitlab.utu.fi/open-programming/flex-translator/flex-translator-frontend.git
cd flex-translator-frontend
npm install
npm run build 
cp -r dist ../../

cd ../../
docker compose build --no-cache
docker compose up


