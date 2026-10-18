import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-sage-pale flex items-center justify-center mb-5 text-sage">
          {icon}
        </div>
      )}
      <h3 className="heading-editorial text-xl text-ink mb-2">{title}</h3>
      <p className="text-body max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
