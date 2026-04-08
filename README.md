# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## Firebase deployment

This project now uses Firebase for authentication. The configuration lives in `src/lib/firebase.ts`, and the login form will sign in with your Firebase project's credentials.

1. Make sure you have a user created in the Firebase console matching the admin email and password you intend to use (e.g. `shahabhan2005@gmail.com` / `shahab`).
2. Install and log in with the Firebase CLI if you haven't:

```sh
npm install -g firebase-tools
firebase login
```

3. Initialize hosting (if not already done):

```sh
firebase init hosting
# when asked for the "public" directory, point it to the build output (usually "dist" for Vite)
# you can also skip initialization and create the config manually; example below:
```

An example `firebase.json` might look like:

```json
{
  "hosting": {
    "site": "app-technext96-5804d",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

Make sure the `site` field matches your Firebase Hosting site ID (e.g. `app-technext96-5804d`).

### Firebase configuration in the app

The project already includes a central Firebase helper at `src/lib/firebase.ts` that
defines and initializes the SDK using the following configuration (replace these
values if you switch projects):

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpa9qT7RNUO-HhCPj9yI6syAaE8FnoTYA",
  authDomain: "app-technext96.firebaseapp.com",
  projectId: "app-technext96",
  storageBucket: "app-technext96.firebasestorage.app",
  messagingSenderId: "502156100653",
  appId: "1:502156100653:web:5cd495616057c0d69b24a4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

All other parts of the app import from this file (`import { auth } from './lib/firebase'`).
If you add Firestore, Storage, or other products, simply extend this helper and re‑export
the corresponding clients:

```ts
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

For security you may eventually want to move these values into `import.meta.env`
variables so they are not committed to source control; the hard‑coded version works for
a quick demo but is not recommended for production.

Having the configuration centralized is what "fix it in all app" means – every
module uses the same initialized instance, so updating one file updates the entire
application.

4. Build and deploy:

```sh
npm run build
firebase deploy
```

Login state persists via Firebase's auth session, so after deployment the admin panel will require a valid account.

---

