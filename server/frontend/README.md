# Dealership Review Frontend

React single-page application for the dealership capstone. In local development, start Django on port 8000 and run `npm start` here; the configured development proxy forwards `/djangoapp/*` to Django. For deployment, `npm run build` creates the static bundle that the Django/WhiteNoise server serves.

```sh
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) while developing. Run `npm run build` to verify the production bundle.
