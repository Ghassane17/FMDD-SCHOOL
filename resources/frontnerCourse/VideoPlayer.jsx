import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, CircularProgress, Typography, IconButton, Slider, Popper, Paper } from '@mui/material';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

const VideoPlayer = ({ url, title }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const volumeButtonRef = useRef(null);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const handleVolumeChange = useCallback((_, newValue) => {
        if (videoRef.current) {
            const newVolume = newValue / 100;
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume || 1;
                setIsMuted(false);
            } else {
                videoRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    }, [isMuted, volume]);

    return (
        <Box 
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
        >
            {/* ... existing video element and loading/error states ... */}

            <Box className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <Box className="flex items-center space-x-4">
                    <IconButton 
                        onClick={togglePlay} 
                        className="text-white hover:bg-white/30"
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </IconButton>

                    <Box className="flex-1">
                        <Slider
                            value={currentTime}
                            max={duration}
                            onChange={handleSeek}
                            sx={{
                                color: '#ffffff',
                                height: 4,
                                '& .MuiSlider-thumb': {
                                    width: 16,
                                    height: 16,
                                    backgroundColor: '#ffffff',
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.2)'
                                    }
                                },
                                '& .MuiSlider-track': {
                                    border: 'none',
                                    backgroundColor: '#ffffff',
                                },
                                '& .MuiSlider-rail': {
                                    opacity: 0.5,
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)'
                                }
                            }}
                        />
                    </Box>

                    <Typography 
                        variant="body2" 
                        className="text-white font-medium"
                        sx={{
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}
                    >
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </Typography>

                    <Box ref={volumeButtonRef}>
                        <IconButton 
                            onClick={toggleMute}
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                            className="text-white hover:bg-white/30"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                }
                            }}
                        >
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </IconButton>
                        <Popper
                            open={showVolumeSlider}
                            anchorEl={volumeButtonRef.current}
                            placement="top"
                            sx={{ zIndex: 1300 }}
                        >
                            <Paper 
                                sx={{ 
                                    p: 2, 
                                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                                    }
                                }}
                                onMouseEnter={() => setShowVolumeSlider(true)}
                                onMouseLeave={() => setShowVolumeSlider(false)}
                            >
                                <Slider
                                    orientation="vertical"
                                    value={isMuted ? 0 : volume * 100}
                                    onChange={handleVolumeChange}
                                    min={0}
                                    max={100}
                                    sx={{
                                        height: 100,
                                        color: '#ffffff',
                                        '& .MuiSlider-thumb': {
                                            width: 16,
                                            height: 16,
                                            backgroundColor: '#ffffff',
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.2)'
                                            }
                                        },
                                        '& .MuiSlider-track': {
                                            border: 'none',
                                            backgroundColor: '#ffffff',
                                        },
                                        '& .MuiSlider-rail': {
                                            opacity: 0.5,
                                            backgroundColor: 'rgba(255, 255, 255, 0.5)'
                                        }
                                    }}
                                />
                            </Paper>
                        </Popper>
                    </Box>

                    <IconButton 
                        onClick={toggleFullscreen} 
                        className="text-white hover:bg-white/30"
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default VideoPlayer; 