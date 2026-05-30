import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import Quiz from './components/Quiz.jsx';
import Result from './components/Result.jsx';
import Dashboard from './components/Dashboard.jsx';
import Tools from './components/Tools.jsx';
import Premium from './components/Premium.jsx';
import { loadState, saveState } from './utils/storage.js';

export default function App() {
  const [view, setView] = useState(location.hash.replace('#', '') || 'home');
  const [state, setState] = useState(loadState);
  useEffect(() => saveState(state), [state]);
  useEffect(() => { const onHash = () => setView(location.hash.replace('#', '') || 'home'); addEventListener('hashchange', onHash); return () => removeEventListener('hashchange', onHash); }, []);
  const navigate = (next) => { location.hash = next; setView(next); };
  const ctx = useMemo(() => ({ state, setState, navigate }), [state]);
  return <><Navbar view={view} navigate={navigate} lockedPath={state.lockedPath} /><main>{view === 'home' && <Home {...ctx} />}{view === 'quiz' && <Quiz {...ctx} />}{view === 'result' && <Result {...ctx} />}{view === 'dashboard' && <Dashboard {...ctx} />}{view === 'tools' && <Tools {...ctx} />}{view === 'premium' && <Premium />}</main></>;
}
