import { Loader2 } from 'lucide-react';

export default function Loader({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
      {text && (
        <p className="text-sm text-surface-500 dark:text-surface-400">{text}</p>
      )}
    </div>
  );
}
