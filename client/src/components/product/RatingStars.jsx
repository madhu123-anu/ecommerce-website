import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

export default function RatingStars({
  rating = 0,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  showCount = false,
  count = 0,
  className = '',
}) {
  const [hovered, setHovered] = useState(0);

  const displayRating = interactive ? (hovered || rating) : rating;

  const getStarFill = (starIndex) => {
    const value = displayRating;
    if (value >= starIndex) return 'full';
    if (value >= starIndex - 0.5) return 'half';
    return 'empty';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, i) => {
          const starIndex = i + 1;
          const fill = getStarFill(starIndex);

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHovered(starIndex)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => onChange && onChange(starIndex)}
                className={`transition-transform duration-100 hover:scale-110 ${
                  fill !== 'empty' ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                }`}
                style={{ fontSize: size }}
                aria-label={`Rate ${starIndex} stars`}
              >
                <FiStar
                  size={size}
                  className={fill !== 'empty' ? 'fill-current' : ''}
                />
              </button>
            );
          }

          return (
            <span
              key={i}
              className={`${
                fill === 'full'
                  ? 'text-amber-400'
                  : fill === 'half'
                  ? 'text-amber-300'
                  : 'text-slate-200 dark:text-slate-600'
              }`}
            >
              <FiStar
                size={size}
                className={fill === 'full' ? 'fill-current' : fill === 'half' ? 'fill-current opacity-60' : ''}
              />
            </span>
          );
        })}
      </div>

      {showCount && (
        <div className="flex items-center gap-1 ml-1">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-slate-400">({count.toLocaleString()})</span>
        </div>
      )}
    </div>
  );
}
