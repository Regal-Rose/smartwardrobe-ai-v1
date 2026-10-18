interface BadgeProps {
  children: string;
  variant?: 'default' | 'sage' | 'warm' | 'muted';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-ivory-warm text-ink-light',
  sage: 'bg-sage-pale text-sage-deep',
  warm: 'bg-warning-light text-warning',
  muted: 'bg-surface-hover text-ink-muted',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}
      `}
    >
      {children}
    </span>
  );
}
