import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminDashboard } from './sections/AdminDashboard.tsx'
import { LettersOfLove } from './sections/LettersOfLove.tsx'

const pathname = window.location.pathname;
const isAdmin = pathname === '/admin' || pathname === '/admin/';
const isLetters = pathname === '/letters-of-love' || pathname === '/letters-of-love/';

function Root() {
  if (isAdmin) return <AdminDashboard />;
  if (isLetters) return <LettersOfLove />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
