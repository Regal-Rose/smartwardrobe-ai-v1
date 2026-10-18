import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Leaf, Sparkles } from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

type Mode = 'login' | 'register';

export async function checkSession() {
  try {
    const response = await fetch(`${API}/api/v1/auth/me`, { credentials: 'include' });
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

export function LandingPage() {
  return <div className="landing-shell">
    <nav className="landing-nav"><Link to="/" className="brand-mark"><span className="brand-icon"><Leaf size={19}/></span> <span>smartwardrobe<span className="brand-dot">.</span></span></Link><div className="nav-links"><a href="#how-it-works">How it works</a><a href="#wardrobe-cultures">Your style, your culture</a></div><div className="nav-actions"><Link className="nav-login" to="/login">Log in</Link><Link className="button-dark" to="/register">Build my wardrobe <ArrowRight size={16}/></Link></div></nav>
    <main>
      <section className="landing-hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR CLOSET, REIMAGINED</div><h1>Wear what you own.<br/><em>Love what you wear.</em></h1><p className="hero-description">A thoughtful home for your wardrobe. Discover fresh combinations from the pieces you already own — from everyday denim to your favourite kurta.</p><div className="hero-actions"><Link className="button-dark button-large" to="/register">Create your wardrobe <ArrowRight size={17}/></Link><span className="micro-note"><Check size={14}/> Your style. Your rules.</span></div><div className="hero-proof"><div className="avatar-stack"><span>✦</span><span>✿</span><span>◈</span></div><span>Made for every closet, everywhere.</span></div></div>
      <div className="hero-art"><div className="art-frame"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85" alt="A thoughtfully styled fashion look"/><div className="art-label"><span className="label-kicker">THE DAILY EDIT</span><strong>Less wondering.<br/>More wearing.</strong></div><div className="floating-note"><span className="note-icon">✳</span><span><b>Outfit inspiration</b><small>From your own wardrobe</small></span></div></div><span className="art-caption">A little more intention, every day.</span></div></section>
      <section className="feature-strip" id="how-it-works"><div><span className="feature-number">01</span><h3>Know your closet</h3><p>Bring your pieces together in one considered space.</p></div><div><span className="feature-number">02</span><h3>Find new pairings</h3><p>Rediscover combinations you might have missed.</p></div><div><span className="feature-number">03</span><h3>Dress like yourself</h3><p>Build a personal style across seasons and occasions.</p></div></section>
      <section className="culture-section" id="wardrobe-cultures"><div><span className="eyebrow">ONE WARDROBE, MANY WORLDS</span><h2>Every culture has<br/><em>its own kind of style.</em></h2></div><p>From jeans and shirts to kurtas, salwar suits and dupattas — your wardrobe should feel like <i>you</i>. SmartWardrobe is being built for real people and real wardrobes around the world.</p></section>
      <footer className="landing-footer"><Link to="/" className="brand-mark"><span className="brand-icon"><Leaf size={16}/></span> smartwardrobe<span className="brand-dot">.</span></Link><span>Dress well. Waste less. Be yourself.</span><Link to="/register">Start your wardrobe <ArrowRight size={14}/></Link></footer>
    </main>
  </div>;
}

export function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === 'register';
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/api/v1/auth/${isRegister ? 'register' : 'login'}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isRegister ? { name, email, password } : { email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Something went wrong. Please try again.');
      navigate('/overview', { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not reach the server. Is the backend running?'); }
    finally { setBusy(false); }
  }
  return <div className="auth-shell"><div className="auth-aside"><Link to="/" className="brand-mark"><span className="brand-icon"><Leaf size={19}/></span> smartwardrobe<span className="brand-dot">.</span></Link><div className="auth-aside-copy"><span className="eyebrow">YOUR STYLE, IN ONE PLACE</span><h1>A wardrobe that<br/><em>gets you.</em></h1><p>Keep the pieces you love close, and let new outfit ideas find their way to you.</p></div><div className="auth-aside-bottom">“Style is a way to say who you are without having to speak.”</div></div><div className="auth-panel"><div className="auth-panel-top"><span>{isRegister ? 'NEW HERE?' : 'WELCOME BACK'}</span><Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create account'} <ArrowRight size={14}/></Link></div><div className="auth-form-wrap"><span className="eyebrow">{isRegister ? 'A FRESH START' : 'YOUR CLOSET AWAITS'}</span><h2>{isRegister ? 'Make it yours.' : 'Good to see you.'}</h2><p>{isRegister ? 'Create your account and start building a wardrobe that feels like you.' : 'Sign in to pick up where your style left off.'}</p><form onSubmit={submit} className="auth-form">{isRegister && <label>Your name<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?" required minLength={2}/></label>}<label>Email address<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} minLength={8} required/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>{error && <div role="alert" className="auth-error">{error}</div>}<button disabled={busy} className="button-dark auth-submit" type="submit">{busy ? 'Please wait…' : isRegister ? 'Create my account' : 'Log in to SmartWardrobe'} {!busy && <ArrowRight size={17}/>}</button></form><p className="auth-terms">By continuing, you agree to use SmartWardrobe responsibly. Your wardrobe is private to your account.</p></div><Link to="/" className="back-home">← Back to home</Link></div></div>;
}
