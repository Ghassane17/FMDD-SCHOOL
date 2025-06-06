import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Alert, Chip, Tooltip } from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    OpenInNew,
    PictureAsPdf,
    Image,
    VideoFile,
    AudioFile,
    Description,
    Code,
    Archive,
    DataObject,
    TableChart,
    Slideshow,
    Link,
    InsertDriveFile,
    Preview,
    PlayArrow
} from '@mui/icons-material';
import NotesPanel from './NotesPanel';
import ContentRenderer from './ContentRenderer';
import { downloadResource } from '../../services/api.js';

// File type configuration
const FILE_TYPES = {
    // Documents
    pdf: { icon: PictureAsPdf, color: '#d32f2f', canPreview: true, category: 'document' },
    doc: { icon: Description, color: '#1976d2', canPreview: false, category: 'document' },
    docx: { icon: Description, color: '#1976d2', canPreview: false, category: 'document' },
    txt: { icon: Description, color: '#616161', canPreview: true, category: 'document' },
    rtf: { icon: Description, color: '#616161', canPreview: false, category: 'document' },

    // Spreadsheets
    xls: { icon: TableChart, color: '#388e3c', canPreview: false, category: 'spreadsheet' },
    xlsx: { icon: TableChart, color: '#388e3c', canPreview: false, category: 'spreadsheet' },
    csv: { icon: TableChart, color: '#388e3c', canPreview: true, category: 'spreadsheet' },

    // Presentations
    ppt: { icon: Slideshow, color: '#f57c00', canPreview: false, category: 'presentation' },
    pptx: { icon: Slideshow, color: '#f57c00', canPreview: false, category: 'presentation' },

    // Images
    jpg: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },
    jpeg: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },
    png: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },
    gif: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },
    bmp: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },
    svg: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },
    webp: { icon: Image, color: '#7b1fa2', canPreview: true, category: 'image' },

    // Videos
    mp4: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },
    avi: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },
    mov: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },
    wmv: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },
    flv: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },
    webm: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },
    mkv: { icon: VideoFile, color: '#e91e63', canPreview: true, category: 'video' },

    // Audio
    mp3: { icon: AudioFile, color: '#00796b', canPreview: true, category: 'audio' },
    wav: { icon: AudioFile, color: '#00796b', canPreview: true, category: 'audio' },
    flac: { icon: AudioFile, color: '#00796b', canPreview: true, category: 'audio' },
    aac: { icon: AudioFile, color: '#00796b', canPreview: true, category: 'audio' },
    ogg: { icon: AudioFile, color: '#00796b', canPreview: true, category: 'audio' },

    // Code files
    js: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    jsx: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    ts: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    tsx: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    html: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    css: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    scss: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    py: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    java: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    cpp: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    c: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    php: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    rb: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    go: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },
    rs: { icon: Code, color: '#ff9800', canPreview: true, category: 'code' },

    // Data files
    json: { icon: DataObject, color: '#607d8b', canPreview: true, category: 'data' },
    xml: { icon: DataObject, color: '#607d8b', canPreview: true, category: 'data' },
    yaml: { icon: DataObject, color: '#607d8b', canPreview: true, category: 'data' },
    yml: { icon: DataObject, color: '#607d8b', canPreview: true, category: 'data' },

    // Archives
    zip: { icon: Archive, color: '#795548', canPreview: false, category: 'archive' },
    rar: { icon: Archive, color: '#795548', canPreview: false, category: 'archive' },
    '7z': { icon: Archive, color: '#795548', canPreview: false, category: 'archive' },
    tar: { icon: Archive, color: '#795548', canPreview: false, category: 'archive' },
    gz: { icon: Archive, color: '#795548', canPreview: false, category: 'archive' },

    // URLs/Links
    url: { icon: Link, color: '#2196f3', canPreview: false, category: 'link' },
    link: { icon: Link, color: '#2196f3', canPreview: false, category: 'link' },

    // Default
    default: { icon: InsertDriveFile, color: '#9e9e9e', canPreview: false, category: 'unknown' }
};

