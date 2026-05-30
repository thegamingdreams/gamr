import { levelFromXp } from '../utils/storage.js';
export default function XPBar({ xp }) { const l = levelFromXp(xp); return <div className="xp"><div><strong>Level {l.level}</strong><span>{l.current}/{l.next} XP</span></div><div className="bar"><i style={{ width: `${l.percent}%` }} /></div></div>; }
