/**
 * High-Quality 1536-dimensional Semantic Vector Generator
 * Generates unit-normalized 1536-float embedding vectors with semantic clustering
 * for e-commerce products and search queries.
 */

// Core semantic concept clusters
const CONCEPT_CLUSTERS = {
  bag: [
    "bag", "backpack", "handbag", "tote", "duffle", "purse", "luggage", "pack",
    "carrier", "travel", "satchel", "pouch", "briefcase", "straps", "compartments"
  ],
  footwear: [
    "shoe", "shoes", "sneaker", "sneakers", "footwear", "running", "walking",
    "boots", "trainers", "joggers", "soles", "cushioning", "slip-on", "laces"
  ],
  audio: [
    "audio", "sound", "music", "headphone", "headphones", "earbuds", "speaker",
    "bluetooth", "wireless", "noise-canceling", "acoustic", "bass", "earphones"
  ],
  fitness: [
    "fitness", "workout", "gym", "exercise", "training", "yoga", "mat",
    "dumbbell", "weights", "strength", "sports", "cardio", "stretch"
  ],
  kitchen: [
    "kitchen", "coffee", "maker", "espresso", "dinnerware", "ceramic", "kettle",
    "cookware", "cooking", "tableware", "mug", "cup", "brew", "meals"
  ],
  clothing: [
    "clothing", "clothes", "jacket", "shirt", "hoodie", "t-shirt", "pants",
    "apparel", "wear", "cotton", "denim", "fleece", "outwear", "fashion"
  ],
  accessories: [
    "accessories", "watch", "leather", "wrist", "analog", "strap", "sunglasses",
    "wallet", "belt", "timepiece", "minimalist"
  ],
  beauty: [
    "beauty", "skincare", "perfume", "fragrance", "cologne", "cleansing",
    "moisturizing", "cosmetics", "lotion", "glow", "scent"
  ],
  stationery: [
    "stationery", "notebook", "pen", "journal", "writing", "paper", "notes",
    "hardcover", "planner", "ink", "ballpoint", "office"
  ],
  furniture: [
    "furniture", "chair", "table", "desk", "sofa", "seating", "living", "decor",
    "accent", "wood", "cushion", "comfort"
  ],
};

// Deterministic Pseudo-Random Generator (seeded)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Generate a deterministic 1536-dimensional unit vector for a token
function getWordVector(word, dim = 1536) {
  const seed = stringHash(word.toLowerCase());
  const rng = mulberry32(seed);
  const vec = new Float64Array(dim);
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    // Box-Muller transform for standard normal distribution
    const u1 = rng() || 0.0001;
    const u2 = rng();
    const val = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    vec[i] = val;
    norm += val * val;
  }
  norm = Math.sqrt(norm);
  for (let i = 0; i < dim; i++) {
    vec[i] /= norm;
  }
  return vec;
}

// Precompute concept cluster vectors
const CLUSTER_VECTORS = {};
for (const [clusterName, words] of Object.entries(CONCEPT_CLUSTERS)) {
  const clusterVec = new Float64Array(1536);
  for (const w of words) {
    const wv = getWordVector(w, 1536);
    for (let i = 0; i < 1536; i++) {
      clusterVec[i] += wv[i];
    }
  }
  // Normalize
  let norm = 0;
  for (let i = 0; i < 1536; i++) norm += clusterVec[i] * clusterVec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < 1536; i++) clusterVec[i] /= norm;
  CLUSTER_VECTORS[clusterName] = clusterVec;
}

/**
 * Generate a 1536-dimensional semantic embedding vector for any text
 */
export function generateSemanticVector(text, dim = 1536) {
  const tokens = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (tokens.length === 0) {
    // Return zero vector
    return Array.from({ length: dim }, () => 0);
  }

  const combined = new Float64Array(dim);

  // 1. Add word token vectors
  for (const token of tokens) {
    const wv = getWordVector(token, dim);
    for (let i = 0; i < dim; i++) {
      combined[i] += wv[i];
    }

    // 2. Add boost if token belongs to any concept cluster
    for (const [clusterName, words] of Object.entries(CONCEPT_CLUSTERS)) {
      if (words.includes(token) || token.includes(clusterName) || clusterName.includes(token)) {
        const cv = CLUSTER_VECTORS[clusterName];
        for (let i = 0; i < dim; i++) {
          combined[i] += cv[i] * 3.5; // Significant semantic cluster boost
        }
      }
    }
  }

  // Normalize final vector to unit length (L2 norm = 1.0)
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += combined[i] * combined[i];
  }
  norm = Math.sqrt(norm);
  if (norm === 0) norm = 1;

  const result = new Array(dim);
  for (let i = 0; i < dim; i++) {
    result[i] = Number((combined[i] / norm).toFixed(6));
  }

  return result;
}

