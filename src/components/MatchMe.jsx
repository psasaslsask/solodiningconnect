import React, { useMemo } from "react";
import diners from "../data/diners.json";
import { rankCandidates } from "../utils/matchUtils";

export default function MatchMe({ currentUserId = 1, currentUser, dinersList = diners }) {
  const pool = dinersList || [];
  const me = currentUser ?? pool.find((d) => d.id === currentUserId);

  const bestMatch = useMemo(() => {
    if (!me) return null;
    const ranked = rankCandidates(me, pool, 1);
    return ranked[0];
  }, [me, pool]);

  if (!bestMatch) return null;

  const { diner, recip, p_uv, p_vu } = bestMatch;

  const reasons = generateWhyMatch(me, diner, p_uv, p_vu);

  return (
    <div className="bg-white rounded-2xl p-6 shadow mt-6">
      <h2 className="text-xl font-semibold mb-2">Your Best Match</h2>

      <div className="flex justify-between items-center text-sm mb-4">
        <div>
          <p className="font-medium text-gray-800">{diner.name}</p>
          <p className="text-gray-500">{diner.location}</p>
        </div>

        <div className="text-gray-600 text-right">
          <p>Recip Score: {recip.toFixed(2)}</p>
          <p className="text-xs">
            you→{p_uv.toFixed(2)}, them→{p_vu.toFixed(2)}
          </p>
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2">Why You Match</h3>
      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
        {reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

// You must include the helper BELOW your component:
function generateWhyMatch(u, v, p_uv, p_vu) {
  const reasons = [];

  const sharedCuisine = u.cuisines.filter(c => v.cuisines.includes(c));
  if (sharedCuisine.length > 0)
    reasons.push(`You both enjoy **${sharedCuisine.join(", ")} cuisine**.`);

  const sharedAvail = u.availability.filter(a => v.availability.includes(a));
  if (sharedAvail.length > 0)
    reasons.push(`You both are free on **${sharedAvail.join(", ")}**.`);

  const sharedStyle = u.soloStyle.filter(s => v.soloStyle.includes(s));
  if (sharedStyle.length > 0)
    reasons.push(`You share a similar dining vibe: **${sharedStyle.join(", ")}**.`);

  if (u.location.split(",")[0] === v.location.split(",")[0])
    reasons.push(`You’re both based in **${u.location.split(",")[0]}**.`);

  if (u.budget === v.budget)
    reasons.push(`You have similar **budget preferences**.`);

  if (p_uv > 0.9 && p_vu > 0.9)
    reasons.push(`Strong mutual comfort in dining preferences.`);

  return reasons;
}