// Mapping of resource.type to file extensions
const TYPE_TO_EXTENSION = {
    pdf: '.pdf',
    image: '.png', // Default to PNG for images
    video: '.mp4', // Default to MP4 for videos
    audio: '.mp3', // Default to MP3 for audio
    link: null, // Links don't trigger file dialogs
    other: '.bin' // Generic binary for unknown types
};

// Helper function to get file extension
const getFileExtension = (filename) => {
    if (!filename) return 'default';
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'default';
};

// Helper function to get file type info
const getFileTypeInfo = (filename, resourceType) => {
    // If it's explicitly a URL/link type
    if (resourceType === 'url' || resourceType === 'link') {
        return FILE_TYPES.url;
    }

    const extension = getFileExtension(filename);
    return FILE_TYPES[extension] || FILE_TYPES.default;
};

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Resource action buttons component
const ResourceActions = ({ resource, onDownload, onPreview, onOpen, isDownloading }) => {
    const fileInfo = getFileTypeInfo(resource.name, resource.type);
    const actions = [];

    // Preview action (for previewable files)
    if (fileInfo.canPreview && resource.url) {
        actions.push(
            <Tooltip key="preview" title="Preview">
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={fileInfo.category === 'video' ? <PlayArrow /> : <Preview />}
                    onClick={() => onPreview(resource)}
                    className="normal-case"
                >
                    {fileInfo.category === 'video' || fileInfo.category === 'audio' ? 'Play' : 'Preview'}
                </Button>
            </Tooltip>
        );
    }

    // Download action (always available, except for links)
    if (fileInfo.category !== 'link') {
        actions.push(
            <Tooltip key="download" title="Download file">
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => onDownload(resource.id, resource)} // Pass resource object
                    disabled={isDownloading}
                    className="normal-case"
                >
                    {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
            </Tooltip>
        );
    }

    // Open in new tab action (for URLs and web-viewable files)
    if (resource.url && (fileInfo.category === 'link' || fileInfo.canPreview)) {
        actions.push(
            <Tooltip key="open" title="Open in new tab">
                <Button
                    variant="text"
                    size="small"
                    startIcon={<OpenInNew />}
                    onClick={() => onOpen(resource.url)}
                    className="normal-case text-indigo-600 hover:text-indigo-800"
                >
                    Open
                </Button>
            </Tooltip>
        );
    }

    return <div className="flex items-center gap-2">{actions}</div>;
};

