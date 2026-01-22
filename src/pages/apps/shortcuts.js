import React, { useState } from 'react';
import KeyboardShortcutPanel from '@/components/KeyboardShortcutPanel';
import ShortcutEditor from '@/components/ShortcutEditor';

export default function ShortcutsPage() {
  const [editingShortcut, setEditingShortcut] = useState(null);

  return (
    <>
      <KeyboardShortcutPanel 
        onEditShortcut={setEditingShortcut}
      />
      {editingShortcut && (
        <ShortcutEditor
          shortcut={editingShortcut}
          onClose={() => setEditingShortcut(null)}
          onSave={(saved) => {
            console.log('Shortcut saved:', saved);
            setEditingShortcut(null);
          }}
        />
      )}
    </>
  );
}