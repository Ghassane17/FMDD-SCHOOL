
import React from 'react';

/**
 * VideoPlayer Component
 * Renders the course video with responsive styling
 * 
 * @param {Object} props
 * @param {string} props.videoUrl - URL of the video to play
 */
const VideoPlayer = ({ videoUrl }) => {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* In a real implementation, you might use a library like react-player */}
      <video 
        className="w-full h-full object-cover"
        controls
        poster="/placeholder.svg" // Placeholder image
      >
        <source src={videoUrl} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture de vidéos.
      </video>
    </div>
  );
};

export default VideoPlayer;
