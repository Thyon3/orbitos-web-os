import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const Terminal = () => {
  const { theme } = useTheme();
  const [history, setHistory] = useState([
    { type: 'output', content: 'Welcome to OrbitOS Terminal v1.0.0', timestamp: Date.now() },
    { type: 'output', content: 'Type "help" for available commands', timestamp: Date.now() }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState('~');
  const [user, setUser] = useState('user');
  const [host, setHost] = useState('orbitos');
  const [isMatrixMode, setIsMatrixMode] = useState(false);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Available commands
  const commands = {
    help: {
      description: 'Show available commands',
      execute: () => {
        return `Available commands:
  help     - Show this help message
  clear    - Clear terminal
  pwd      - Print working directory
  ls       - List directory contents
  cd       - Change directory
  mkdir    - Create directory
  touch     - Create empty file
  rm       - Remove file or directory
  cat      - Display file contents
  echo     - Display message
  date     - Show current date and time
  whoami   - Display current user
  uptime    - Show system uptime
  ps       - Show running processes
  kill      - Kill process
  nano     - Open text editor
  python    - Run Python interpreter
  node      - Run Node.js interpreter
  npm       - Run npm commands
  git       - Run git commands
  curl      - Transfer data from URL
  wget      - Download files from web
  ping      - Test network connectivity
  ifconfig  - Show network configuration
  df       - Show disk usage
  free      - Show memory usage
  top       - Show system processes
  reboot    - Reboot system
  shutdown  - Shutdown system`;
      }
    },

    clear: {
      description: 'Clear terminal',
      execute: () => {
        setHistory([]);
        return null;
      }
    },

    pwd: {
      description: 'Print working directory',
      execute: () => cwd
    },

    ls: {
      description: 'List directory contents',
      execute: (args) => {
        const files = ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Desktop', 'Projects'];
        const dirs = ['bin', 'etc', 'home', 'lib', 'opt', 'tmp', 'usr', 'var'];

        if (args.includes('-a')) {
          return [...dirs, ...files, '.hidden', '.config'].join('  ');
        } else if (args.includes('-l')) {
          return files.map(file => `drwxr-xr-x  2 ${user} ${user} 4096 Jan 1 12:00 ${file}`).join('\n');
        } else {
          return files.join('  ');
        }
      }
    },

    cd: {
      description: 'Change directory',
      execute: (args) => {
        if (!args[0] || args[0] === '~') {
          setCwd('~');
          return '';
        } else if (args[0] === '..') {
          setCwd(prev => prev.split('/').slice(0, -1).join('/') || '~');
          return '';
        } else if (args[0] === '/') {
          setCwd('/');
          return '';
        } else {
          setCwd(prev => prev === '~' ? `~/${args[0]}` : `${prev}/${args[0]}`);
          return '';
        }
      }
    },

    mkdir: {
      description: 'Create directory',
      execute: (args) => {
        if (!args[0]) {
          return 'mkdir: missing operand';
        }
        return `Directory '${args[0]}' created`;
      }
    },

    touch: {
      description: 'Create empty file',
      execute: (args) => {
        if (!args[0]) {
          return 'touch: missing file operand';
        }
        return `File '${args[0]}' created`;
      }
    },

    rm: {
      description: 'Remove file or directory',
      execute: (args) => {
        if (!args[0]) {
          return 'rm: missing operand';
        }
        if (args.includes('-rf')) {
          return `Removed '${args[args.length - 1]}' and all contents`;
        }
        return `Removed '${args[0]}'`;
      }
    },

    cat: {
      description: 'Display file contents',
      execute: (args) => {
        if (!args[0]) {
          return 'cat: missing file operand';
        }
        return `Contents of '${args[0]}':\nThis is a sample file content.\nLorem ipsum dolor sit amet.`;
      }
    },

    echo: {
      description: 'Display message',
      execute: (args) => args.join(' ')
    },

    date: {
      description: 'Show current date and time',
      execute: () => new Date().toString()
    },

    whoami: {
      description: 'Display current user',
      execute: () => user
    },

    fetch: {
      description: 'Display system information (neofetch)',
      execute: () => {
        return `
   #####     ${user}@${host}
  #######    --------------
  ##   ##    OS: OrbitOS v1.0.0
  ##   ##    Host: Virtual Machine
  ##   ##    Kernel: 5.15.0-orbit
  #######    Uptime: 2 days, 4 hours
   #####     Packages: 1240 (npm)
             Shell: orbitsh 1.0
             Resolution: 1920x1080
             Theme: Orbit-Dark
             CPU: Orbit Core v1 (8) @ 3.2GHz
             Memory: 2048MiB / 8192MiB
        `;
      }
    },

    uptime: {
      description: 'Show system uptime',
      execute: () => {
        const uptime = Date.now() - performance.timing.navigationStart;
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        return `System uptime: ${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
      }
    },

    ps: {
      description: 'Show running processes',
      execute: () => `  PID TTY          TIME CMD
 1234 pts/0    00:00:01 bash
 5678 pts/0    00:00:02 node
 9012 pts/0    00:00:03 chrome`
    },

    kill: {
      description: 'Kill process',
      execute: (args) => {
        if (!args[0]) {
          return 'kill: missing process ID';
        }
        return `Process ${args[0]} killed`;
      }
    },

    nano: {
      description: 'Open text editor',
      execute: (args) => {
        if (!args[0]) {
          return 'nano: missing filename';
        }
        // Open code editor
        window.dispatchEvent(new CustomEvent('open-code-editor', {
          detail: { filename: args[0] }
        }));
        return `Opening ${args[0]} in editor...`;
      }
    },

    python: {
      description: 'Run Python interpreter',
      execute: (args) => {
        if (args[0]) {
          return `Python ${args[0]} executed`;
        } else {
          return `Python 3.9.0 (default, Jan 1 2024, 00:00:00)
[GCC 8.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
        }
      }
    },

    node: {
      description: 'Run Node.js interpreter',
      execute: (args) => {
        if (args[0]) {
          return `Node.js ${args[0]} executed`;
        } else {
          return `Welcome to Node.js v18.17.0.
Type ".help" for more information.`;
        }
      }
    },

    npm: {
      description: 'Run npm commands',
      execute: (args) => {
        if (!args[0]) {
          return `Usage: npm <command>
where <command> is one of:
  access, adduser, audit, bin, bugs, c, cache, ci, cit,
  clean-install, clean-install-test, completion, config,
  create, ddp, dedupe, deprecate, diff, dist-tag,
  docs, doctor, edit, exec, explain, explore, find,
  find-dupes, fund, get, help, help-search, hook,
  i, init, install, install-ci-test, install-test,
  it, link, list, ln, login, logout, ls,
  org, outdated, owner, pack, ping, prefix,
  profile, prune, publish, rb, rebuild, repo,
  restart, root, run, run-script, s, se, search,
  set, shrinkwrap, star, stars, start, stop, t,
  team, test, token, ts, un, uninstall, unpublish,
  unstar, up, update, v, version, view, whoami`;
        }
        return `npm ${args.join(' ')} executed`;
      }
    },

    git: {
      description: 'Run git commands',
      execute: (args) => {
        if (!args[0]) {
          return `usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]`;
        }
        return `git ${args.join(' ')} executed`;
      }
    },

    curl: {
      description: 'Transfer data from URL',
      execute: (args) => {
        if (!args[0]) {
          return 'curl: no URL specified!';
        }
        return `Fetching data from ${args[0]}...`;
      }
    },

    wget: {
      description: 'Download files from web',
      execute: (args) => {
        if (!args[0]) {
          return 'wget: missing URL';
        }
        return `Downloading ${args[0]}...`;
      }
    },

    ping: {
      description: 'Test network connectivity',
      execute: (args) => {
        if (!args[0]) {
          return 'ping: missing host';
        }
        return `PING ${args[0]} (${args[0]}): 56 data bytes
64 bytes from ${args[0]}: icmp_seq=0 ttl=64 time=1.234 ms
64 bytes from ${args[0]}: icmp_seq=1 ttl=64 time=1.456 ms`;
      }
    },

    ifconfig: {
      description: 'Show network configuration',
      execute: () => `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a4  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a4  txqueuelen 1000  (Ethernet)
        RX packets 1234  bytes 123456 (123.4 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 5678  bytes 654321 (654.3 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`
    },

    df: {
      description: 'Show disk usage',
      execute: () => `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       1048540672 524288064 524252608  50% /
/dev/sda2       1048540672 262144032 786397640  25% /home`
    },

    free: {
      description: 'Show memory usage',
      execute: () => `              total        used        free      shared  buff/cache   available
Mem:           8192        2048        4096         256        2048        6144
Swap:          2048           0        2048`
    },

    top: {
      description: 'Show system processes',
      execute: () => `top - 12:34:56 up 1 day,  2:34,  2 users,  load average: 0.50, 0.30, 0.20
Tasks: 123 total,   1 running, 122 sleeping,   0 stopped,   0 zombie
%Cpu(s): 10.0 us,  5.0 sy,  0.0 ni, 85.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :   8192156 total,   2048000 used,   6144156 free,    256000 buffers
KiB Swap:   2097148 total,        0 used,   2097148 free.   1024000 cached`
    },

    reboot: {
      description: 'Reboot system',
      execute: () => {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return 'System rebooting in 2 seconds...';
      }
    },

    shutdown: {
      description: 'Shutdown system',
      execute: () => {
        setTimeout(() => {
          window.close();
        }, 2000);
        return 'System shutting down in 2 seconds...';
      }
    },

    matrix: {
      description: 'Enter the matrix',
      execute: () => {
        setIsMatrixMode(true);
        return 'Wake up, Neo... The Matrix has you.';
      }
    },

    exit: {
      description: 'Exit terminal or matrix mode',
      execute: () => {
        if (isMatrixMode) {
          setIsMatrixMode(false);
          return 'Exited the matrix.';
        }
        return 'Use window controls to close terminal.';
      }
    }
  };

  // Execute command
  const executeCommand = useCallback((input) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const [command, ...args] = trimmedInput.split(' ');
    const commandFunc = commands[command.toLowerCase()];

    // Add command to history
    setHistory(prev => [
      ...prev,
      { type: 'input', content: trimmedInput, timestamp: Date.now() }
    ]);

    if (commandFunc) {
      try {
        const output = commandFunc.execute(args);
        if (output !== null) {
          setHistory(prev => [
            ...prev,
            { type: 'output', content: output, timestamp: Date.now() }
          ]);
        }
      } catch (error) {
        setHistory(prev => [
          ...prev,
          { type: 'error', content: `Error: ${error.message}`, timestamp: Date.now() }
        ]);
      }
    } else {
      setHistory(prev => [
        ...prev,
        { type: 'error', content: `Command not found: ${command}`, timestamp: Date.now() }
      ]);
    }

    // Add to command history
    setCommandHistory(prev => [...prev, trimmedInput]);
    setHistoryIndex(-1);
  }, [commands]);

  // Handle input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    executeCommand(currentInput);
    setCurrentInput('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setCurrentInput('');
        }
        break;
      case 'Tab':
        e.preventDefault();
        // Simple tab completion
        const availableCommands = Object.keys(commands);
        const matches = availableCommands.filter(cmd => cmd.startsWith(currentInput));
        if (matches.length === 1) {
          setCurrentInput(matches[0]);
        } else if (matches.length > 1) {
          setHistory(prev => [
            ...prev,
            { type: 'output', content: matches.join('  '), timestamp: Date.now() }
          ]);
        }
        break;
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when clicking terminal
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`h-full flex flex-col font-mono text-sm transition-colors duration-1000 ${isMatrixMode
        ? 'bg-black !text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        : theme.app.bg
        }`}
      onClick={handleTerminalClick}
    >
      {/* Terminal header */}
      <div className={`flex items-center justify-between p-2 border-b ${theme.app.toolbar}`}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs">Terminal - {user}@{host}:{cwd}</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 terminal-content"
        style={{ minHeight: '200px' }}
      >
        {history.map((entry, index) => (
          <div key={index} className="mb-1">
            {entry.type === 'input' && (
              <div className="flex items-center">
                <span className="text-green-500 mr-2">
                  {user}@{host}:{cwd}$
                </span>
                <span>{entry.content}</span>
              </div>
            )}
            {entry.type === 'output' && (
              <div className={theme.text.primary}>{entry.content}</div>
            )}
            {entry.type === 'error' && (
              <div className="text-red-500">{entry.content}</div>
            )}
          </div>
        ))}

        {/* Current input */}
        <div className="flex items-center">
          <span className="text-green-500 mr-2">
            {user}@{host}:{cwd}$
          </span>
          <form onSubmit={handleSubmit} className="flex-1 flex">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent outline-none ${theme.text.primary}`}
              style={{ caretColor: 'currentColor' }}
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* Terminal footer */}
      <div className={`px-4 py-1 border-t ${theme.app.toolbar} text-xs ${theme.text.secondary}`}>
        <div className="flex justify-between">
          <span>Press Tab for autocomplete • ↑↓ for command history</span>
          <span>{history.length} lines in history</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
