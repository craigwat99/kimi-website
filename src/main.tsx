import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminDashboard } from './sections/AdminDashboard.tsx'
import { LettersOfLove } from './sections/LettersOfLove.tsx'
import { LawReformQuiz } from './sections/LawReformQuiz.tsx'
import { RememberThem } from './sections/RememberThem.tsx'

const pathname = window.location.pathname;
const isAdmin = pathname === '/admin' || pathname === '/admin/';
const isLettersOfLove = pathname === '/letters-of-love' || pathname === '/letters-of-love/';
const isQuiz = pathname === '/quiz' || pathname === '/quiz/';
const isRememberThem = pathname === '/remember-them' || pathname === '/remember-them/';

function Root() {
  if (isAdmin) return <AdminDashboard />;
  if (isLettersOfLove) return <LettersOfLove />;
  if (isQuiz) return <LawReformQuiz />;
  if (isRememberThem) return <RememberThem />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
