# SahaLens PCOS — CodeSandbox Ready AI Website

This is the version that is actually built like "ChatGPT inside the app."

## What this includes

- Polished responsive front end
- Real backend endpoint: `/api/ask`
- OpenAI-powered PCOS chat
- Reliable source retrieval before the AI answers
- Safety boundaries for:
  - diagnosis
  - medication changes/doses
  - supplements
  - urgent symptoms
  - extreme dieting or unsafe advice
- Local browser storage for:
  - check-ins
  - vault
  - appointment pack
- Export tools
- No OpenAI API key in browser code

## How to run locally

1. Install Node.js.
2. Open this folder in Terminal.
3. Install packages:

```bash
npm install
```

4. Create a `.env` file using `.env.example`.
5. Add your OpenAI API key to `.env`:

```text
OPENAI_API_KEY=sk-your-key-here
```

6. Start the app:

```bash
npm start
```

7. Open:

```text
http://localhost:3000
```

## Why the backend is required

A real AI chatbot needs an API key. API keys must stay on the server, not inside front-end browser code. The browser sends the user's question to your backend, and your backend securely calls OpenAI.

## How SahaLens answers

1. User asks a PCOS question.
2. Backend retrieves the best matching reliable PCOS source passages.
3. Backend sends the question + sources to OpenAI.
4. AI answers only from those sources.
5. App shows the sources used.

## Production launch checklist

Before a real public launch:
- Add a reviewed medical source database.
- Add privacy/legal review.
- Add secure authentication if storing user accounts.
- Encrypt sensitive data.
- Add accessibility testing.
- Add logging/monitoring without collecting unnecessary health data.
- Add clinician/adult review of safety rules.
- Make a clear privacy policy and terms.

## CodeSandbox quick launch

Upload/import this folder into CodeSandbox. Add `OPENAI_API_KEY` as a secret/environment variable. Run:

```bash
npm install
npm start
```

Then open the preview URL.

If the app says `AI backend off`, the server is running but the OpenAI key is missing or not loaded.
