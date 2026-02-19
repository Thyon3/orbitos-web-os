import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const CodeEditor = ({ initialContent = '', language = 'javascript', onSave }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState(language);
  const [lineNumbers, setLineNumbers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [showMinimap, setShowMinimap] = useState(false);
  const [showGutter, setShowGutter] = useState(true);
  const [theme, setEditorTheme] = useState('dark');
  
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const minimapRef = useRef(null);

  // Syntax highlighting (simplified)
  const highlightSyntax = useCallback((code, lang) => {
    // This is a simplified syntax highlighter - in production, use a proper library like Prism.js or Monaco Editor
    const keywords = {
      javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super'],
      python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'async', 'await'],
      css: ['color', 'background', 'margin', 'padding', 'border', 'display', 'position', 'width', 'height', 'font-size', 'text-align'],
      html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'script', 'style', 'link', 'meta', 'head', 'body', 'html']
    };

    const langKeywords = keywords[lang] || keywords.javascript;
    let highlightedCode = code;

    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span class="keyword">${keyword}</span>`);
    });

    // String highlighting
    highlightedCode = highlightedCode.replace(/(["'`])([^"'`]*)\1/g, '<span class="string">$1$2$1</span>');
    
    // Comment highlighting
    highlightedCode = highlightedCode.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    highlightedCode = highlightedCode.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

    return highlightedCode;
  }, []);

  // Update line numbers
  useEffect(() => {
    const lines = content.split('\n');
    const numbers = Array.from({ length: lines.length }, (_, i) => i + 1);
    setLineNumbers(numbers);
  }, [content]);

  // Handle content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Update cursor position
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line: currentLine, column: currentColumn });
    
    if (onSave) {
      onSave(newContent);
    }
  };

  // Handle selection change
  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });
    }
  };

  // Insert text at cursor
  const insertText = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    // Tab key - insert spaces or indent
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
    
    // Ctrl+S - Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (onSave) {
        onSave(content);
      }
    }
    
    // Ctrl+F - Find
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      // Open find dialog
      window.dispatchEvent(new CustomEvent('open-find', { detail: { content } }));
    }
  };

  // Get highlighted content
  const getHighlightedContent = () => {
    return highlightSyntax(content, language);
  };

  // Generate minimap content
  const getMinimapContent = () => {
    const lines = content.split('\n');
    const visibleLines = Math.min(50, lines.length);
    return lines.slice(0, visibleLines).join('\n');
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between p-2 border-b ${theme.app.toolbar}`}>
        <div className="flex items-center space-x-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`px-2 py-1 rounded ${theme.app.input} text-sm`}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="sql">SQL</option>
            <option value="xml">XML</option>
          </select>

          {/* Font size controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 2))}
              className={`px-2 py-1 rounded ${theme.app.toolbarButton} text-sm`}
            >
              A-
            </button>
            <span className="text-sm px-2">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className={`px-2 py-1 rounded ${theme.app.toolbarButton} text-sm`}
            >
              A+
            </button>
          </div>

          {/* Word wrap toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-2 py-1 rounded ${wordWrap ? theme.app.toolbar_button_active : theme.app.toolbarButton} text-sm`}
          >
            Wrap
          </button>

          {/* Gutter toggle */}
          <button
            onClick={() => setShowGutter(!showGutter)}
            className={`px-2 py-1 rounded ${showGutter ? theme.app.toolbar_button_active : theme.app.toolbarButton} text-sm`}
          >
            #
          </button>

          {/* Minimap toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`px-2 py-1 rounded ${showMinimap ? theme.app.toolbar_button_active : theme.app.toolbarButton} text-sm`}
          >
            🗺️
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          {/* Cursor position */}
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          
          {/* Selection info */}
          {selection.start !== selection.end && (
            <span>Selected: {Math.abs(selection.end - selection.start)} chars</span>
          )}
          
          {/* Language indicator */}
          <span className={`px-2 py-1 rounded ${theme.app.badge}`}>
            {language.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Line numbers */}
        {showGutter && (
          <div className={`w-12 ${theme.app.bg} border-r ${theme.app.border} text-right pr-2 pt-4 select-none`}>
            {lineNumbers.map(lineNum => (
              <div
                key={lineNum}
                className={`text-sm ${theme.text.secondary} leading-6`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {lineNum}
              </div>
            ))}
          </div>
        )}

        {/* Code editor */}
        <div className="flex-1 relative">
          {/* Highlighted content (background) */}
          <div
            ref={editorRef}
            className={`absolute inset-0 p-4 overflow-auto ${theme.app.content}`}
            style={{ fontSize: `${fontSize}px`, fontFamily: 'monospace', whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }}
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
          />

          {/* Textarea (transparent, for input) */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelectionChange}
            className={`absolute inset-0 p-4 bg-transparent resize-none outline-none ${theme.app.text} caret-current`}
            style={{ 
              fontSize: `${fontSize}px`, 
              fontFamily: 'monospace', 
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              lineHeight: 1.5,
              zIndex: 10
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Minimap */}
        <AnimatePresence>
          {showMinimap && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 150, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`border-l ${theme.app.border} ${theme.app.bg} p-2`}
            >
              <div
                ref={minimapRef}
                className={`text-xs font-mono ${theme.text.secondary} overflow-hidden`}
                style={{ 
                  fontSize: '2px',
                  lineHeight: 1.2,
                  transform: 'scale(0.1)',
                  transformOrigin: 'top left',
                  width: '1000px'
                }}
              >
                {getMinimapContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      <div className={`flex items-center justify-between px-4 py-1 border-t ${theme.app.toolbar} text-xs`}>
        <div className="flex items-center space-x-4">
          <span>{content.length} characters</span>
          <span>{content.split('\n').length} lines</span>
          <span>{content.split(/\s+/).filter(word => word.length > 0).length} words</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>UTF-8</span>
          <span>LF</span>
          <span>{theme === 'dark' ? 'Dark' : 'Light'} Theme</span>
        </div>
      </div>

      <style jsx>{`
        .keyword {
          color: #c678dd;
          font-weight: bold;
        }
        
        .string {
          color: #98c379;
        }
        
        .comment {
          color: #5c6370;
          font-style: italic;
        }
        
        .function {
          color: #61afef;
        }
        
        .variable {
          color: #e06c75;
        }
        
        .number {
          color: #d19a66;
        }
        
        .operator {
          color: #56b6c2;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
