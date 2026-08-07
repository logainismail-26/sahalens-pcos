const LOCAL_SOURCES = [
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
    title: "International adolescent PCOS recommendations",
    source: "International PCOS Guideline",
    kind: "Evidence-based guideline",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11899933/",
    tags: ["teen", "adolescent", "diagnosis", "irregular periods", "acne", "criteria", "guideline"],
    text: "Adolescent PCOS evaluation should use adolescent-specific criteria. Teen symptoms such as acne and irregular cycles need careful context."
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

function localNormalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function localRetrieve(question, limit = 3) {
  const words = localNormalize(question).split(" ").filter((word) => word.length > 2);
  return LOCAL_SOURCES.map((source) => {
    const haystack = localNormalize([source.title, source.source, source.kind, source.tags.join(" "), source.text].join(" "));
    let score = 0;
    for (const word of words) if (haystack.includes(word)) score += source.tags.includes(word) ? 5 : 2;
    return { ...source, score };
  }).filter((source) => source.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
