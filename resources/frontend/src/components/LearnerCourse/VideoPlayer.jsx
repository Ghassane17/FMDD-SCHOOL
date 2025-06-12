import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, CircularProgress, Typography, IconButton, Slider, Popper, Paper } from '@mui/material';
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Maximize, 
    Minimize,
    SkipBack,
    SkipForward,
    Settings,
    Clock,
    RotateCcw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;
const FALLBACK_POSTER = 'https://placehold.co/600x400?text=Video+Not+Available';
const SKIP_DURATION = 10; // seconds to skip forward/backward

/**
 * VideoPlayer Component
 * Enhanced video player with better controls and user experience
 * 
 * @param {Object} props
 * @param {string} props.url - URL of the video to play
 * @param {string} props.title - Optional title of the video
 */
const VideoPlayer = ({ url, title }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [videoPoster, setVideoPoster] = useState(null);
    const [showControls, setShowControls] = useState(true);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);

    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const volumeButtonRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Capture a frame from the video to use as poster
    const captureVideoFrame = useCallback(() => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setVideoPoster(canvas.toDataURL('image/jpeg'));
        }
    }, []);

    // Construct video URL properly
    const videoSrc = useCallback(() => {
        if (!url) {
            console.error('No video URL provided');
            return null;
        }

        // If URL is already absolute, use it as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Clean the path and construct the full URL
        const cleanPath = url.replace(/^\/+/, '').replace(/^storage\//, '');
        return `${API_URL}/storage/${cleanPath}`;
    }, [url]);

    // Handle video loading
    const handleVideoLoad = useCallback(() => {
        setIsLoading(false);
        setError(null);
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            captureVideoFrame();
        }
    }, [captureVideoFrame]);

    const handleVideoError = useCallback((e) => {
        console.error('Video load error:', e);
        setIsLoading(false);
        setError('Failed to load video. Please try again later.');
    }, []);

    // Handle buffering
    const handleProgress = useCallback(() => {
        if (videoRef.current) {
            const buffered = videoRef.current.buffered;
            if (buffered.length > 0) {
                setBuffered(buffered.end(buffered.length - 1));
            }
        }
    }, []);

    const handleWaiting = useCallback(() => {
        setIsBuffering(true);
    }, []);

    const handleCanPlay = useCallback(() => {
        setIsBuffering(false);
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
            const volumeValue = newValue / 100;
            videoRef.current.volume = volumeValue;
            setVolume(volumeValue);
            setIsMuted(volumeValue === 0);
        }
    }, []);

    const handlePlaybackRateChange = useCallback((rate) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    }, []);

    const skipForward = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
                videoRef.current.currentTime + SKIP_DURATION,
                videoRef.current.duration
            );
        }
    }, []);

    const skipBackward = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
                videoRef.current.currentTime - SKIP_DURATION,
                0
            );
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
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                skipForward();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                skipBackward();
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
    }, [togglePlay, toggleMute, toggleFullscreen, volume, skipForward, skipBackward]);

    // Handle mouse movement for controls visibility
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', () => setShowControls(false));
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying]);

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
        <div 
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
            tabIndex={0}
        >
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
                        poster={videoPoster}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleVideoLoad}
                        onError={handleVideoError}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadedData={() => setIsLoading(false)}
                        onProgress={handleProgress}
                        onWaiting={handleWaiting}
                        onCanPlay={handleCanPlay}
                    >
                        <source src={videoSrc()} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Buffering Indicator */}
                    {isBuffering && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <CircularProgress size={40} sx={{ color: 'white' }} />
                        </div>
                    )}

                    {/* Play Button Overlay */}
                    {!isPlaying && !isLoading && !error && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer group-hover:bg-black/40 transition-all"
                            onClick={togglePlay}
                        >
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                                <Play className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div 
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                            showControls ? 'opacity-100' : 'opacity-0'
                        }`}
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
                            {/* Buffered Progress */}
                            <div 
                                className="absolute top-1/2 left-0 h-1 bg-white/30 -translate-y-1/2"
                                style={{ width: `${(buffered / duration) * 100}%` }}
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
                                    onClick={skipBackward}
                                    sx={{ color: 'white' }}
                                >
                                    <SkipBack size={24} />
                                </IconButton>

                                <IconButton 
                                    onClick={skipForward}
                                    sx={{ color: 'white' }}
                                >
                                    <SkipForward size={24} />
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
                                                value={isMuted ? 0 : volume * 100}
                                                onChange={handleVolumeChange}
                                                min={0}
                                                max={100}
                                                step={1}
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
                                {/* Playback Speed */}
                                <div className="relative">
                                    <IconButton 
                                        onClick={() => setShowSettings(!showSettings)}
                                        sx={{ color: 'white' }}
                                    >
                                        <Settings size={24} />
                                    </IconButton>
                                    {showSettings && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2">
                                            <div className="space-y-2">
                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => handlePlaybackRateChange(rate)}
                                                        className={`block w-full px-4 py-2 text-sm text-white hover:bg-white/20 rounded ${
                                                            playbackRate === rate ? 'bg-white/20' : ''
                                                        }`}
                                                    >
                                                        {rate}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

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
