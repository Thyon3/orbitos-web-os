/**
 * ShortcutRegistry - Defines all default keyboard shortcuts for OrbitOS
 * This service provides default shortcuts that can be initialized for new users
 */

class ShortcutRegistry {
  constructor() {
    this.defaultShortcuts = this.defineDefaultShortcuts();
  }

  defineDefaultShortcuts() {
    return [
      // System shortcuts
      {
        shortcutId: 'system.search',
        category: 'system',
        name: 'Global Search',
        description: 'Open global search dialog',
        keys: ['Ctrl', 'k'],
        keyCombination: 'Ctrl+K',
        action: 'openGlobalSearch',
        isDefault: true,
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'system.search.mac',
        category: 'system',
        name: 'Global Search (Mac)',
        description: 'Open global search dialog',
        keys: ['Cmd', 'k'],
        keyCombination: 'Cmd+K',
        action: 'openGlobalSearch',
        isDefault: true,
        metadata: { platform: 'mac', scope: 'global' },
      },
      {
        shortcutId: 'system.help',
        category: 'system',
        name: 'Show Help',
        description: 'Show keyboard shortcuts help',
        keys: ['F1'],
        keyCombination: 'F1',
        action: 'showHelp',
        isDefault: true,
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'system.settings',
        category: 'system',
        name: 'Open Settings',
        description: 'Open system settings',
        keys: ['Ctrl', ','],
        keyCombination: 'Ctrl+,',
        action: 'openSettings',
        isDefault: true,
        metadata: { platform: 'all', scope: 'global' },
      },

      // Navigation shortcuts
      {
        shortcutId: 'navigation.desktop',
        category: 'navigation',
        name: 'Show Desktop',
        description: 'Minimize all windows and show desktop',
        keys: ['Ctrl', 'Alt', 'd'],
        keyCombination: 'Ctrl+Alt+D',
        action: 'showDesktop',
        isDefault: true,
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'navigation.taskbar',
        category: 'navigation',
        name: 'Focus Taskbar',
        description: 'Focus on taskbar for keyboard navigation',
        keys: ['Ctrl', 'Escape'],
        keyCombination: 'Ctrl+Escape',
        action: 'focusTaskbar',
        isDefault: true,
        metadata: { platform: 'all', scope: 'global' },
      },

      // Window management shortcuts
      {
        shortcutId: 'window.close',
        category: 'window',
        name: 'Close Window',
        description: 'Close the active window',
        keys: ['Alt', 'F4'],
        keyCombination: 'Alt+F4',
        action: 'closeWindow',
        isDefault: true,
        metadata: { platform: 'all', scope: 'window' },
      },
      {
        shortcutId: 'window.maximize',
        category: 'window',
        name: 'Maximize Window',
        description: 'Maximize or restore the active window',
        keys: ['Alt', 'F10'],
        keyCombination: 'Alt+F10',
        action: 'maximizeWindow',
        isDefault: true,
        metadata: { platform: 'all', scope: 'window' },
      },
      {
        shortcutId: 'window.minimize',
        category: 'window',
        name: 'Minimize Window',
        description: 'Minimize the active window',
        keys: ['Alt', 'F9'],
        keyCombination: 'Alt+F9',
        action: 'minimizeWindow',
        isDefault: true,
        metadata: { platform: 'all', scope: 'window' },
      },
      {
        shortcutId: 'window.next',
        category: 'window',
        name: 'Next Window',
        description: 'Switch to next window',
        keys: ['Alt', 'Tab'],
        keyCombination: 'Alt+Tab',
        action: 'nextWindow',
        isDefault: true,
        metadata: { platform: 'all', scope: 'global' },
      },

      // App shortcuts
      {
        shortcutId: 'apps.notes',
        category: 'apps',
        name: 'Open Notes',
        description: 'Open Notes application',
        keys: ['Ctrl', 'Shift', 'n'],
        keyCombination: 'Ctrl+Shift+N',
        action: 'openApp:notes',
        isDefault: true,
        appId: 'notes',
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'apps.filemanager',
        category: 'apps',
        name: 'Open File Manager',
        description: 'Open File Manager application',
        keys: ['Ctrl', 'Shift', 'f'],
        keyCombination: 'Ctrl+Shift+F',
        action: 'openApp:filemanager',
        isDefault: true,
        appId: 'filemanager',
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'apps.calculator',
        category: 'apps',
        name: 'Open Calculator',
        description: 'Open Calculator application',
        keys: ['Ctrl', 'Shift', 'c'],
        keyCombination: 'Ctrl+Shift+C',
        action: 'openApp:calculator',
        isDefault: true,
        appId: 'calculator',
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'apps.browser',
        category: 'apps',
        name: 'Open Browser',
        description: 'Open Browser application',
        keys: ['Ctrl', 'Shift', 'b'],
        keyCombination: 'Ctrl+Shift+B',
        action: 'openApp:browser',
        isDefault: true,
        appId: 'browser',
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'apps.recyclebin',
        category: 'apps',
        name: 'Open Recycle Bin',
        description: 'Open Recycle Bin application',
        keys: ['Ctrl', 'Shift', 'r'],
        keyCombination: 'Ctrl+Shift+R',
        action: 'openApp:recyclebin',
        isDefault: true,
        appId: 'recyclebin',
        metadata: { platform: 'all', scope: 'global' },
      },
      {
        shortcutId: 'apps.clipboard',
        category: 'apps',
        name: 'Open Clipboard Manager',
        description: 'Open Clipboard Manager application',
        keys: ['Ctrl', 'Shift', 'v'],
        keyCombination: 'Ctrl+Shift+V',
        action: 'openApp:clipboard',
        isDefault: true,
        appId: 'clipboard',
        metadata: { platform: 'all', scope: 'global' },
      },

      // Editing shortcuts (for apps that support them)
      {
        shortcutId: 'editing.copy',
        category: 'editing',
        name: 'Copy',
        description: 'Copy selected content',
        keys: ['Ctrl', 'c'],
        keyCombination: 'Ctrl+C',
        action: 'copy',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.paste',
        category: 'editing',
        name: 'Paste',
        description: 'Paste from clipboard',
        keys: ['Ctrl', 'v'],
        keyCombination: 'Ctrl+V',
        action: 'paste',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.cut',
        category: 'editing',
        name: 'Cut',
        description: 'Cut selected content',
        keys: ['Ctrl', 'x'],
        keyCombination: 'Ctrl+X',
        action: 'cut',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.undo',
        category: 'editing',
        name: 'Undo',
        description: 'Undo last action',
        keys: ['Ctrl', 'z'],
        keyCombination: 'Ctrl+Z',
        action: 'undo',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.redo',
        category: 'editing',
        name: 'Redo',
        description: 'Redo last undone action',
        keys: ['Ctrl', 'y'],
        keyCombination: 'Ctrl+Y',
        action: 'redo',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.selectall',
        category: 'editing',
        name: 'Select All',
        description: 'Select all content',
        keys: ['Ctrl', 'a'],
        keyCombination: 'Ctrl+A',
        action: 'selectAll',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.find',
        category: 'editing',
        name: 'Find',
        description: 'Open find dialog',
        keys: ['Ctrl', 'f'],
        keyCombination: 'Ctrl+F',
        action: 'find',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
      {
        shortcutId: 'editing.save',
        category: 'editing',
        name: 'Save',
        description: 'Save current document',
        keys: ['Ctrl', 's'],
        keyCombination: 'Ctrl+S',
        action: 'save',
        isDefault: true,
        metadata: { platform: 'all', scope: 'app' },
      },
    ];
  }

  /**
   * Get all default shortcuts
   */
  getDefaultShortcuts() {
    return this.defaultShortcuts;
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category) {
    return this.defaultShortcuts.filter(shortcut => shortcut.category === category);
  }

  /**
   * Get shortcuts by app ID
   */
  getShortcutsByApp(appId) {
    return this.defaultShortcuts.filter(shortcut => shortcut.appId === appId);
  }

  /**
   * Get shortcuts by platform
   */
  getShortcutsByPlatform(platform) {
    return this.defaultShortcuts.filter(
      shortcut => shortcut.metadata.platform === platform || shortcut.metadata.platform === 'all'
    );
  }

  /**
   * Get current platform
   */
  getCurrentPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1) return 'mac';
    if (userAgent.indexOf('win') !== -1) return 'windows';
    if (userAgent.indexOf('linux') !== -1) return 'linux';
    return 'all';
  }

  /**
   * Get platform-specific shortcuts
   */
  getPlatformShortcuts() {
    const currentPlatform = this.getCurrentPlatform();
    return this.getShortcutsByPlatform(currentPlatform);
  }

  /**
   * Initialize default shortcuts for a user
   */
  async initializeUserShortcuts(userId) {
    const platformShortcuts = this.getPlatformShortcuts();
    
    // This would typically be called from the API to populate user shortcuts
    // For now, return the data that would be inserted
    return platformShortcuts.map(shortcut => ({
      ...shortcut,
      user: userId,
      isEnabled: true,
      usageCount: 0,
      lastUsed: null,
    }));
  }
}

export default new ShortcutRegistry();