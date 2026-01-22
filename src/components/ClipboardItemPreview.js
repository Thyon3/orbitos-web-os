import React, { useState } from 'react';
import { Copy, ExternalLink, Check, Eye, EyeOff } from 'lucide-react';
import { useClipboard } from '@/context/ClipboardContext';

export default function ClipboardItemPreview({ item, onClose }) {
  const { copyToSystemClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleCopy = async () => {
    const success = await copyToSystemClipboard(item.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {showFullContent ? item.content : item.content.substring(0, 1000)}
            </pre>
            {item.content.length > 1000 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
              >
                {showFullContent ? (
                  <>
                    <EyeOff className="w-4 h-4" /> Show less
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Show more
                  </>
                )}
              </button>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              {item.language && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {item.language}
                </span>
              )}
            </div>
            <pre className="text-sm text-gray-100 font-mono overflow-x-auto">
              <code>{item.content}</code>
            </pre>
          </div>
        );

      case 'image':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            {item.metadata?.imageUrl ? (
              <img
                src={item.metadata.imageUrl}
                alt="Clipboard image"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Image preview not available</p>
                <p className="text-sm mt-2">URL: {item.content}</p>
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {item.metadata?.linkTitle && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.metadata.linkTitle}
                </h3>
              )}
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 break-all"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                {item.content}
              </a>
              {item.preview && item.preview !== item.content && (
                <p className="text-sm text-gray-600">{item.preview}</p>
              )}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              {item.metadata?.fileName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    File:
                  </span>
                  <span className="text-sm text-gray-900">
                    {item.metadata.fileName}
                  </span>
                </div>
              )}
              {item.metadata?.fileType && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Type:
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.metadata.fileType}
                  </span>
                </div>
              )}
              {item.metadata?.size && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Size:
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatBytes(item.metadata.size)}
                  </span>
                </div>
              )}
              {item.content && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Content:
                  </p>
                  <pre className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200 max-h-48 overflow-auto">
                    {item.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              {item.content}
            </pre>
          </div>
        );
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getTypeIcon(item.type)}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded uppercase font-semibold">
                    {item.type}
                  </span>
                  {item.language && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded font-semibold">
                      {item.language}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Copied {formatDate(item.copiedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              {item.accessCount > 0 && (
                <span>Used {item.accessCount} times</span>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span>Tags:</span>
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {item.isPinned && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded font-semibold">
                📌 PINNED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type) {
  const icons = {
    text: '📝',
    code: '💻',
    image: '🖼️',
    link: '🔗',
    file: '📎',
  };
  return icons[type] || '📋';
}
