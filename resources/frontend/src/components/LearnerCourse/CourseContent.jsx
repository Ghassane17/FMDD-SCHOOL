"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Video,
  Music,
  FileCode,
  Archive,
  Database,
  Presentation,
  Link,
  File,
  Eye,
  Play,
  ChevronDown,
  CheckCircle,
  Folder,
  FolderOpen,
  Maximize2,
  Minimize2,
} from "lucide-react"
import ContentRenderer from "./ContentRenderer"
import { downloadResource } from "../../services/api.js"

// File type configuration
const FILE_TYPES = {
  // Documents
  pdf: { icon: FileText, canPreview: true, category: "Documents" },
  doc: { icon: FileText, canPreview: false, category: "Documents" },
  docx: { icon: FileText, canPreview: false, category: "Documents" },
  txt: { icon: FileText, canPreview: true, category: "Documents" },
  rtf: { icon: FileText, canPreview: false, category: "Documents" },

  // Spreadsheets
  xls: { icon: Database, canPreview: false, category: "Spreadsheets" },
  xlsx: { icon: Database, canPreview: false, category: "Spreadsheets" },
  csv: { icon: Database, canPreview: true, category: "Spreadsheets" },

  // Presentations
  ppt: { icon: Presentation, canPreview: false, category: "Presentations" },
  pptx: { icon: Presentation, canPreview: false, category: "Presentations" },

  // Images
  jpg: { icon: ImageIcon, canPreview: true, category: "Images" },
  jpeg: { icon: ImageIcon, canPreview: true, category: "Images" },
  png: { icon: ImageIcon, canPreview: true, category: "Images" },
  gif: { icon: ImageIcon, canPreview: true, category: "Images" },
  bmp: { icon: ImageIcon, canPreview: true, category: "Images" },
  svg: { icon: ImageIcon, canPreview: true, category: "Images" },
  webp: { icon: ImageIcon, canPreview: true, category: "Images" },

  // Videos
  mp4: { icon: Video, canPreview: true, category: "Videos" },
  avi: { icon: Video, canPreview: true, category: "Videos" },
  mov: { icon: Video, canPreview: true, category: "Videos" },
  wmv: { icon: Video, canPreview: true, category: "Videos" },
  flv: { icon: Video, canPreview: true, category: "Videos" },
  webm: { icon: Video, canPreview: true, category: "Videos" },
  mkv: { icon: Video, canPreview: true, category: "Videos" },

  // Audio
  mp3: { icon: Music, canPreview: true, category: "Audio" },
  wav: { icon: Music, canPreview: true, category: "Audio" },
  flac: { icon: Music, canPreview: true, category: "Audio" },
  aac: { icon: Music, canPreview: true, category: "Audio" },
  ogg: { icon: Music, canPreview: true, category: "Audio" },

  // Code files
  js: { icon: FileCode, canPreview: true, category: "Code" },
  jsx: { icon: FileCode, canPreview: true, category: "Code" },
  ts: { icon: FileCode, canPreview: true, category: "Code" },
  tsx: { icon: FileCode, canPreview: true, category: "Code" },
  html: { icon: FileCode, canPreview: true, category: "Code" },
  css: { icon: FileCode, canPreview: true, category: "Code" },
  scss: { icon: FileCode, canPreview: true, category: "Code" },
  py: { icon: FileCode, canPreview: true, category: "Code" },
  java: { icon: FileCode, canPreview: true, category: "Code" },
  cpp: { icon: FileCode, canPreview: true, category: "Code" },
  c: { icon: FileCode, canPreview: true, category: "Code" },
  php: { icon: FileCode, canPreview: true, category: "Code" },
  rb: { icon: FileCode, canPreview: true, category: "Code" },
  go: { icon: FileCode, canPreview: true, category: "Code" },
  rs: { icon: FileCode, canPreview: true, category: "Code" },

  // Data files
  json: { icon: Database, canPreview: true, category: "Data" },
  xml: { icon: Database, canPreview: true, category: "Data" },
  yaml: { icon: Database, canPreview: true, category: "Data" },
  yml: { icon: Database, canPreview: true, category: "Data" },

  // Archives
  zip: { icon: Archive, canPreview: false, category: "Archives" },
  rar: { icon: Archive, canPreview: false, category: "Archives" },
  "7z": { icon: Archive, canPreview: false, category: "Archives" },
  tar: { icon: Archive, canPreview: false, category: "Archives" },
  gz: { icon: Archive, canPreview: false, category: "Archives" },

  // URLs/Links
  url: { icon: Link, canPreview: false, category: "Links" },
  link: { icon: Link, canPreview: false, category: "Links" },

  // Default
  default: { icon: File, canPreview: false, category: "Other" },
}

