export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md',
    outline:
      'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
