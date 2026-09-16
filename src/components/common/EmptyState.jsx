export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-surface-400 dark:text-surface-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
