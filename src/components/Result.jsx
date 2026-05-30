import Panel from './Panel.jsx';
import { rankBusinessPaths } from '../utils/ranking.js';
export default function Result({ state, setState, navigate }) {
  const results = state.recommendedPaths?.length ? state.recommendedPaths : rankBusinessPaths(state.quizAnswers, 5);
  const lock = (path) => { setState({ ...state, lockedPath: path, xp: state.xp + 100, achievements: Array.from(new Set([...state.achievements, 'Path Locked'])) }); navigate('dashboard'); };
  return <div><Panel title="Your Top 5 Business Matches" eyebrow="Database-ranked, AI-explainable"><p>The actual business comes from the YoungFounder database, not random AI invention. Lock one to focus your full OS.</p></Panel><div className="cards">{results.map((path, i) => <Panel key={path.id} className="path-card" title={`${i + 1}. ${path.title}`} eyebrow={`${path.matchPercent}% match • ${path.category} • ${path.mode}`}><p>{path.description}</p><div className="chips"><span>{path.incomePotential}</span><span>${path.startupCost} startup</span><span>{path.difficulty}</span><span>{path.riskLevel} risk</span></div><h4>Why it matches</h4><ul>{(path.reasons || []).map(r => <li key={r}>{r}</li>)}</ul><button className="primary" onClick={() => lock(path)}>Lock This Path</button></Panel>)}</div></div>;
}
