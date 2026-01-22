import { useEffect, useCallback } from 'react';
import { useClipboard } from '@/context/ClipboardContext';

/**
 * Hook to listen to system clipboard events and automatically save to clipboard history
 */
export function useClipboardListener(options = {}) {
  const { enabled = true, autoSave = true } = options;
  const { saveToClipboard } = useClipboard();

  const detectContentType = useCallback((text) => {
    // Detect if it's a URL
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (urlRegex.test(text.trim())) {
      return { type: 'link', metadata: { linkUrl: text.trim() } };
    }

    // Detect if it's code (contains common code patterns)
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /class\s+\w+/,
      /import\s+.*from/,
      /export\s+(default|const|function)/,
      /def\s+\w+\(/,
      /public\s+(class|static)/,
      /<\?php/,
      /^\s*{[\s\S]*}$/m, // JSON-like
    ];

    for (const pattern of codePatterns) {
      if (pattern.test(text)) {
        // Try to detect language
        let language = null;
        if (/function\s+\w+|const\s+\w+|let\s+\w+|=>/.test(text)) {
          language = 'javascript';
        } else if (/def\s+\w+|import\s+\w+|print\(/.test(text)) {
          language = 'python';
        } else if (/public\s+class|private\s+|protected\s+/.test(text)) {
          language = 'java';
        } else if (/<\?php/.test(text)) {
          language = 'php';
        } else if (/^\s*{[\s\S]*}$/m.test(text)) {
          language = 'json';
        }
        
        return { type: 'code', language };
      }
    }

    // Default to text
    return { type: 'text' };
  }, []);

  const handleCopy = useCallback(
    async (event) => {
      if (!enabled || !autoSave) return;

      try {
        // Get the selected text
        const selection = window.getSelection();
        const text = selection?.toString();

        if (!text || text.trim().length === 0) return;

        // Don't save very small selections (like single characters)
        if (text.trim().length < 3) return;

        // Detect content type
        const { type, language, metadata } = detectContentType(text);

        // Save to clipboard history
        await saveToClipboard({
          type,
          content: text,
          preview: text.substring(0, 200),
          language,
          metadata: metadata || {},
        });
      } catch (error) {
        console.error('Error handling copy event:', error);
      }
    },
    [enabled, autoSave, detectContentType, saveToClipboard],
  );

  const handleCut = useCallback(
    async (event) => {
      // Cut is essentially a copy followed by delete
      await handleCopy(event);
    },
    [handleCopy],
  );

  const handlePaste = useCallback(
    async (event) => {
      // We can track paste events if needed
      // For now, we primarily track copies
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;

    // Listen to copy and cut events
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, [enabled, handleCopy, handleCut, handlePaste]);

  return {
    // Can expose methods if needed
  };
}
