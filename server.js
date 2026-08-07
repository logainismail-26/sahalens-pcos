import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const SOURCES = [
  {
    title: "MedlinePlus PCOS overview",
    source: "MedlinePlus",
    kind: "Trusted government health information",
    url: "https://medlineplus.gov/polycysticovarysyndrome.html",
    tags: ["pcos", "hormones", "periods", "cycle", "skin", "hair", "insulin", "metabolic", "symptoms"],
    text: "PCOS is related to hormone imbalance and can involve menstrual changes, skin or hair symptoms, and metabolic health concerns such as insulin resistance."
  },
  {
    title: "ACOG PCOS FAQ",
    source: "ACOG",
    kind: "Medical professional organization",
    url: "https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos",
    tags: ["symptoms", "periods", "cycle", "acne", "hair growth", "treatment", "birth control", "metformin", "fertility"],
    text: "ACOG describes PCOS signs such as irregular menstrual periods, acne, excess hair growth, and care options that depend on symptoms and goals."
  },
  {
    title: "Mayo Clinic PCOS diagnosis and treatment",
    source: "Mayo Clinic",
    kind: "Clinician-reviewed medical article",
    url: "https://www.mayoclinic.org/diseases-conditions/pcos/diagnosis-treatment/drc-20353443",
    tags: ["diagnosis", "treatment", "doctor", "medication", "symptoms", "appointment", "reliable source"],
    text: "Mayo Clinic explains that PCOS diagnosis and treatment focus on symptoms and long-term health risks. Care plans can differ depending on the person."
  },
  {
    title: "Mayo Clinic PCOS symptoms and causes",
    source: "Mayo Clinic",
    kind: "Clinician-reviewed medical article",
    url: "https://www.mayoclinic.org/diseases-conditions/pcos/symptoms-causes/syc-20353439",
    tags: ["causes", "insulin resistance", "skin", "dark patches", "metabolic", "diabetes", "symptoms"],
    text: "Mayo Clinic discusses possible links between PCOS, insulin resistance, symptoms, and long-term metabolic health."
  },
  {
    title: "International adolescent PCOS recommendations",
    source: "International PCOS Guideline",
    kind: "Evidence-based guideline",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11899933/",
    tags: ["teen", "adolescent", "diagnosis", "irregular periods", "acne", "criteria", "guideline"],
    text: "Adolescent PCOS evaluation should use adolescent-specific criteria. Teen symptoms such as acne and irregular cycles need careful context."
  },
  {
    title: "Adolescent PCOS diagnosis experience study",
    source: "Clinical Endocrinology",
    kind: "Peer-reviewed study",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/cen.14604",
    tags: ["teen", "adolescent", "emotional support", "mental health", "diagnosis experience", "information needs"],
    text: "Research on adolescents with PCOS found that teens may need clearer information, long-term guidance, and emotional support after diagnosis."
  },
  {
    title: "PCOS TikTok content quality study",
    source: "Peer-reviewed PCOS social-media research",
    kind: "Peer-reviewed study",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12177293/",
    tags: ["tiktok", "instagram", "social media", "misinformation", "reliability", "accuracy", "online advice"],
    text: "Research has examined PCOS-related TikTok content for quality, reliability, accuracy, and misinformation. Viral PCOS advice should be checked against reliable sources."
  }
];

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function typoFix(text) {
  const fixes = { pocs: "pcos", posc: "pcos", perido: "period", perid: "period", piriod: "period", preiod: "period", irregualr: "irregular", iregular: "irregular", cylce: "cycle", inslin: "insulin", insuln: "insulin", dignosed: "diagnosed", medicaiton: "medication", medecine: "medicine", supplemnt: "supplement", vitimin: "vitamin", fertilty: "fertility", pregnacy: "pregnancy", hormons: "hormones", axiety: "anxiety", fatiuge: "fatigue", docter: "doctor", apointment: "appointment" };
  return normalize(text).split(" ").map((word) => fixes[word] || word).join(" ");
}

