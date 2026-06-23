(cd scripts && node compile-portfolio.js) & 
(cd backend-api && npm run dev) &
(cd front-web && npm run dev) &
(cd front-app && npx expo start)