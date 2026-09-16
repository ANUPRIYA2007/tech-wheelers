export default function Card({ children, className = '', hover = true, padding = true, ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 
        shadow-card transition-all duration-200
        ${hover ? 'hover:shadow-card-hover' : ''}
        ${padding ? 'p-5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