function retrieveSources(question, limit = 4) {
  const fixed = typoFix(question);
  const words = fixed.split(" ").filter((word) => word.length > 2);
  return SOURCES.map((source) => {
    const haystack = normalize([source.title, source.source, source.kind, source.tags.join(" "), source.text].join(" "));
    let score = 0;
    for (const word of words) {
      if (haystack.includes(word)) score += source.tags.includes(word) ? 5 : 2;
    }
    for (const tag of source.tags) {
      if (fixed.includes(normalize(tag))) score += 7;
    }
    return { ...source, score };
  }).filter((source) => source.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

function safetyBoundary(question) {
  const q = question.toLowerCase();
  if (/(severe|unbearable|faint|passed out|chest pain|can't breathe|heavy bleeding|emergency|er|vomiting nonstop|self harm|suicidal)/i.test(q)) return "SahaLens cannot evaluate urgent symptoms. Tell a trusted adult and contact a healthcare professional or emergency service right away.";
  if (/(do i have pcos|diagnose me|tell me if i have|is this pcos)/i.test(q)) return "SahaLens cannot diagnose PCOS. It can explain reliable source context and help you organize questions for a healthcare professional.";
  if (/(how much|dose|dosage|should i take|can i take|start|stop|quit|increase|decrease).*(metformin|wegovy|birth control|medicine|medication|pill|supplement|vitamin|iron|omega|inositol)/i.test(q)) return "SahaLens cannot tell you to start, stop, mix, or change medication or supplement doses. Ask a licensed healthcare professional or pharmacist.";
  if (/(lose weight fast|calorie limit|starve|not eat|skip meals|extreme diet)/i.test(q)) return "SahaLens does not give extreme dieting or rapid weight-loss instructions. It can help you ask about balanced, safe care with a healthcare professional.";
  return "";
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/ask", async (req, res) => {
  try {
    const question = String(req.body?.question || "").slice(0, 2000).trim();
    if (!question) return res.status(400).json({ error: "Question is required." });

    const boundary = safetyBoundary(question);
    const retrieved = retrieveSources(question);
    const selectedSources = retrieved.length ? retrieved : SOURCES.slice(0, 3);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        title: "AI backend not connected",
        answer: "The app is running, but OPENAI_API_KEY is missing on the server. Add it as an environment variable in Render or your hosting platform.",
        boundary,
        nextQuestions: ["What exact PCOS topic should I ask about?", "What should I bring to a healthcare professional?"],
        sources: selectedSources
      });
    }

    const sourceText = selectedSources.map((source, index) => `[${index + 1}] ${source.title} (${source.source}, ${source.kind})\nURL: ${source.url}\nPassage: ${source.text}`).join("\n\n");

    const instructions = `You are SahaLens, a PCOS health-literacy assistant for teens. Answer only using the provided source passages. You are not a doctor. Do not diagnose, prescribe, recommend medication/supplement dose changes, give emergency triage, or give extreme diet/weight-loss instructions. If the question has typos, infer the likely PCOS-related meaning and briefly say what you think they mean. If the sources do not support an answer, say that clearly. Use supportive teen-friendly language. Return JSON only with keys: title, answer, boundary, nextQuestions. nextQuestions must be an array of 2-4 safe questions to ask a healthcare professional.`;

    const input = `User question: ${question}\n\nSafety boundary already detected: ${boundary || "none"}\n\nReliable source passages:\n${sourceText}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions,
      input,
      store: false
    });

    let parsed;
    try {
      parsed = JSON.parse(response.output_text || "{}");
    } catch {
      parsed = { title: "Source-backed answer", answer: response.output_text || "I could not generate an answer.", boundary, nextQuestions: [] };
    }

    res.json({
      title: parsed.title || "Source-backed answer",
      answer: parsed.answer || "I could not generate an answer from the provided sources.",
      boundary: boundary || parsed.boundary || "",
      nextQuestions: Array.isArray(parsed.nextQuestions) ? parsed.nextQuestions.slice(0, 4) : [],
      sources: selectedSources.map(({ score, ...source }) => source)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SahaLens running at http://localhost:${port}`));
