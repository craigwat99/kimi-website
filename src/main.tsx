import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminDashboard } from './sections/AdminDashboard.tsx'
import { DeliveryDashboard } from './sections/DeliveryDashboard.tsx'
import { LettersOfLove } from './sections/LettersOfLove.tsx'
import { LawReformQuiz } from './sections/LawReformQuiz.tsx'
import { RememberThem } from './sections/RememberThem.tsx'
import { ProgrammeOrder } from './sections/ProgrammeOrder.tsx'
import { EventsPage } from './sections/EventsPage.tsx'
import { CommemorativeProgramme } from './sections/CommemorativeProgramme.tsx'

const pathname = window.location.pathname;
const isAdmin = pathname === '/admin' || pathname === '/admin/';
const isDelivery = pathname === '/delivery' || pathname === '/delivery/';
const isLettersOfLove = pathname === '/letters-of-love' || pathname === '/letters-of-love/';
const isQuiz = pathname === '/quiz' || pathname === '/quiz/';
const isRememberThem = pathname === '/remember-them' || pathname === '/remember-them/';
const isProgrammeOrder = pathname === '/programme-order' || pathname === '/programme-order/';
const isEvents = pathname === '/events' || pathname === '/events/';
const isProgramme = pathname === '/programme' || pathname === '/programme/';

function Root() {
  if (isAdmin) return <AdminDashboard />;
  if (isDelivery) return <DeliveryDashboard />;
  if (isLettersOfLove) return <LettersOfLove />;
  if (isQuiz) return <LawReformQuiz />;
  if (isRememberThem) return <RememberThem />;
  if (isProgrammeOrder) return <ProgrammeOrder />;
  if (isEvents) return <EventsPage />;
  if (isProgramme) return <CommemorativeProgramme />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
