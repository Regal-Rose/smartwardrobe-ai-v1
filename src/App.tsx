import { useEffect, useState, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { WardrobePage } from './pages/WardrobePage';
import { DiscoverOutfitsPage } from './pages/DiscoverOutfitsPage';
import { SavedOutfitsPage } from './pages/SavedOutfitsPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthPage, LandingPage, checkSession } from './auth/AuthPages';

function ProtectedArea({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'guest'>('checking');
  const location = useLocation();
  useEffect(() => { let active = true; checkSession().then(user => { if (active) setStatus(user ? 'authenticated' : 'guest'); }); return () => { active = false; }; }, [location.pathname]);
  if (status === 'checking') return <div className="auth-loading"><span className="brand-icon">✳</span><p>Opening your wardrobe…</p></div>;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
  return <>{children}</>;
}

export function App() {
  return <Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/" element={<ProtectedArea><AppLayout><OverviewPage/></AppLayout></ProtectedArea>} />
    <Route path="/overview" element={<ProtectedArea><AppLayout><OverviewPage/></AppLayout></ProtectedArea>} />
    <Route path="/wardrobe" element={<ProtectedArea><AppLayout><WardrobePage/></AppLayout></ProtectedArea>} />
    <Route path="/discover" element={<ProtectedArea><AppLayout><DiscoverOutfitsPage/></AppLayout></ProtectedArea>} />
    <Route path="/saved" element={<ProtectedArea><AppLayout><SavedOutfitsPage/></AppLayout></ProtectedArea>} />
    <Route path="/preferences" element={<ProtectedArea><AppLayout><PreferencesPage/></AppLayout></ProtectedArea>} />
    <Route path="/settings" element={<ProtectedArea><AppLayout><SettingsPage/></AppLayout></ProtectedArea>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
