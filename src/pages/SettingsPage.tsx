import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Check, Moon, Sun, Monitor } from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type AppearanceMode = 'light' | 'dark' | 'system';

export function SettingsPage() {
  const { preferencesRepo, dataMode } = useServices();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [appearance, setAppearance] = useState<AppearanceMode>('light');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    preferencesRepo.get().then((p) => {
      setDisplayName(p.displayName);
      setLoading(false);
    });
  }, [preferencesRepo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await preferencesRepo.update({ displayName: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="skeleton h-10 w-40 rounded-lg" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="heading-editorial-lg text-ink">Settings</h1>
        <p className="text-body mt-1">Manage your profile and application preferences.</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSubmit}>
        <section className="bg-surface rounded-xl border border-border-light p-5 space-y-4">
          <h2 className="text-sm font-semibold text-ink">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-sage-pale flex items-center justify-center text-sage-deep text-xl font-semibold">
              {displayName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                id="settings-display-name"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving} size="md">
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? 'Saved!' : 'Update Profile'}
            </Button>
            {saved && (
              <span className="text-sm text-success font-medium">Profile updated.</span>
            )}
          </div>
        </section>
      </form>

      {/* Appearance */}
      <section className="bg-surface rounded-xl border border-border-light p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Appearance</h2>
        <p className="text-xs text-ink-muted">
          Dark mode is planned for a future release. Currently using light theme.
        </p>
        <div className="flex gap-2">
          {[
            { mode: 'light' as const, icon: Sun, label: 'Light' },
            { mode: 'dark' as const, icon: Moon, label: 'Dark' },
            { mode: 'system' as const, icon: Monitor, label: 'System' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAppearance(mode)}
              disabled={mode !== 'light'}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
                ${
                  appearance === mode
                    ? 'bg-sage-pale text-sage-deep border-sage'
                    : 'bg-surface text-ink-muted border-border hover:border-border-strong disabled:opacity-40 disabled:cursor-not-allowed'
                }
              `}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Data Mode */}
      <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">Data Source</h2>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              dataMode === 'mock'
                ? 'bg-warning-light text-warning'
                : 'bg-success-light text-success'
            }`}
          >
            {dataMode === 'mock' ? 'Demo Mode' : 'API Connected'}
          </span>
          <span className="text-xs text-ink-muted">
            {dataMode === 'mock'
              ? 'Using local demo data. Set VITE_DATA_MODE=http to connect to the backend.'
              : 'Connected to the SmartWardrobe API.'}
          </span>
        </div>
      </section>

      {/* Account */}
      <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">Account</h2>
        <p className="text-xs text-ink-muted">Sign out of this account on this browser.</p>
        <Button type="button" variant="secondary" onClick={async () => {
          try { await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' }); }
          finally { navigate('/login', { replace: true }); }
        }}>Log out</Button>
      </section>

      {/* About */}
      <section className="bg-surface rounded-xl border border-border-light p-5 space-y-2">
        <h2 className="text-sm font-semibold text-ink">About</h2>
        <p className="text-xs text-ink-muted">
          SmartWardrobe AI — Frontend MVP
        </p>
        <p className="text-xs text-ink-faint">
          Organise your clothing, discover outfit combinations, and curate your personal style.
        </p>
      </section>
    </div>
  );
}
