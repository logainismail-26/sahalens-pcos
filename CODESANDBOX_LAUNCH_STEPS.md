# CodeSandbox Launch Steps for SahaLens

This is the fastest way to launch SahaLens as a website beta.

## 1. Upload the project to CodeSandbox
1. Go to CodeSandbox.
2. Create a new sandbox.
3. Choose **Import Project** or upload this folder.
4. Make sure the project root contains:
   - `server.js`
   - `package.json`
   - `public/index.html`
   - `public/source-library.js`

## 2. Install and run
CodeSandbox should automatically run:

```bash
npm install
npm start
```

If it does not, open the terminal and run those commands manually.

## 3. Add your OpenAI key safely
Do NOT paste your API key inside any JavaScript file.

Add it as an environment variable / secret:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5
```

The backend reads it from `process.env.OPENAI_API_KEY`.

## 4. Check if AI is connected
Open the app preview.

At the top of the chat card, it should say:

```text
AI connected
```

If it says:

```text
AI backend off
```

then the environment variable is missing or the backend is not running.

## 5. Share the website
For beta testing, share the CodeSandbox preview URL.

For a cleaner public launch, connect the project to GitHub and deploy with a production host such as Vercel, Render, Railway, Fly.io, or Netlify Functions.

## 6. Before sharing publicly
Do these first:
- Test 20+ PCOS questions.
- Test typos.
- Test unsafe questions.
- Make sure it never diagnoses.
- Make sure it never gives medication/supplement dose instructions.
- Make sure sources show under answers.
- Add privacy policy and contact email.
- Ask a parent/adult advisor to review the wording.
