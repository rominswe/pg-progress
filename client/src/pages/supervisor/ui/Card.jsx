export default function Card({ children, className = '', hover = false }) {
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}
