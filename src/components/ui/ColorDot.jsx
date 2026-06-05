export default function ColorDot({ color, size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex-shrink-0`}
      style={{ backgroundColor: color || '#6B7280' }}
    />
  );
}
