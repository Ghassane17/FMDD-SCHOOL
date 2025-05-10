
import React from 'react';

/**
 * ProgressBar Component
 * Visual indicator of course progress
 * 
 * @param {Object} props
 * @param {number} props.percent - Progress percentage (0-100)
 */
const ProgressBar = ({ percent }) => {
  // Choose color based on completion percentage
  const getProgressColor = () => {
    if (percent < 25) return 'bg-blue-400';
    if (percent < 50) return 'bg-cyan-400';
    if (percent < 75) return 'bg-emerald-400';
    return 'bg-green-400';
  };

  return (
    <div className="bg-gray-200 w-full rounded-full h-2">
      <div 
        className={`${getProgressColor()} h-2 rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default ProgressBar;
