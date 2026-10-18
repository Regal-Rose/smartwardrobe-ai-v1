import { useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';

const PAGE_META: Record<string, {eyebrow:string; title:string}> = {
  '/overview': { eyebrow: 'YOUR PERSONAL STYLE SPACE', title: 'Today' },
  '/wardrobe': { eyebrow: 'EVERY PIECE, IN ITS PLACE', title: 'My wardrobe' },
  '/discover': { eyebrow: 'A LITTLE INSPIRATION', title: 'Discover' },
  '/saved': { eyebrow: 'THE LOOKS YOU LOVE', title: 'Saved looks' },
  '/preferences': { eyebrow: 'MAKE IT FEEL LIKE YOU', title: 'My style' },
  '/settings': { eyebrow: 'YOUR ACCOUNT', title: 'Settings' },
};
interface HeaderProps { onMenuToggle: () => void; }
export function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { eyebrow: 'SMARTWARDROBE', title: 'Your space' };
  return <header className="sw-topbar sticky top-0 z-30">
    <div className="flex items-center justify-between min-h-[78px] px-4 sm:px-7 lg:px-10">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuToggle} className="lg:hidden p-2 -ml-2" aria-label="Open navigation menu"><Menu size={20}/></button>
        <div><p className="sw-top-eyebrow hidden sm:block">{meta.eyebrow}</p><h2 className="heading-editorial text-xl sm:text-2xl">{meta.title}</h2></div>
      </div>
      <div className="flex items-center gap-3">
        <span className="sw-top-note hidden md:inline">Made for your real-life wardrobe</span>
        <span className="sw-top-sun" aria-hidden="true">✳</span>
      </div>
    </div>
  </header>;
}