const isDirectUrl = (resource) => {
  // Check if it's a link type
  if (resource.type === 'link' || resource.type === 'url') {
    return true;
  }
  // Check if the resource name looks like a URL
  const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
  return urlPattern.test(resource.name);
};

const formatUrl = (url) => {
  if (!url) return '';
  
  // Remove any existing protocol to avoid duplicates
  url = url.replace(/^(https?:\/\/)?/, '');
  
  // Remove any leading slashes or whitespace
  url = url.replace(/^\/+|\/+$/g, '').trim();
  
  // If it's already a valid URL (contains a dot and doesn't have spaces)
  if (/^[^\s]+\.[^\s]+/.test(url)) {
    return `https://${url}`;
  }
  
  return url;
};
// Mapping of resource.type to file extensions
const TYPE_TO_EXTENSION = {
  pdf: ".pdf",
  image: ".png",
  video: ".mp4",
  audio: ".mp3",
  link: null,
  other: ".bin",
}

// Helper function to get file extension
const getFileExtension = (filename) => {
  if (!filename) return "default"
  const ext = filename.split(".").pop()?.toLowerCase()
  return ext || "default"
}

// Helper function to get file type info
const getFileTypeInfo = (filename, resourceType) => {
  if (resourceType === "url" || resourceType === "link") {
    return FILE_TYPES.url
  }

  const extension = getFileExtension(filename)
  return FILE_TYPES[extension] || FILE_TYPES.default
}

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return ""
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Resource action buttons component
const ResourceActions = ({ resource, onDownload, onPreview, onOpen, isDownloading }) => {
  const fileInfo = getFileTypeInfo(resource.name, resource.type);
  const actions = [];
  const isUrl = isDirectUrl(resource);

  // For URL/Link resources - Primary action is "Open Link"
  if (isUrl || resource.type === 'link' || resource.type === 'url') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpen(formatUrl(resource.url || resource.name))}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Open link"
        >
          <ExternalLink className="w-4 h-4" />
          Open Link
        </button>
      </div>
    );
  }

  // For regular files - Keep existing logic
  // Preview action (for previewable files)
  if (fileInfo.canPreview && resource.url) {
    actions.push(
      <button
        key="preview"
        onClick={() => onPreview(resource)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Preview"
      >
        {fileInfo.category === "Videos" || fileInfo.category === "Audio" ? (
          <Play className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        {fileInfo.category === "Videos" || fileInfo.category === "Audio" ? "Play" : "Preview"}
      </button>
    );
  }

  // Download action (always available for files)
  actions.push(
    <button
      key="download"
      onClick={() => onDownload(resource.id, resource)}
      disabled={isDownloading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      title="Download file"
    >
      <Download className="w-4 h-4" />
      {isDownloading ? "Downloading..." : "Download"}
    </button>
  );

  // Open in new tab action (for web-viewable files)
  if (resource.url && fileInfo.canPreview) {
    actions.push(
      <button
        key="open"
        onClick={() => onOpen(resource.url)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-black transition-colors"
        title="Open in new tab"
      >
        <ExternalLink className="w-4 h-4" />
        Open
      </button>
    );
  }

  return <div className="flex items-center gap-2">{actions}</div>;
};

const CourseContent = ({
  currentModule,
  hasPrevious,
  hasNext,
  onPreviousClick,
  onNextClick,
  onQuizComplete,
  courseId,
  moduleId,
  onSaveNotes,
  notes,
  onModuleComplete,
  isFocused,
  onToggleFocus,
}) => {
  const [downloadingResources, setDownloadingResources] = useState(new Set())
  const [previewResource, setPreviewResource] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  if (!currentModule) {
    return (
      <div className="flex-1 p-8 bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">No module selected.</p>
        </div>
      </div>
    )
  }

  const handleDownloadResource = async (resourceId, resource) => {
    // Check if it's a direct URL or link type first
    if (isDirectUrl(resource) || resource.type === 'link' || resource.type === 'url') {
      const url = formatUrl(resource.url || resource.name);
      console.log('🔗 Opening external link:', url);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
   
    if (downloadingResources.has(resourceId)) return;

    setDownloadingResources((prev) => new Set(prev).add(resourceId));

    try {
      const baseName = resource.name.replace(/\.[^/.]+$/, "");
      const extension = TYPE_TO_EXTENSION[resource.type.toLowerCase()] || ".bin";
      const fileName = extension ? `${baseName}${extension}` : baseName;

      await downloadResource(resourceId, fileName);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingResources((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resourceId);
        return newSet;
      });
    }
  }

  const handlePreviewResource = (resource) => {
    // Check if it's a direct URL or link type first
    if (isDirectUrl(resource) || resource.type === 'link' || resource.type === 'url') {
      const url = formatUrl(resource.url || resource.name);
      console.log('🔗 Opening external link:', url);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const fileInfo = getFileTypeInfo(resource.name, resource.type)

    if (fileInfo.category === "Images") {
      window.open(resource.url, "_blank", "noopener,noreferrer")
    } else if (fileInfo.category === "Videos" || fileInfo.category === "Audio") {
      setPreviewResource(resource)
    } else if (fileInfo.canPreview) {
      window.open(resource.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleOpenResource = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const groupResourcesByCategory = (resources) => {
    const grouped = {}
    resources.forEach((resource) => {
      const fileInfo = getFileTypeInfo(resource.name, resource.type)
      const category = fileInfo.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(resource)
    })
    return grouped
  }

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  return (
    <div className="flex-1 bg-white overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Module Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-black mb-4">{currentModule.title}</h1>
            <div className="flex items-center gap-4 text-base text-gray-600">
              
              {currentModule.is_completed && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!currentModule.is_completed && (
              <button
                onClick={() => {
                  if (typeof onModuleComplete === "function") {
                    onModuleComplete(currentModule.id)
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base"
              >
                <CheckCircle className="w-5 h-5" />
                J’ai terminé ce module
              </button>
            )}
            <button
              onClick={onToggleFocus}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={isFocused ? "Exit focus mode" : "Enter focus mode"}
            >
              {isFocused ? (
                <>
                  <Minimize2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Exit Focus</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Focus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Renderer */}
        <div className={`mb-16 transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
          <ContentRenderer
            type={currentModule.type}
            textContent={currentModule.text_content}
            filePath={currentModule.file_path}
            quizQuestions={currentModule.quiz_questions}
            resources={currentModule.resources}
            courseId={courseId}
            moduleId={currentModule.id}
            onQuizComplete={onQuizComplete}
          />
        </div>

        {/* Resources Section */}
        {currentModule.resources?.length > 0 && (
          <div className={`mb-16 transition-all duration-300 ${isFocused ? 'opacity-50' : ''}`}>
            <h2 className="text-3xl font-bold text-black mb-8">Resources ({currentModule.resources.length})</h2>

            {(() => {
              const groupedResources = groupResourcesByCategory(currentModule.resources)

              return Object.entries(groupedResources).map(([category, resources]) => {
                const isExpanded = expandedCategories.has(category)
                const IconComponent = isExpanded ? FolderOpen : Folder

                return (
                  <div key={category} className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <IconComponent className="w-6 h-6 text-gray-600" />
                        <h3 className="text-xl font-semibold text-black">{category}</h3>
                        <span className="px-3 py-1 bg-white text-gray-600 text-base rounded-full">
                          {resources.length}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-6 space-y-4 bg-white">
                        {resources.map((resource) => {
                          const fileInfo = getFileTypeInfo(resource.name, resource.type)
                          const IconComponent = fileInfo.icon

                          return (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <IconComponent className="w-8 h-8 text-gray-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-medium text-black truncate">{resource.name}</h4>
                                  <div className="flex items-center gap-3 text-base text-gray-600">
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
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className={`flex justify-between items-center pt-8 border-t border-gray-200 transition-all duration-300 ${isFocused ? 'opacity-50' : ''}`}>
          <button
            onClick={onPreviousClick}
            disabled={!hasPrevious}
            className="flex items-center gap-3 px-8 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={onNextClick}
            disabled={!hasNext}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

CourseContent.propTypes = {
  currentModule: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    type: PropTypes.oneOf(["text", "pdf", "image", "video", "quiz"]),
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
          }),
        ),
        correct_option: PropTypes.number,
      }),
    ),
    resources: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        type: PropTypes.string,
        url: PropTypes.string,
        size: PropTypes.number,
        description: PropTypes.string,
      }),
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
  isFocused: PropTypes.bool,
  onToggleFocus: PropTypes.func.isRequired,
}

export default CourseContent
