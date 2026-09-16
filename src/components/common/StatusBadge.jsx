export default function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    // Queue statuses
    WAITING: { label: 'Waiting', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    CALLED: { label: 'Called', style: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
    PROCESSING: { label: 'Processing', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    COMPLETED: { label: 'Completed', style: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
    CANCELLED: { label: 'Cancelled', style: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    // Slot statuses
    BOOKED: { label: 'Booked', style: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
    // Procurement statuses
    SLOT_CONFIRMED: { label: 'Slot Confirmed', style: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
    FARMER_ARRIVED: { label: 'Farmer Arrived', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    QUALITY_CHECK: { label: 'Quality Check', style: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
    WEIGHT_VERIFICATION: { label: 'Weight Verification', style: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
    ACCEPTED: { label: 'Accepted', style: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
    PAYMENT_PENDING: { label: 'Payment Pending', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    PAYMENT_COMPLETED: { label: 'Payment Completed', style: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
    // Payment statuses
    PENDING: { label: 'Pending', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    FAILED: { label: 'Failed', style: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    // Centre statuses
    OPEN: { label: 'Open', style: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' },
    CLOSED: { label: 'Closed', style: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300' },
    DELAYED: { label: 'Delayed', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    MAINTENANCE: { label: 'Maintenance', style: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300' },
  };

  const config = statusConfig[status] || { label: status, style: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.style} ${className}`}>
      {config.label}
    </span>
  );
}