const CourseContent = ({ currentModule, hasPrevious, hasNext, onPreviousClick, onNextClick, onQuizComplete, courseId, onSaveNotes, notes, onModuleComplete }) => {
    const [downloadingResources, setDownloadingResources] = useState(new Set());
    const [previewResource, setPreviewResource] = useState(null);

    if (!currentModule) {
        return (
            <div className="flex-1 p-6 bg-white">
                <Alert severity="error">No module selected.</Alert>
            </div>
        );
    }

    console.log('Module Resources:', JSON.stringify(currentModule.resources, null, 2));

    const handleDownloadResource = async (resourceId, resource) => {
        if (downloadingResources.has(resourceId)) return;

        setDownloadingResources(prev => new Set(prev).add(resourceId));

        try {
            // Strip existing extension from resource.name
            const baseName = resource.name.replace(/\.[^/.]+$/, '');
            // Get extension based on resource.type
            const extension = TYPE_TO_EXTENSION[resource.type.toLowerCase()] || '.bin';
            const fileName = extension ? `${baseName}${extension}` : baseName;

            console.log('Downloading resource:', { resourceId, resourceType: resource.type, fileName });

            await downloadResource(resourceId, fileName);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloadingResources(prev => {
                const newSet = new Set(prev);
                newSet.delete(resourceId);
                return newSet;
            });
        }
    };

    const handlePreviewResource = (resource) => {
        const fileInfo = getFileTypeInfo(resource.name, resource.type);

        if (fileInfo.category === 'image') {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        } else if (fileInfo.category === 'video' || fileInfo.category === 'audio') {
            setPreviewResource(resource);
        } else if (fileInfo.canPreview) {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleOpenResource = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const groupResourcesByCategory = (resources) => {
        const grouped = {};
        resources.forEach(resource => {
            const fileInfo = getFileTypeInfo(resource.name, resource.type);
            const category = fileInfo.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(resource);
        });
        return grouped;
    };

    const categoryLabels = {
        document: 'Documents',
        spreadsheet: 'Spreadsheets',
        presentation: 'Presentations',
        image: 'Images',
        video: 'Videos',
        audio: 'Audio Files',
        code: 'Code Files',
        data: 'Data Files',
        archive: 'Archives',
        link: 'Links',
        unknown: 'Other Files'
    };

    return (
        <div className="flex-1 p-6 bg-white overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{currentModule.title}</h2>
                {!currentModule.is_completed && (
                    <button
                        onClick={() => {
                            if (typeof onModuleComplete === 'function') {
                                onModuleComplete(currentModule.id);
                            } else {
                                console.error('onModuleComplete is not a function:', onModuleComplete);
                            }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Mark as Completed
                    </button>
                )}
            </div>

            <ContentRenderer
                type={currentModule.type}
                textContent={currentModule.text_content}
                filePath={currentModule.file_path}
                quizQuestions={currentModule.quiz_questions}
                resources={currentModule.resources}
                onQuizComplete={onQuizComplete}
            />

            <div className="mt-6 space-y-6">
                {currentModule.resources?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Resources ({currentModule.resources.length})
                        </h3>

                        {(() => {
                            const groupedResources = groupResourcesByCategory(currentModule.resources);

                            return Object.entries(groupedResources).map(([category, resources]) => (
                                <div key={category} className="mb-6">
                                    <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        {categoryLabels[category]}
                                        <Chip size="small" label={resources.length} />
                                    </h4>
                                    <div className="space-y-3">
                                        {resources.map((resource) => {
                                            const fileInfo = getFileTypeInfo(resource.name, resource.type);
                                            const IconComponent = fileInfo.icon;

                                            return (
                                                <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <IconComponent
                                                            style={{ color: fileInfo.color, fontSize: '2rem' }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-gray-900 truncate">
                                                                {resource.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <span className="capitalize">{resource.type}</span>
                                                                {resource.size && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{formatFileSize(resource.size)}</span>
                                                                    </>
                                                                )}
                                                                {resource.description && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate">{resource.description}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <ResourceActions
                                                        resource={resource}
                                                        onDownload={handleDownloadResource}
                                                        onPreview={handlePreviewResource}
                                                        onOpen={handleOpenResource}
                                                        isDownloading={downloadingResources.has(resource.id)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                <NotesPanel
                    courseId={courseId}
                    notes={notes}
                    onSaveNotes={onSaveNotes}
                />
            </div>

            <div className="flex justify-between mt-8">
                <Button
                    variant="outlined"
                    startIcon={<ChevronLeft />}
                    onClick={onPreviousClick}
                    disabled={!hasPrevious}
                    className="normal-case"
                >
                    Previous
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ChevronRight />}
                    onClick={onNextClick}
                    disabled={!hasNext}
                    className="normal-case"
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

CourseContent.propTypes = {
    currentModule: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        type: PropTypes.oneOf(['text', 'pdf', 'image', 'video', 'quiz']),
        text_content: PropTypes.string,
        file_path: PropTypes.string,
        is_completed: PropTypes.bool,
        quiz_questions: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                question: PropTypes.string,
                options: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.number,
                        text: PropTypes.string,
                    })
                ),
                correct_option: PropTypes.number,
            })
        ),
        resources: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string,
                type: PropTypes.string,
                url: PropTypes.string,
                size: PropTypes.number,
                description: PropTypes.string,
            })
        ),
    }),
    hasPrevious: PropTypes.bool.isRequired,
    hasNext: PropTypes.bool.isRequired,
    onPreviousClick: PropTypes.func.isRequired,
    onNextClick: PropTypes.func.isRequired,
    onQuizComplete: PropTypes.func,
    courseId: PropTypes.number.isRequired,
    onSaveNotes: PropTypes.func.isRequired,
    notes: PropTypes.string,
    onModuleComplete: PropTypes.func.isRequired,
};

export default CourseContent;
