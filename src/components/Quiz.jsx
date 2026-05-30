import { useState } from 'react';
import Panel from './Panel.jsx';
import { rankBusinessPaths } from '../utils/ranking.js';

const questions = [
  ['age','Age','number','15'], ['goal','Main goal','select',['Make money soon','Build a long-term skill','Help my community','Create content','Learn sales']],
  ['personality','Personality','select',['creative','analytical','outgoing','patient','responsible','energetic']], ['confidence','Confidence talking to strangers','select',['low','medium','high']],
  ['skills','Current skills','text','design, math, sports, writing, coding...'], ['resources','Tools/resources available','text','phone, laptop, Canva, mower, camera...'],
  ['budget','Starting budget','number','50'], ['weeklyTime','Weekly hours','number','6'], ['mode','Online/local preference','select',['online','local','hybrid','any']],
  ['riskTolerance','Risk tolerance','select',['low','medium','high']], ['workStyle','Work style','select',['solo','with people','structured','flexible']],
  ['interests','Interests','text','pets, games, fashion, fitness, tech...'], ['sellingComfort','Selling comfort','select',['low','medium','high']],
  ['avoid','Things to avoid','text','inventory, strangers, on camera...'], ['transportation','Transportation?','select',['yes','no']],
  ['camera','Okay being on camera?','select',['yes','no']], ['workType','Preferred work type','select',['physical','creative','tech','sales','educational','service']]
];

export default function Quiz({ state, setState, navigate }) {
  const [answers, setAnswers] = useState(state.quizAnswers || {});
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setAnswers({ ...answers, [key]: value });
  async function submit() {
    setLoading(true);
    let recommendations = rankBusinessPaths(answers, 5);
    try {
      const res = await fetch('http://localhost:5050/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
      if (res.ok) recommendations = (await res.json()).recommendations || recommendations;
    } catch {}
    setState({ ...state, quizAnswers: answers, recommendedPaths: recommendations, xp: state.xp + 50, achievements: Array.from(new Set([...state.achievements, 'Quiz Complete'])) });
    setLoading(false); navigate('result');
  }
  return <Panel title="Founder Fit Quiz" eyebrow="17 signals"><div className="quiz-grid">{questions.map(([key,label,type,opts]) => <label key={key}>{label}{type === 'select' ? <select value={answers[key] || ''} onChange={e => update(key, e.target.value)}><option value="">Choose...</option>{opts.map(o => <option key={o}>{o}</option>)}</select> : <input type={type} placeholder={opts} value={answers[key] || ''} onChange={e => update(key, e.target.value)} />}</label>)}</div><button className="primary wide" disabled={loading} onClick={submit}>{loading ? 'Ranking 180 paths...' : 'Get Top 5 Matches'}</button></Panel>;
}
