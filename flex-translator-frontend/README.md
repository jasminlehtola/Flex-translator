# Flex Translator

This is the frontend of Flex Translator, a web app for translating documents using AI tools ChatGPT and DeepL. The user can upload a file, apply custom prompts and dictionaries, and edit the translations manually before finalizing.

- Vite + React + TypeScript
- TailwindCSS
- React Query
- TanStack Router
- GitLab OAuth
- ChatGPT & DeepL API integrations (via backend)

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

---

# Installation instructions for development

1. Clone the repository `git clone https://gitlab.utu.fi/open-programming/flex-translator/flex-translator-frontend.git` -->
   `cd flex-translator-frontend`
2. Install dependencies `npm install`

**Start frontend**
`npm run dev`
App is now running at http://localhost:5173

---
