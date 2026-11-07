/**
 * Semantic Concept & Synonym Map
 * Allows conceptual search matching (e.g. "Shoes" -> "Sneakers", "Audio" -> "Headphones")
 * even when OpenAI API key is not present or offline.
 */
const CONCEPT_SYNONYMS = {
  shoes: ["sneaker", "sneakers", "footwear", "running", "walking", "shoe", "trainers", "boots"],
  shoe: ["sneaker", "sneakers", "footwear", "running", "walking", "shoes", "trainers"],
  sneakers: ["shoes", "shoe", "footwear", "running", "walking", "sneaker", "trainers"],
  sneaker: ["shoes", "shoe", "footwear", "running", "walking", "sneakers", "trainers"],
  footwear: ["shoes", "sneakers", "sneaker", "running shoes", "walking shoes"],
  
  audio: ["headphones", "earbuds", "speaker", "sound", "music", "audio", "studio"],
  sound: ["headphones", "earbuds", "speaker", "audio", "music"],
  music: ["headphones", "earbuds", "speaker", "sound", "audio"],
  headphones: ["earbuds", "speaker", "sound", "audio", "music", "headphone"],
  headphone: ["headphones", "earbuds", "speaker", "sound", "audio"],
  earbuds: ["headphones", "speaker", "sound", "audio", "music"],
  speaker: ["sound", "audio", "music", "bluetooth", "speaker", "loudspeaker"],

  workout: ["yoga", "mat", "dumbbell", "training", "exercise", "fitness", "gym", "sports"],
  gym: ["workout", "yoga", "mat", "dumbbell", "training", "exercise", "fitness", "sports"],
  fitness: ["workout", "gym", "yoga", "mat", "dumbbell", "training", "exercise", "sports"],
  exercise: ["workout", "gym", "fitness", "yoga", "mat", "dumbbell", "training", "sports"],
  dumbbell: ["weights", "workout", "fitness", "gym", "exercise"],
  yoga: ["mat", "workout", "fitness", "exercise", "stretching"],

  coffee: ["coffee maker", "espresso", "mug", "kitchen", "brew"],
  tea: ["kettle", "mug", "cup", "kitchen"],

  watch: ["wrist", "time", "analog", "accessories", "leather watch"],
  time: ["watch", "clock", "wrist"],

  clothes: ["jacket", "shirt", "hoodie", "t-shirt", "clothing", "apparel", "wear"],
  clothing: ["jacket", "shirt", "hoodie", "t-shirt", "clothes", "apparel"],
  shirt: ["t-shirt", "clothing", "clothes", "apparel"],
  jacket: ["clothing", "clothes", "outerwear", "apparel"],

  computer: ["keyboard", "mouse", "electronics", "mechanical keyboard"],
  gaming: ["keyboard", "mouse", "headset", "electronics"],
  keyboard: ["mechanical keyboard", "typing", "electronics", "gaming"],

  beauty: ["skincare", "perfume", "fragrance", "cosmetics"],
  perfume: ["fragrance", "scent", "beauty", "cologne"],
  skincare: ["cleanser", "moisturizer", "beauty", "cream"],

  notebook: ["stationery", "journal", "pen", "writing", "paper", "book"],
  pen: ["stationery", "writing", "notebook", "ballpoint"],
};

/**
 * Score a product against a search query using semantic concept expansion
 */
export function scoreProductSemantically(product, query) {
  const q = query.toLowerCase().trim();
  const title = (product.title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  // 1. Direct Exact Substring Matches
  if (title === q) return 1.0;
  if (title.includes(q)) return 0.95;
  if (category === q) return 0.92;
  if (category.includes(q)) return 0.88;
  if (desc.includes(q)) return 0.82;

  // 2. Semantic Synonyms / Concepts Matching
  const queryWords = q.split(/\s+/).filter(Boolean);
  let bestScore = 0;

  for (const word of queryWords) {
    const synonyms = CONCEPT_SYNONYMS[word] || [];
    for (const syn of synonyms) {
      if (title.includes(syn)) {
        bestScore = Math.max(bestScore, 0.90);
      } else if (category.includes(syn)) {
        bestScore = Math.max(bestScore, 0.85);
      } else if (desc.includes(syn)) {
        bestScore = Math.max(bestScore, 0.78);
      }
    }
  }

  // 3. Reverse Check: check if any word in title maps to query
  const titleWords = title.split(/\s+/).filter(Boolean);
  for (const word of titleWords) {
    const syns = CONCEPT_SYNONYMS[word] || [];
    if (syns.includes(q)) {
      bestScore = Math.max(bestScore, 0.90);
    }
  }

  return bestScore;
}

