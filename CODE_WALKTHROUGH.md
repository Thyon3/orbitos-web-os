# 🚀 OrbitOS Complete Code Walkthrough

> **Welcome!** This is your comprehensive, interactive guide to understanding every aspect of the OrbitOS codebase. Let's dive deep into how this amazing Web-based Operating System works!

---

## 📋 Table of Contents

- [🎯 What is OrbitOS?](#-what-is-orbitos)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [💻 Frontend Deep Dive](#-frontend-deep-dive)
  - [Tech Stack & Dependencies](#tech-stack--dependencies)
  - [Project Structure](#project-structure)
  - [Core Features](#core-features)
- [⚙️ Backend Deep Dive](#️-backend-deep-dive)
  - [API Architecture](#api-architecture)
  - [Database Models](#database-models)
  - [API Endpoints](#api-endpoints)
- [🎨 Feature Implementation Details](#-feature-implementation-details)
- [🧩 How Everything Works Together](#-how-everything-works-together)
- [📦 Package Dependencies Explained](#-package-dependencies-explained)

---

## 🎯 What is OrbitOS?

**OrbitOS** is a fully-featured, browser-based operating system that mimics a traditional desktop environment. Imagine Windows or macOS, but running entirely in your web browser! 

### Key Capabilities:
- ✅ **Windowed Applications** - Open, drag, resize, minimize, and maximize windows
- ✅ **Taskbar & Start Menu** - Just like a real OS!
- ✅ **Built-in Apps** - Notes editor, file manager, calculator, browser, and more
- ✅ **User Authentication** - Secure login/logout system
- ✅ **Customization** - Themes, wallpapers, and personalization
- ✅ **Advanced Features** - Clipboard management, keyboard shortcuts, notifications
- ✅ **Collaboration** - Real-time features using WebSockets

---

## 🏗️ Architecture Overview

OrbitOS uses a **Full-Stack JavaScript** architecture:

```
┌─────────────────────────────────────────────────────┐
│                  USER'S BROWSER                     │
│  ┌───────────────────────────────────────────────┐  │
│  │         Next.js Frontend (React)              │  │
│  │  - Pages, Components, State Management        │  │
│  │  - UI Rendering & User Interactions           │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTP/WebSocket
                     │
┌────────────────────▼────────────────────────────────┐
│              Next.js API Routes                     │
│  ┌───────────────────────────────────────────────┐  │
│  │    Express-style API Handlers                 │  │
│  │  - RESTful Endpoints                          │  │
│  │  - Authentication, Files, Notifications       │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │         MongoDB Database                      │  │
│  │  - User Data, Files, Settings, Notifications  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### The Flow:
1. **User interacts** with the frontend (clicks, types, drags windows)
2. **React components** update the UI and manage state
3. **API calls** are made to Next.js API routes when data needs to be saved/loaded
4. **Backend processes** the request, interacts with MongoDB
5. **Response** is sent back to the frontend
6. **UI updates** to reflect the new state

---

## 💻 Frontend Deep Dive

### Tech Stack & Dependencies

#### 🛠️ Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.18 | React framework with built-in routing, SSR, and API routes |
| **React** | 18.3.1 | UI library for building interactive components |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework for rapid styling |
| **Framer Motion** | 11.0.0 | Animation library for smooth transitions |

#### 📦 Frontend Packages Explained

```json
{
  "@heroicons/react": "^2.2.0",        // Beautiful SVG icons for UI
  "framer-motion": "^11.0.0",          // Smooth animations for windows, transitions
  "lucide-react": "^0.300.0",          // Additional icon library
  "react-quill": "^2.0.0",             // Rich text editor for Notes app
  "quill-delta": "^5.1.0",             // Quill's data format for text editing
  "idb": "^8.0.0",                     // IndexedDB wrapper for client-side storage
  "socket.io-client": "^4.7.2"         // Real-time communication with server
}
```

**Let's break down why each package is important:**

1. **@heroicons/react** - Provides all those beautiful icons you see (trash can, settings gear, etc.)
2. **framer-motion** - Powers the smooth window opening/closing animations, drag animations
3. **lucide-react** - Additional icons for more variety
4. **react-quill** - The Notes app's rich text editor (bold, italic, headers, etc.)
5. **idb** - Stores data locally in the browser (like recent files, settings)
6. **socket.io-client** - Enables real-time features like live collaboration

---

### Project Structure

```
src/
├── pages/                      # Next.js pages (routes)
│   ├── _app.js                 # App wrapper with all providers
│   ├── index.js                # Main desktop page
│   ├── api/                    # Backend API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── files/              # File management
│   │   ├── notifications/      # Notification system
│   │   ├── wallpapers/         # Wallpaper management
│   │   ├── clipboard/          # Clipboard operations
│   │   └── ...
│   └── apps/                   # Individual app pages
│       ├── notes.js
│       ├── browser.js
│       ├── settings.js
│       └── ...
│
├── components/                 # Reusable React components
│   ├── Desktop.js              # Main desktop container
│   ├── Taskbar.js              # Bottom taskbar
│   ├── Window.js               # Window component
│   ├── AppIcon.js              # Desktop icons
│   ├── GlobalSearch.js         # Search overlay
│   ├── NotificationCenter.js   # Notification panel
│   └── ...
│
├── context/                    # React Context (state management)
│   ├── AppContext.js           # App/window state
│   ├── AuthContext.js          # User authentication
│   ├── ThemeContext.js         # Dark/light theme
│   ├── WallpaperContext.js     # Wallpaper management
│   ├── ClipboardContext.js     # Clipboard state
│   ├── ShortcutContext.js      # Keyboard shortcuts
│   └── ...
│
├── hooks/                      # Custom React hooks
│   ├── useWindowDrag.js        # Window dragging logic
│   ├── useWindowResize.js      # Window resizing
│   ├── useGlobalShortcuts.js   # Keyboard shortcuts
│   └── ...
│
├── system/                     # Core OS functionality
│   ├── apps/                   # App definitions
│   │   ├── App.js              # Base app class
│   │   ├── NotesApp.js
│   │   ├── BrowserApp.js
│   │   └── ...
│   ├── services/               # System services
│   │   ├── AppRegistry.js      # App registration
│   │   └── NotificationRegistry.js
│   └── config/                 # Configuration files
│
├── models/                     # Database models (Mongoose)
│   ├── User.js
│   ├── File.js
│   ├── Notification.js
│   └── ...
│
├── themes/                     # Theme definitions
│   ├── lightTheme.js
│   └── darkTheme.js
│
└── utils/                      # Utility functions
```

---

### Core Features

#### 🪟 **1. Window Management System**

**How it works:**

The window system is the heart of OrbitOS. Here's the magic behind it:

**Components Involved:**
- `src/components/Window.js` - The actual window component
- `src/context/AppContext.js` - Manages all open windows
- `src/hooks/useWindowDrag.js` - Handles dragging
- `src/hooks/useWindowResize.js` - Handles resizing

**The Flow:**

```javascript
// When you click an app icon:
1. AppIcon.js triggers openApp(appId)
   ↓
2. AppContext creates a new window object:
   {
     id: 'notes-1234',
     appId: 'notes',
     position: { x: 100, y: 100 },
     size: { width: 800, height: 600 },
     isMinimized: false,
     isMaximized: false,
     zIndex: 10
   }
   ↓
3. Desktop.js renders Window component
   ↓
4. Window component uses:
   - useWindowDrag() for dragging
   - useWindowResize() for resizing
   - Framer Motion for animations
```

**Technologies Used:**
- **React State** - Track window position, size, state
- **Framer Motion** - Smooth animations
- **CSS Transform** - For positioning (better performance than absolute positioning)
- **Event Listeners** - Mouse down/move/up for drag operations

---

#### 🎨 **2. Theme System**

**Location:** `src/themes/`

The theme system is brilliantly simple but powerful!

**How it works:**

```javascript
// lightTheme.js
export const lightTheme = {
  bg: 'bg-gray-100',           // Desktop background
  text: 'text-gray-900',       // Primary text
  window: 'bg-white shadow-xl', // Window styling
  taskbar: 'bg-white/80 backdrop-blur-lg', // Taskbar
  // ... many more properties
};

// darkTheme.js  
export const darkTheme = {
  bg: 'bg-gray-900',
  text: 'text-gray-100',
  window: 'bg-gray-800 shadow-2xl',
  taskbar: 'bg-black/30 backdrop-blur-lg',
  // ... same structure, different values
};
```

**Usage in components:**

```javascript
// Any component can use themes:
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme } = useTheme(); // theme is either lightTheme or darkTheme
  
  return (
    <div className={theme.window}>  {/* Uses current theme */}
      <p className={theme.text}>Hello!</p>
    </div>
  );
}
```

**Technologies:**
- **Tailwind CSS** - All the actual styling
- **React Context** - Global theme state
- **CSS Classes** - Dynamic class switching

---

#### 📋 **3. Taskbar & Start Menu**

**Location:** `src/components/Taskbar.js`

This is that familiar bottom bar you see on every OS!

**Features:**
- **Start Button** - Opens the app launcher
- **Running Apps** - Shows minimized/open apps
- **System Tray** - Clock, notifications, user profile
- **Window Grouping** - Multiple windows of the same app group together

**How window grouping works:**

```javascript
// In Taskbar.js
const groupedApps = windows.reduce((groups, window) => {
  const appId = window.appId;
  if (!groups[appId]) {
    groups[appId] = [];
  }
  groups[appId].push(window);
  return groups;
}, {});

// Result: { 
//   'notes': [window1, window2, window3],
//   'browser': [window4]
// }
```

When you click a taskbar button:
- If app has 1 window → Focuses/minimizes that window
- If app has multiple windows → Shows a popup to select which window

**Technologies:**
- **React State** - Track open apps
- **Framer Motion** - Slide-up animations for tooltips
- **Tailwind** - Glassmorphism effect (`backdrop-blur-lg`)

---

#### 🔔 **4. Notification System**

**Location:** 
- `src/system/services/NotificationRegistry.js` - Core logic
- `src/components/NotificationCenter.js` - Notification panel
- `src/components/NotificationToast.js` - Toast notifications

This is a **dual-mode notification system**:

1. **Toast Notifications** - Temporary popups (top-right corner)
2. **Persistent Notifications** - Saved in database, viewable in Notification Center

**How it works:**

```javascript
// To show a notification:
import { useNotification } from '@/system/services/NotificationRegistry';

function MyApp() {
  const { showNotification } = useNotification();
  
  // Simple toast:
  showNotification('File saved!', 'success', 3000);
  
  // Persistent notification:
  createNotification({
    title: 'New message',
    message: 'You have a new message',
    type: 'info',
    isPersistent: true,  // Saves to database
    category: 'messages'
  });
}
```

**Features:**
- Auto-dismissal with countdown
- Pause on hover
- Sound effects (optional)
- Browser notifications (if permitted)
- Categorization and filtering
- Read/unread status

**Technologies:**
- **React Context** - Global notification state
- **MongoDB** - Store persistent notifications
- **Browser Notification API** - System notifications
- **Web Audio API** - Notification sounds

---

#### ⌨️ **5. Keyboard Shortcuts**

**Location:**
- `src/context/ShortcutContext.js` - Shortcut state
- `src/hooks/useGlobalShortcuts.js` - Shortcut detection
- `src/components/KeyboardShortcutPanel.js` - Settings UI

This system allows you to register and use keyboard shortcuts anywhere!

**Default Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file/document |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save as |
| `Ctrl+W` | Close window |
| `Ctrl+F` | Find |
| `Ctrl+Shift+F` | Global search |
| `Alt+F4` | Close app |

**How it detects combinations:**

```javascript
// useGlobalShortcuts.js
useEffect(() => {
  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    const modifiers = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey
    };
    
    // Match against registered shortcuts
    const shortcut = findMatchingShortcut(key, modifiers);
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [shortcuts]);
```

**Technologies:**
- **Keyboard Events** - Browser keyboard API
- **Event Listeners** - Global key detection
- **LocalStorage** - Save custom shortcuts

---

#### 📁 **6. File System & File Manager**

**Location:**
- `src/pages/apps/filemanager.js` - File manager app
- `src/pages/api/files/` - File API endpoints
- `src/models/File.js` - File database model

OrbitOS has a virtual file system stored in MongoDB!

**File Structure:**

```javascript
// Each file is stored as:
{
  _id: '507f1f77bcf86cd799439011',
  name: 'document.txt',
  type: 'text/plain',
  size: 1024,  // bytes
  path: '/documents/work/',
  content: 'base64encodedcontent...',
  owner: 'user-id-here',
  createdAt: '2024-01-01T00:00:00.000Z',
  modifiedAt: '2024-01-02T00:00:00.000Z',
  isDeleted: false,
  deletedAt: null
}
```

**Operations:**
- **Upload** - Uses `multer` package to handle file uploads
- **Download** - Converts stored content back to file
- **Delete** - Soft delete (moves to recycle bin)
- **Restore** - Restore from recycle bin
- **Permanent Delete** - Remove from database

**Technologies:**
- **multer** - File upload handling
- **MongoDB GridFS** - Store large files
- **Base64** - Encode file content
- **File API** - Browser file handling

---

#### 🖼️ **7. Wallpaper System**

**Location:**
- `src/context/WallpaperContext.js` - Wallpaper state
- `src/components/WallpaperManager.js` - Settings UI
- `src/pages/api/wallpapers/` - Wallpaper API

**Features:**
- **Pre-loaded Wallpapers** - Collection of default wallpapers
- **Custom Upload** - Upload your own images
- **Effects** - Apply blur, brightness, contrast
- **Slideshow** - Auto-change wallpapers
- **Per-user** - Each user has their own wallpaper

**How wallpaper changes work:**

```javascript
// WallpaperContext.js
const changeWallpaper = async (wallpaperId) => {
  // 1. Update local state (instant visual change)
  setCurrentWallpaper(wallpaperId);
  
  // 2. Save to database
  await fetch('/api/wallpapers/set', {
    method: 'POST',
    body: JSON.stringify({ wallpaperId })
  });
  
  // 3. Apply any effects (blur, brightness)
  applyEffects(wallpaper.effects);
};
```

**Technologies:**
- **CSS Background** - Display wallpaper
- **Canvas API** - Apply visual effects
- **File Upload** - Custom wallpapers
- **MongoDB** - Store wallpaper metadata

---

#### 📋 **8. Clipboard Manager**

**Location:**
- `src/context/ClipboardContext.js` - Clipboard state
- `src/components/ClipboardManager.js` - UI
- `src/pages/api/clipboard/` - API endpoints

A powerful clipboard that stores history!

**Features:**
- **History** - Last 50 copied items
- **Types** - Text, images, files, code
- **Search** - Find copied items
- **Pin** - Keep important items
- **Sync** - Clipboard syncs across tabs

**How it captures clipboard:**

```javascript
// useClipboardListener.js
useEffect(() => {
  async function handleCopy(event) {
    // Get clipboard data
    const items = event.clipboardData.items;
    
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        // Handle image
        const blob = item.getAsFile();
        const dataUrl = await blobToDataUrl(blob);
        addToClipboard({ type: 'image', content: dataUrl });
      } else if (item.type === 'text/plain') {
        // Handle text
        const text = await item.getAsString();
        addToClipboard({ type: 'text', content: text });
      }
    }
  }
  
  document.addEventListener('copy', handleCopy);
  document.addEventListener('cut', handleCopy);
}, []);
```

**Technologies:**
- **Clipboard API** - Browser clipboard access
- **Blob API** - Handle copied images
- **IndexedDB** - Local clipboard storage
- **MongoDB** - Sync clipboard to server

---

#### 🔍 **9. Global Search**

**Location:**
- `src/context/SearchContext.js` - Search state
- `src/components/GlobalSearch.js` - Search UI
- `src/pages/api/search/` - Search API

Press `Ctrl+Shift+F` to search everything in OrbitOS!

**What it searches:**
- **Files** - File names and content
- **Apps** - Installed applications
- **Settings** - System settings
- **Shortcuts** - Keyboard shortcuts
- **Notifications** - Past notifications

**Search algorithm:**

```javascript
// search/index.js API route
async function search(query) {
  const results = [];
  
  // Search files
  const files = await File.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } }
    ]
  });
  
  // Search apps
  const apps = AppRegistry.apps.filter(app =>
    app.name.toLowerCase().includes(query.toLowerCase())
  );
  
  // Combine and score results
  return rankResults([...files, ...apps]);
}
```

**Technologies:**
- **MongoDB Text Search** - Full-text indexing
- **Fuzzy Matching** - Typo-tolerant search
- **Debouncing** - Wait for user to stop typing
- **React Portal** - Render search overlay

---

#### 🔐 **10. Authentication System**

**Location:**
- `src/context/AuthContext.js` - Auth state
- `src/pages/api/auth/` - Auth endpoints
- `src/models/User.js` - User model
- `src/components/auth/` - Login/Register UI

**How authentication works:**

```
1. User enters credentials
   ↓
2. POST /api/auth/login
   ↓
3. Server validates credentials (bcrypt)
   ↓
4. Generate JWT token
   ↓
5. Set HTTP-only cookie
   ↓
6. Return user data
   ↓
7. Update AuthContext
   ↓
8. Redirect to desktop
```

**Security features:**
- **bcryptjs** - Password hashing (10 rounds)
- **JWT** - Stateless authentication
- **HTTP-only cookies** - Secure token storage
- **CORS protection** - Prevent unauthorized access
- **Rate limiting** - Prevent brute force attacks

**Technologies:**
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT creation/verification
- **cookie-parser** - Parse auth cookies
- **express-validator** - Input validation

---

#### ⚡ **11. Real-time Collaboration**

**Location:**
- `src/context/CollaborationContext.js` - Collaboration state
- `src/pages/api/socket/` - WebSocket server

**Features:**
- **Live Cursors** - See other users' cursors
- **Shared Editing** - Edit documents together
- **Presence** - See who's online
- **Chat** - Built-in messaging

**How WebSocket works:**

```javascript
// Server side (socket/index.js)
io.on('connection', (socket) => {
  // User joins a document room
  socket.on('join-document', (docId) => {
    socket.join(`doc:${docId}`);
  });
  
  // User makes an edit
  socket.on('edit', (data) => {
    // Broadcast to everyone else in the room
    socket.to(`doc:${data.docId}`).emit('remote-edit', data);
  });
});

// Client side (CollaborationContext.js)
useEffect(() => {
  socket.on('remote-edit', (data) => {
    // Apply the edit locally
    applyEdit(data);
  });
}, []);
```

**Technologies:**
- **Socket.IO** - WebSocket library
- **Socket.IO Client** - Frontend WebSocket
- **Operational Transformation** - Conflict resolution
- **Quill Delta** - Text operation format

---

## ⚙️ Backend Deep Dive

### API Architecture

OrbitOS uses **Next.js API Routes**, which means the backend is built right into Next.js!

**File structure:**

```
src/pages/api/
├── auth/
│   ├── login.js          # POST - User login
│   ├── register.js       # POST - User registration
│   ├── logout.js         # POST - User logout
│   ├── me.js             # GET - Current user info
│   └── ...
├── files/
│   ├── index.js          # GET - List files, POST - Upload
│   ├── [id].js           # GET - Download, DELETE - Delete
│   └── ...
├── notifications/
│   ├── index.js          # GET - List, POST - Create
│   └── [id].js           # PATCH - Update, DELETE - Delete
├── wallpapers/
├── clipboard/
├── search/
└── health.js             # GET - Server health check
```

**How API routes work:**

```javascript
// pages/api/files/index.js
export default async function handler(req, res) {
  // Check authentication
  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Handle different HTTP methods
  if (req.method === 'GET') {
    // List files
    const files = await File.find({ owner: user._id });
    return res.json({ files });
  } 
  else if (req.method === 'POST') {
    // Upload file
    const file = await File.create({
      ...req.body,
      owner: user._id
    });
    return res.json({ file });
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

### Database Models

OrbitOS uses **MongoDB** with **Mongoose** for data modeling.

#### **User Model** (`src/models/User.js`)

```javascript
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Hashed with bcrypt
  avatar: { type: String },
  settings: {
    theme: { type: String, default: 'dark' },
    wallpaper: { type: String },
    notifications: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});
```

#### **File Model** (`src/models/File.js`)

```javascript
const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, default: '/' },
  content: { type: String },  // Base64 or GridFS reference
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});
```

#### **Notification Model** (`src/models/Notification.js`)

```javascript
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  category: { type: String },
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actions: [{
    label: String,
    action: String  // URL or function name
  }],
  createdAt: { type: Date, default: Date.now }
});
```

#### **Wallpaper Model** (`src/models/Wallpaper.js`)

```javascript
const WallpaperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  category: { type: String },
  isDefault: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  effects: {
    blur: { type: Number, default: 0 },
    brightness: { type: Number, default: 100 },
    contrast: { type: Number, default: 100 }
  },
  createdAt: { type: Date, default: Date.now }
});
```

---

### API Endpoints

#### **Authentication Endpoints**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `{ username, email, password }` | `{ user, token }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` | `{ user, token }` |
| POST | `/api/auth/logout` | Logout user | None | `{ success: true }` |
| GET | `/api/auth/me` | Get current user | None | `{ user }` |
| PATCH | `/api/auth/profile` | Update profile | `{ username, avatar, ... }` | `{ user }` |

#### **File Management Endpoints**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/files` | List all files | Query: `?path=/documents` | `{ files: [] }` |
| POST | `/api/files` | Upload file | FormData with file | `{ file }` |
| GET | `/api/files/[id]` | Download file | None | File content |
| PATCH | `/api/files/[id]` | Update file | `{ name, content, ... }` | `{ file }` |
| DELETE | `/api/files/[id]` | Delete file | None | `{ success: true }` |

#### **Notification Endpoints**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/notifications` | List notifications | Query: `?status=unread` | `{ notifications: [], unreadCount }` |
| POST | `/api/notifications` | Create notification | `{ title, message, type, ... }` | `{ notification }` |
| PATCH | `/api/notifications/[id]` | Update notification | `{ isRead: true }` | `{ notification }` |
| DELETE | `/api/notifications/[id]` | Delete notification | None | `{ success: true }` |
| PATCH | `/api/notifications` | Bulk action | `{ action: 'markAllRead' }` | `{ success: true }` |

#### **Wallpaper Endpoints**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/wallpapers` | List wallpapers | None | `{ wallpapers: [] }` |
| POST | `/api/wallpapers` | Upload wallpaper | FormData with image | `{ wallpaper }` |
| POST | `/api/wallpapers/set` | Set active wallpaper | `{ wallpaperId }` | `{ success: true }` |
| DELETE | `/api/wallpapers/[id]` | Delete wallpaper | None | `{ success: true }` |

---

## 🎨 Feature Implementation Details

### Let's Build a Feature Together: Adding a New App

Want to understand how to add a new app? Let's create a simple "Timer" app!

#### **Step 1: Create the App UI Component**

```javascript
// src/pages/apps/timer.js
import React, { useState, useEffect } from 'react';

export default function TimerApp() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Timer</h1>
      <div className="text-6xl font-mono mb-4">
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
      </div>
      <button 
        onClick={() => setIsRunning(!isRunning)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button 
        onClick={() => { setSeconds(0); setIsRunning(false); }}
        className="px-4 py-2 bg-red-500 text-white rounded ml-2"
      >
        Reset
      </button>
    </div>
  );
}
```

#### **Step 2: Create the App Definition**

```javascript
// src/system/apps/TimerApp.js
import App from './App';

export default new App({
  id: 'timer',
  name: 'Timer',
  icon: '⏱️',
  component: 'TimerApp',  // Must match the import name
  defaultSize: { width: 400, height: 300 },
  resizable: true,
  minimizable: true
});
```

#### **Step 3: Register the App**

```javascript
// src/system/services/AppRegistry.js
import TimerApp from '../apps/TimerApp';
// ... other imports

class AppRegistry {
  constructor() {
    this.apps = [
      // ... existing apps
      TimerApp,  // Add your app here
    ];
  }
}
```

#### **Step 4: Map the Component**

```javascript
// src/components/Desktop.js
import TimerApp from '@/pages/apps/timer';  // Import the component
// ... other imports

const appComponents = {
  // ... existing mappings
  TimerApp: TimerApp,  // Map the component
};
```

**Done!** Your Timer app is now available in OrbitOS! 🎉

---

## 🧩 How Everything Works Together

Let's trace a complete user action from start to finish:

### Scenario: User clicks "Notes" icon and types "Hello World"

```
┌────────────────────────────────────────────────────────────┐
│  1. User clicks Notes icon on desktop                      │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  2. AppIcon.js onClick handler                             │
│     → calls openApp('notes')                               │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  3. AppContext.openApp()                                   │
│     → Creates new window object                            │
│     → Adds to windows array                                │
│     → Triggers re-render                                   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  4. Desktop.js re-renders                                  │
│     → Maps over windows array                              │
│     → Renders Window component                             │
│     → Loads NotesApp inside window                         │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  5. Window renders with Framer Motion animation            │
│     → Slide up + fade in                                   │
│     → Position set from window.position                    │
│     → useWindowDrag() attaches drag handlers               │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  6. NotesApp loads inside Window                           │
│     → Quill editor initializes                             │
│     → Empty document ready                                 │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  7. User types "Hello World"                               │
│     → Quill editor captures input                          │
│     → Updates editor state                                 │
│     → Auto-save timer starts (if enabled)                  │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  8. User presses Ctrl+S                                    │
│     → useGlobalShortcuts detects key combination           │
│     → Calls save handler                                   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  9. Save handler executes                                  │
│     → Gets editor content (Quill Delta format)             │
│     → Converts to HTML                                     │
│     → Calls POST /api/files                                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  10. API Route Handler (pages/api/files/index.js)         │
│      → Validates authentication                            │
│      → Creates File document in MongoDB                    │
│      → Returns file metadata                               │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  11. NotesApp receives response                            │
│      → Updates file state                                  │
│      → Shows notification "File saved!"                    │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  12. NotificationRegistry shows toast                      │
│      → Creates notification object                         │
│      → Adds to notification array                          │
│      → NotificationToaster renders                         │
│      → Plays sound (if enabled)                            │
│      → Auto-dismiss after 5 seconds                        │
└────────────────────────────────────────────────────────────┘
```

**Technologies used in this flow:**
1. React State Management
2. Context API
3. Framer Motion
4. Quill Editor
5. Custom Hooks
6. Next.js API Routes
7. MongoDB/Mongoose
8. JWT Authentication
9. Notification System
10. Sound Effects

---

## 📦 Package Dependencies Explained

### Frontend Packages

```json
{
  "next": "14.2.18"
}
```
**Why Next.js?**
- Built-in routing (pages/ folder = automatic routes)
- API routes (backend in the same project)
- Server-side rendering (faster initial load)
- Image optimization
- Built-in TypeScript support (if we want it later)

---

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1"
}
```
**Why React?**
- Component-based architecture (reusable UI pieces)
- Virtual DOM (fast updates)
- Huge ecosystem of libraries
- Easy state management with hooks

---

```json
{
  "framer-motion": "11.0.0"
}
```
**Why Framer Motion?**
- Best animation library for React
- Simple API for complex animations
- Gestures (drag, hover, tap)
- Layout animations (automatic smooth resizing)

**Example usage:**
```javascript
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}
  drag
  dragConstraints={{ left: 0, right: 1000 }}
>
  Window content
</motion.div>
```

---

```json
{
  "react-quill": "^2.0.0",
  "quill-delta": "^5.1.0"
}
```
**Why React-Quill?**
- Full-featured rich text editor
- Supports formatting (bold, italic, headers, lists)
- Toolbar customization
- Delta format for collaborative editing

---

```json
{
  "socket.io-client": "^4.7.2"
}
```
**Why Socket.IO Client?**
- Real-time bidirectional communication
- Automatic reconnection
- Room support (join specific document/chat)
- Fallback to polling if WebSocket unavailable

---

### Backend Packages

```json
{
  "express": "^4.18.2"
}
```
**Why Express?**
- Minimal web framework
- Middleware system
- Routing
- Used by Next.js API routes internally

---

```json
{
  "mongoose": "^8.0.0"
}
```
**Why Mongoose?**
- MongoDB object modeling
- Schema validation
- Built-in casting
- Middleware (pre/post hooks)
- Query building

---

```json
{
  "bcryptjs": "^2.4.3"
}
```
**Why bcryptjs?**
- Secure password hashing
- Salt rounds prevent rainbow table attacks
- Slow by design (prevents brute force)

**Usage:**
```javascript
// Hash password
const hash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

---

```json
{
  "jsonwebtoken": "^9.0.2"
}
```
**Why JWT?**
- Stateless authentication
- Contains user info in token
- No server-side session storage needed
- Can set expiration

**Usage:**
```javascript
// Create token
const token = jwt.sign({ userId: user._id }, SECRET, {
  expiresIn: '7d'
});

// Verify token
const decoded = jwt.verify(token, SECRET);
```

---

```json
{
  "multer": "^1.4.5-lts.1"
}
```
**Why Multer?**
- Handle multipart/form-data (file uploads)
- Memory or disk storage
- File filtering (size, type)
- Multiple file uploads

---

```json
{
  "helmet": "^7.1.0"
}
```
**Why Helmet?**
- Security headers
- XSS protection
- Clickjacking prevention
- Content Security Policy

---

```json
{
  "cors": "^2.8.5"
}
```
**Why CORS?**
- Cross-Origin Resource Sharing
- Allow frontend domain to access API
- Configure allowed methods/headers

---

```json
{
  "express-rate-limit": "^7.1.5"
}
```
**Why Rate Limiting?**
- Prevent abuse/DDoS
- Limit requests per IP
- Protect login endpoints

**Usage:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

### Development Packages

```json
{
  "prettier": "^3.1.1"
}
```
**Why Prettier?**
- Automatic code formatting
- Consistent code style
- Integrates with editors

---

```json
{
  "@commitlint/cli": "^18.4.3",
  "@commitlint/config-conventional": "^18.4.3"
}
```
**Why Commitlint?**
- Enforce commit message format
- Example: `feat: add timer app`
- Helps with changelog generation

---

```json
{
  "husky": "^8.0.3"
}
```
**Why Husky?**
- Git hooks
- Run tests before commit
- Lint code before push
- Format code automatically

---

## 🎓 Learning Path

If you're new to this codebase, here's the recommended order to study:

### Beginner Level
1. **Start with themes** (`src/themes/`) - Simple objects, easy to understand
2. **Study a simple component** (`src/components/AppIcon.js`) - See how React works
3. **Look at Context** (`src/context/ThemeContext.js`) - Learn state management
4. **Explore an app** (`src/pages/apps/calculator.js`) - Complete feature

### Intermediate Level
5. **Window system** (`src/components/Window.js` + hooks) - More complex
6. **Taskbar** (`src/components/Taskbar.js`) - Multiple features together
7. **Desktop** (`src/components/Desktop.js`) - Brings everything together
8. **API routes** (`src/pages/api/auth/`) - Backend basics

### Advanced Level
9. **AppContext** (`src/context/AppContext.js`) - Complex state management
10. **Notification system** - Full-stack feature
11. **Collaboration** - Real-time features
12. **Security** - Authentication, authorization

---

## 💡 Common Questions

### Q: Why Next.js instead of plain React?
**A:** Next.js gives us:
- Built-in routing (no need for React Router)
- API routes (backend in same project)
- Better performance (SSR, code splitting)
- Easier deployment (Vercel)

### Q: Why MongoDB instead of SQL?
**A:** MongoDB is:
- Flexible schema (good for rapid development)
- JSON-like documents (matches JavaScript objects)
- Easy to scale
- Great for document storage (files, settings)

### Q: Could we use TypeScript instead of JavaScript?
**A:** Yes! Next.js supports TypeScript out of the box. To migrate:
1. Rename `.js` files to `.tsx` (for components) or `.ts` (for utilities)
2. Add type annotations
3. Install `@types` packages

### Q: How do I debug the app?
**A:**
1. **Frontend:** Use React DevTools browser extension
2. **State:** Add `console.log` in Context providers
3. **API:** Check Network tab in browser DevTools
4. **Database:** Use MongoDB Compass to view data

### Q: How can I improve performance?
**A:**
1. Use `React.memo()` for expensive components
2. Implement virtual scrolling for long lists
3. Lazy load apps (only load when opened)
4. Use IndexedDB for local caching
5. Optimize images with Next.js Image component

---

## 🚀 Next Steps

Now that you understand the codebase, you can:

1. **Add a new app** - Follow the Timer example above
2. **Customize themes** - Edit `src/themes/`
3. **Add API endpoints** - Create new routes in `src/pages/api/`
4. **Improve existing features** - Add features to current apps
5. **Fix bugs** - Check GitHub issues
6. **Optimize performance** - Profile and improve slow parts

---

## 📚 Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion
- **MongoDB:** https://www.mongodb.com/docs
- **Socket.IO:** https://socket.io/docs

---

## 🎉 Conclusion

OrbitOS is a complex but well-architected application that demonstrates:
- **Modern React patterns** (Hooks, Context, functional components)
- **Full-stack development** (Frontend + Backend in one project)
- **Real-world features** (Auth, file system, real-time collaboration)
- **Production-ready code** (Security, validation, error handling)

You now have a complete understanding of:
- ✅ Frontend technologies and architecture
- ✅ Backend API design and implementation
- ✅ How data flows through the application
- ✅ Every major feature and how it works
- ✅ Package dependencies and their purposes

**Happy coding!** 🚀

---

*Last updated: January 23, 2026*
*Document version: 1.0*
*Questions? Check the code or ask the development team!*
