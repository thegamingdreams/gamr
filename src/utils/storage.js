const PREFIX = 'youngfounder:';

export const defaultState = {
  quizAnswers: {}, recommendedPaths: [], lockedPath: null, xp: 120, achievements: ['First Idea'],
  income: [], expenses: [], clients: [], leads: [], goals: [], notes: '', chatHistory: [], generatedTools: {}
};

export function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(`${PREFIX}state`) || '{}') }; }
  catch { return defaultState; }
}

export function saveState(state) {
  localStorage.setItem(`${PREFIX}state`, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(`${PREFIX}state`);
}

export function levelFromXp(xp = 0) {
  const level = Math.floor(xp / 250) + 1;
  return { level, current: xp % 250, next: 250, percent: Math.round(((xp % 250) / 250) * 100) };
}
