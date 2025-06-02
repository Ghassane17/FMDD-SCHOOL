import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, CircularProgress, Typography, IconButton, Slider, Popper, Paper } from '@mui/material';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

const API_URL = 'http://localhost:8000';
const FALLBACK_POSTER = 'https://placehold.co/600x400?text=Video+Not+Available';

/**
 * VideoPlayer Component
 * Renders the course video with responsive styling and loading states
 * 
 * @param {Object} props
 * @param {string} props.url - URL of the video to play
 */
const VideoPlayer = ({ url, title }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const volumeButtonRef = useRef(null);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState(0.5);

    // Construct video URL properly
    const videoSrc = useCallback(() => {
        if (!url) {
            console.error('No video URL provided');
            return null;
        }

        console.log('Original video URL:', url);

        // If URL is already absolute, use it as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            console.log('Using absolute URL:', url);
            return url;
        }

        // Clean the path and construct the full URL
        const cleanPath = url.replace(/^\/+/, '').replace(/^storage\//, '');
        const fullUrl = `${API_URL}/storage/${cleanPath}`;
        console.log('Constructed video URL:', fullUrl);
        return fullUrl;
    }, [url]);

    // Handle video loading
    const handleVideoLoad = useCallback(() => {
        console.log('Video loaded successfully');
        setIsLoading(false);
        setError(null);
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    }, []);

    const handleVideoError = useCallback((e) => {
        console.error('Video load error:', e);
        console.error('Video element error:', e.target?.error);
        console.error('Video source:', videoRef.current?.currentSrc);
        console.error('Video network state:', videoRef.current?.networkState);
        console.error('Video ready state:', videoRef.current?.readyState);
        setIsLoading(false);
        setError('Failed to load video. Please try again later.');
    }, []);

    // Log video state changes
    useEffect(() => {
        if (videoRef.current) {
            const video = videoRef.current;
            
            const handleCanPlay = () => console.log('Video can play');
            const handleWaiting = () => console.log('Video is waiting for data');
            const handleStalled = () => console.log('Video playback stalled');
            const handleSuspend = () => console.log('Video loading suspended');
            const handleLoadStart = () => console.log('Video load started');
            const handleLoadedMetadata = () => console.log('Video metadata loaded');
            const handleLoadedData = () => console.log('Video data loaded');
            const handleProgress = () => console.log('Video loading progress');
            
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('waiting', handleWaiting);
            video.addEventListener('stalled', handleStalled);
            video.addEventListener('suspend', handleSuspend);
            video.addEventListener('loadstart', handleLoadStart);
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('loadeddata', handleLoadedData);
            video.addEventListener('progress', handleProgress);
            
            return () => {
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('waiting', handleWaiting);
                video.removeEventListener('stalled', handleStalled);
                video.removeEventListener('suspend', handleSuspend);
                video.removeEventListener('loadstart', handleLoadStart);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('loadeddata', handleLoadedData);
                video.removeEventListener('progress', handleProgress);
            };
        }
    }, []);

    // Handle video playback
    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    }, []);

    const handleSeek = useCallback((_, value) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value;
            setCurrentTime(value);
        }
    }, []);

    const handleVolumeChange = useCallback((_, newValue) => {
        if (videoRef.current) {
            videoRef.current.volume = newValue / 100;
            setVolume(newValue / 100);
        }
    }, []);

    // Format time in MM:SS
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'KeyM') {
                toggleMute();
            } else if (e.code === 'KeyF') {
                toggleFullscreen();
            } else if (e.code === 'ArrowUp') {
                e.preventDefault();
                if (videoRef.current) {
                    const newVolume = Math.min(1, volume + 0.1);
                    videoRef.current.volume = newVolume;
                    setVolume(newVolume);
                    setIsMuted(false);
                }
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                if (videoRef.current) {
                    const newVolume = Math.max(0, volume - 0.1);
                    videoRef.current.volume = newVolume;
                    setVolume(newVolume);
                    setIsMuted(newVolume === 0);
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [togglePlay, toggleMute, toggleFullscreen, volume]);

    // Add focus handling for the video container
    const handleContainerFocus = useCallback(() => {
        containerRef.current?.focus();
    }, []);

    if (!url) {
        return (
            <Box className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Typography variant="h6" color="textSecondary">
                    No video available
                </Typography>
            </Box>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <CircularProgress sx={{ color: 'white' }} />
                </div>
            )}
            
            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <p className="text-sm text-gray-400">Please check your connection and try again.</p>
                    </div>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        poster={FALLBACK_POSTER}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleVideoLoad}
                        onError={handleVideoError}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadedData={() => setIsLoading(false)}
                        onProgress={handleTimeUpdate}
                    >
                        <source src={videoSrc()} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Play Button Overlay */}
                    {!isPlaying && !isLoading && !error && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
                            onClick={togglePlay}
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                                <Play className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div 
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                            showVolumeSlider ? 'opacity-100' : 'opacity-0'
                        }`}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        {/* Progress Bar */}
                        <div className="relative mb-2">
                            <Slider
                                value={currentTime}
                                max={duration}
                                onChange={handleSeek}
                                sx={{
                                    color: 'white',
                                    height: 4,
                                    '& .MuiSlider-track': {
                                        border: 'none',
                                    },
                                    '& .MuiSlider-thumb': {
                                        width: 12,
                                        height: 12,
                                        backgroundColor: 'white',
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                                        },
                                    },
                                    '& .MuiSlider-rail': {
                                        opacity: 0.5,
                                        backgroundColor: 'white',
                                    },
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconButton 
                                    onClick={togglePlay}
                                    sx={{ color: 'white' }}
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </IconButton>

                                <IconButton 
                                    onClick={toggleMute}
                                    sx={{ color: 'white' }}
                                >
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </IconButton>

                                {/* Volume Slider */}
                                <div 
                                    className="relative"
                                    onMouseEnter={() => setShowVolumeSlider(true)}
                                    onMouseLeave={() => setShowVolumeSlider(false)}
                                >
                                    <Popper
                                        open={showVolumeSlider}
                                        anchorEl={volumeButtonRef.current}
                                        placement="top"
                                        transition
                                    >
                                        <div className="bg-black/90 p-2 rounded-lg">
                                            <Slider
                                                orientation="vertical"
                                                value={isMuted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                sx={{
                                                    height: 100,
                                                    color: 'white',
                                                    '& .MuiSlider-track': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiSlider-thumb': {
                                                        width: 12,
                                                        height: 12,
                                                        backgroundColor: 'white',
                                                        '&:hover, &.Mui-focusVisible': {
                                                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                                                        },
                                                    },
                                                    '& .MuiSlider-rail': {
                                                        opacity: 0.5,
                                                        backgroundColor: 'white',
                                                    },
                                                }}
                                            />
                                        </div>
                                    </Popper>
                                </div>

                                <div className="text-white text-sm font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <IconButton 
                                    onClick={toggleFullscreen}
                                    sx={{ color: 'white' }}
                                >
                                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                                </IconButton>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoPlayer;
