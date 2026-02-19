import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const CodeCompletion = ({ 
  value, 
  onChange, 
  language = 'javascript',
  suggestions = [],
  onSuggestionSelect 
}) => {
  const { theme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [triggerWord, setTriggerWord] = useState('');
  const textareaRef = useRef(null);

  // AI-powered code suggestions based on language
  const aiSuggestions = {
    javascript: [
      { text: 'console.log()', description: 'Log to console', type: 'function' },
      { text: 'const ', description: 'Declare constant', type: 'keyword' },
      { text: 'let ', description: 'Declare variable', type: 'keyword' },
      { text: 'function ', description: 'Define function', type: 'keyword' },
      { text: 'if () {}', description: 'Conditional statement', type: 'control' },
      { text: 'for (let i = 0; i < ; i++) {}', description: 'For loop', type: 'control' },
      { text: 'map()', description: 'Array map method', type: 'method' },
      { text: 'filter()', description: 'Array filter method', type: 'method' },
      { text: 'reduce()', description: 'Array reduce method', type: 'method' },
      { text: 'async function ', description: 'Async function', type: 'keyword' },
      { text: 'await ', description: 'Await promise', type: 'keyword' },
      { text: 'try {} catch (error) {}', description: 'Error handling', type: 'control' },
      { text: 'import ', description: 'Import module', type: 'keyword' },
      { text: 'export default ', description: 'Export default', type: 'keyword' },
      { text: 'useState()', description: 'React hook', type: 'hook' },
      { text: 'useEffect()', description: 'React effect hook', type: 'hook' },
      { text: 'useCallback()', description: 'React callback hook', type: 'hook' },
      { text: 'useMemo()', description: 'React memo hook', type: 'hook' },
      { text: 'className=""', description: 'CSS class attribute', type: 'attribute' },
      { text: 'style={{}}', description: 'Inline styles', type: 'attribute' }
    ],
    python: [
      { text: 'print()', description: 'Print to console', type: 'function' },
      { text: 'def ', description: 'Define function', type: 'keyword' },
      { text: 'class ', description: 'Define class', type: 'keyword' },
      { text: 'if :', description: 'Conditional statement', type: 'control' },
      { text: 'for  in :', description: 'For loop', type: 'control' },
      { text: 'while :', description: 'While loop', type: 'control' },
      { text: 'import ', description: 'Import module', type: 'keyword' },
      { text: 'from  import ', description: 'Import from module', type: 'keyword' },
      { text: 'len()', description: 'Get length', type: 'function' },
      { text: 'range()', description: 'Generate range', type: 'function' },
      { text: 'list()', description: 'Create list', type: 'function' },
      { text: 'dict()', description: 'Create dictionary', type: 'function' },
      { text: 'self', description: 'Instance reference', type: 'keyword' },
      { text: '__init__', description: 'Constructor', type: 'method' },
      { text: 'append()', description: 'Add to list', type: 'method' },
      { text: 'extend()', description: 'Extend list', type: 'method' }
    ],
    css: [
      { text: 'display: flex;', description: 'Flexbox layout', type: 'property' },
      { text: 'display: grid;', description: 'Grid layout', type: 'property' },
      { text: 'position: relative;', description: 'Relative positioning', type: 'property' },
      { text: 'position: absolute;', description: 'Absolute positioning', type: 'property' },
      { text: 'position: fixed;', description: 'Fixed positioning', type: 'property' },
      { text: 'margin: 0 auto;', description: 'Center horizontally', type: 'property' },
      { text: 'transition: all 0.3s ease;', description: 'Smooth transitions', type: 'property' },
      { text: 'transform: translateX();', description: 'Horizontal transform', type: 'property' },
      { text: 'transform: translateY();', description: 'Vertical transform', type: 'property' },
      { text: 'transform: scale();', description: 'Scale transform', type: 'property' },
      { text: 'opacity: 0;', description: 'Hide element', type: 'property' },
      { text: 'opacity: 1;', description: 'Show element', type: 'property' },
      { text: 'z-index: 1000;', description: 'Stack order', type: 'property' },
      { text: 'overflow: hidden;', description: 'Hide overflow', type: 'property' },
      { text: 'border-radius: 8px;', description: 'Rounded corners', type: 'property' },
      { text: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);', description: 'Drop shadow', type: 'property' }
    ]
  };

  // Get suggestions for current language
  const getLanguageSuggestions = useCallback(() => {
    return aiSuggestions[language] || aiSuggestions.javascript;
  }, [language]);

  // Extract current word and trigger suggestions
  const extractCurrentWord = useCallback((text, position) => {
    const beforeCursor = text.substring(0, position);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    
    // Check if we should trigger suggestions
    const triggers = ['.', '(', ' ', '=', '<', '"', "'", '{', '['];
    const shouldTrigger = triggers.some(trigger => currentWord.includes(trigger)) || currentWord.length >= 2;
    
    return { word: currentWord, shouldTrigger };
  }, []);

  // Filter suggestions based on current word
  const filterSuggestions = useCallback((word, allSuggestions) => {
    if (!word || word.length < 2) return [];
    
    const lowerWord = word.toLowerCase();
    return allSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(lowerWord) ||
      suggestion.description.toLowerCase().includes(lowerWord)
    ).slice(0, 10);
  }, []);

  // Handle input change
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newPosition);
    
    const { word, shouldTrigger } = extractCurrentWord(newValue, newPosition);
    
    if (shouldTrigger) {
      const allSuggestions = [...getLanguageSuggestions(), ...suggestions];
      const filtered = filterSuggestions(word, allSuggestions);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
      setTriggerWord(word);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [onChange, extractCurrentWord, getLanguageSuggestions, suggestions, filterSuggestions]);

  // Handle suggestion selection
  const selectSuggestion = useCallback((suggestion) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find the start of the word to replace
    const wordStart = beforeCursor.lastIndexOf(triggerWord);
    const newValue = beforeCursor.substring(0, wordStart) + suggestion.text + afterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPosition = wordStart + suggestion.text.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);

    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  }, [value, cursorPosition, triggerWord, onChange, onSuggestionSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredSuggestions.length);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev === 0 ? filteredSuggestions.length - 1 : prev - 1);
        break;
        
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          selectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setFilteredSuggestions([]);
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedIndex, selectSuggestion]);

  // Get suggestion icon based on type
  const getSuggestionIcon = (type) => {
    const icons = {
      function: '🔧',
      keyword: '🔑',
      control: '🎮',
      method: '📦',
      hook: '🪝',
      attribute: '🏷️',
      property: '🎨'
    };
    return icons[type] || '💡';
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`w-full h-64 p-4 font-mono text-sm rounded-lg border ${theme.app.border} ${theme.app.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        placeholder={`Start typing ${language} code...`}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full left-0 right-0 mt-1 ${theme.app.bg} border ${theme.app.border} rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto`}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center space-x-3 p-3 cursor-pointer ${
                  index === selectedIndex ? theme.app.dropdown_item_hover : 'hover:bg-gray-100'
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <div className={`font-medium ${theme.text.primary}`}>
                      {suggestion.text}
                    </div>
                    <div className={`text-xs ${theme.text.secondary}`}>
                      {suggestion.description}
                    </div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${theme.app.badge}`}>
                  {suggestion.type}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      <div className={`absolute bottom-2 right-2 text-xs ${theme.text.secondary}`}>
        {showSuggestions && (
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>AI suggestions active</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default CodeCompletion;
