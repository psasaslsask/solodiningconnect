// --- Basic helpers ---
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

const jaccard = (a = [], b = []) => {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...a, ...b]).size || 1;
  return inter / uni;
};

const hasOverlap = (a = [], b = []) => {
  const A = new Set(a);
  return b.some(x => A.has(x)) ? 1 : 0;
};

const textBag = (arr = []) =>
  arr.map(s => s.toLowerCase().trim()).filter(Boolean);

const cosineFromSets = (a = [], b = []) => {
  // cosine on binary bags (works well enough for tiny data)
  const A = new Set(textBag(a)), B = new Set(textBag(b));
  const inter = [...A].filter(x => B.has(x)).length;
  const denom = Math.sqrt(A.size || 1) * Math.sqrt(B.size || 1);
  return inter / denom;
};

// --- Distance bucket (city match for v1) ---
const cityMatch = (locA = "", locB = "") => {
  const cityA = locA.split(",")[0].trim().toLowerCase();
  const cityB = locB.split(",")[0].trim().toLowerCase();
  return cityA && cityA === cityB ? 1 : 0; // same city boosts
};

// --- One-sided like probability P(u -> v) ---
export function likeProbability(u, v) {
  // Features
  const fCuisine = jaccard(u.cuisines, v.cuisines);               // 0..1
  const fAvail   = hasOverlap(u.availability, v.availability);    // 0/1
  const fStyle   = cosineFromSets(u.soloStyle, v.soloStyle);      // 0..1
  const fCity    = cityMatch(u.location, v.location);             // 0/1
  const fBudget  = u.budget === v.budget ? 1 : 0;                 // 0/1
  const fRep     = (v.rating || 7.5) / 10;                        // 0..1 (proxy)

  // Weights (tweak freely)
  const w = { cuisine: 1.2, avail: 1.0, style: 1.3, city: 0.8, budget: 0.5, rep: 0.9, bias: -0.5 };
  const z =
    w.bias +
    w.cuisine * fCuisine +
    w.avail   * fAvail +
    w.style   * fStyle +
    w.city    * fCity +
    w.budget  * fBudget +
    w.rep     * fRep;

  return sigmoid(z); // 0..1
}

// Reciprocal score = P(u->v) * P(v->u)
export function reciprocalScore(u, v) {
  return likeProbability(u, v) * likeProbability(v, u);
}

// Rank candidates for user u (exclude u)
export function rankCandidates(u, pool, k = 5) {
  const candidates = pool.filter(p => p.id !== u.id);
  const scored = candidates.map(v => ({
    diner: v,
    p_uv: likeProbability(u, v),
    p_vu: likeProbability(v, u),
    recip: reciprocalScore(u, v),
  }));
  scored.sort((a, b) => b.recip - a.recip);
  return scored.slice(0, k);
}

// --- Tiny Gale–Shapley for a daily "Most Compatible" pick ---
// Build preference lists from reciprocal scores
export function dailyMostCompatible(setA, setB) {
  const prefA = new Map();
  setA.forEach(a => {
    const ranked = [...setB]
      .filter(b => b.id !== a.id)
      .map(b => ({ b, s: reciprocalScore(a, b) }))
      .sort((x, y) => y.s - x.s)
      .map(x => x.b.id);
    prefA.set(a.id, ranked);
  });
  const prefB = new Map();
  setB.forEach(b => {
    const ranked = [...setA]
      .filter(a => a.id !== b.id)
      .map(a => ({ a, s: reciprocalScore(a, b) }))
      .sort((x, y) => y.s - x.s)
      .map(x => x.a.id);
    prefB.set(b.id, ranked);
  });

  // Gale–Shapley (A-proposing)
  const nextIdx = new Map(setA.map(a => [a.id, 0]));
  const engagedTo = new Map(); // bId -> aId
  const freeA = [...setA.map(a => a.id)];

  while (freeA.length) {
    const aId = freeA.shift();
    const aList = prefA.get(aId) || [];
    const i = nextIdx.get(aId) ?? 0;
    if (i >= aList.length) continue;
    const bId = aList[i];
    nextIdx.set(aId, i + 1);

    const currentA = engagedTo.get(bId);
    if (!currentA) {
      engagedTo.set(bId, aId);
    } else {
      const bPrefs = prefB.get(bId) || [];
      const prefersNew = bPrefs.indexOf(aId) < bPrefs.indexOf(currentA);
      if (prefersNew) engagedTo.set(bId, aId);
      else freeA.push(aId); // rejected, try next
    }
  }

  // Return pairs as [{aId,bId}]
  return [...engagedTo.entries()].map(([bId, aId]) => ({ aId, bId }));
}
