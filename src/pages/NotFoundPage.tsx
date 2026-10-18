import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <h1 className="heading-editorial text-6xl text-ink mb-2">404</h1>
      <p className="text-body text-lg mb-6">
        This page doesn't exist in your wardrobe.
      </p>
      <Link to="/overview">
        <Button variant="secondary">
          <ArrowLeft size={16} />
          Back to Overview
        </Button>
      </Link>
    </div>
  );
}
