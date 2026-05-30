import { businessPaths } from '../data/businessPaths.js';

const normalize = (value) => String(value || '').toLowerCase();
const asArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const budgetNumber = (budget) => Number(String(budget || '0').replace(/[^0-9]/g, '')) || 0;

function includesAny(text, values) {
  const haystack = normalize(text);
  return asArray(values).some((value) => haystack.includes(normalize(value)));
}

export function scoreBusinessPath(path, answers = {}) {
  let score = 45;
  const reasons = [];
  const budget = budgetNumber(answers.budget);
  const weeklyTime = Number(answers.weeklyTime || 5);

  if (!answers.mode || answers.mode === 'any' || path.mode === answers.mode) { score += 12; reasons.push(`Fits your ${answers.mode || 'flexible'} work preference.`); }
  if (path.startupCost <= budget) { score += 12; reasons.push('Fits your starting budget.'); } else score -= Math.min(14, (path.startupCost - budget) / 10);
  if (includesAny(path.requiredSkills.join(' '), answers.skills)) { score += 12; reasons.push('Uses skills you already have.'); }
  if (includesAny(path.category + ' ' + path.workType, answers.workType || answers.interests)) { score += 10; reasons.push('Matches your preferred work type.'); }
  if (includesAny(path.description + ' ' + path.category, answers.interests)) score += 8;
  if (answers.personality && includesAny(path.recommendedPersonality.join(' '), answers.personality)) score += 8;
  if (answers.confidence === 'low' && path.confidenceNeeded === 'high') score -= 12;
  if (answers.confidence === 'high' && path.confidenceNeeded !== 'low') score += 7;
  if (answers.sellingComfort === 'low' && path.sellingIntensity === 'high') score -= 10;
  if (answers.riskTolerance === 'low' && path.riskLevel === 'high') score -= 15;
  if (answers.riskTolerance === 'high' && path.riskLevel !== 'low') score += 5;
  if (path.transportationNeeded && answers.transportation === 'no') score -= 18;
  if (answers.camera === 'no' && /video|ugc|tiktok|photography/i.test(path.title + path.description)) score -= 8;
  if (weeklyTime >= 8 && path.difficulty !== 'easy') score += 5;
  if (weeklyTime <= 3 && path.difficulty === 'hard') score -= 8;
  if (includesAny(path.toolsNeeded.join(' '), answers.resources)) score += 7;
  if (includesAny(path.avoidTags.join(' ') + ' ' + path.description, answers.avoid)) score -= 12;

  const bounded = Math.max(1, Math.min(99, Math.round(score)));
  return { ...path, score: bounded, matchPercent: bounded, reasons: reasons.slice(0, 4) };
}

export function rankBusinessPaths(answers = {}, limit = 5, paths = businessPaths) {
  return paths
    .map((path) => scoreBusinessPath(path, answers))
    .sort((a, b) => b.score - a.score || a.startupCost - b.startupCost)
    .slice(0, limit);
}
