/* CourseCard.jsx */
const CourseCard = ({ title, progress, lastAccessed, image, category }) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
    <img
      src={image || "https://via.placeholder.com/300x150"}
      alt={`${title} thumbnail`}
      className="w-full h-32 object-cover rounded-md mb-3"
    />
    <h4 className="text-md font-semibold text-gray-800 mb-2 truncate sm:text-lg">{title}</h4>
    <p className="text-xs text-gray-500 mb-2 sm:text-sm">Category: {category}</p>
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
      <div
        className="bg-indigo-600 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-xs text-gray-500 sm:text-sm">Progress: {progress}%</p>
    {lastAccessed && (
      <p className="text-xs text-gray-500 mt-1 sm:text-sm">Last Accessed: {lastAccessed}</p>
    )}
  </div>
);

export default CourseCard;