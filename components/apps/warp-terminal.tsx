// biome-ignore lint/a11y/useButtonType: Interactive terminal component
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import OSWindow from '@/components/os-window'
import { ChevronRight, Plus } from 'lucide-react'
import { Streamdown } from 'streamdown'

interface TerminalBlock {
  id: string
  cwd: string
  command: string
  output: string[]
  durationMs?: number
  isStreaming?: boolean
  streamContent?: string
}

interface FileEntry {
  name: string;
  isDir?: boolean;
  content?: string;
  size?: number;
  permissions?: string;
}

interface WarpTerminalProps {
  onClose: () => void
}

const mockFileContents: Record<string, string> = {
  '/home/kyle/README.md': `# Welcome to My Terminal

This is a simulated terminal environment.
Try running some commands:

- \`ls\` - List directory contents
- \`cd\` - Change directory
- \`cat\` - View file contents
- \`git status\` - Check git status
- \`npm list\` - List installed packages
- \`curl\` - Make HTTP requests
- \`history\` - Show command history

## Available Commands
- help, ls, cd, pwd, clear, echo, date
- cat, head, tail, grep
- git status, git log, git add, git commit
- npm install, npm list, npm start
- curl, wget
- ps, which, find
- mkdir, touch, rm, cp, mv
- history, !, !!`,

  '/home/kyle/warp/Cargo.toml': `[package]
name = "warp-terminal"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
anyhow = "1.0"
thiserror = "1.0"

[dev-dependencies]
cargo-watch = "8.4.0"`,

  '/home/kyle/warp/README.md': `# Warp Terminal

A modern, Rust-based terminal with AI assistance.

## Features
- AI-powered command suggestions
- Lightning-fast performance
- Modern UI with GPU acceleration
- Cross-platform support

## Installation
\`\`\`bash
cargo install warp-terminal
\`\`\`

## Usage
\`\`\`bash
warp
\`\`\``,

  '/home/kyle/warp/app/main.rs': `use anyhow::Result;
use std::env;

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("Usage: {} <command>", args[0]);
        return Ok(());
    }

    match args[1].as_str() {
        "hello" => {
            println!("Hello from Warp Terminal!");
        }
        "status" => {
            println!("Warp Terminal is running...");
        }
        _ => {
            println!("Unknown command: {}", args[1]);
        }
    }

    Ok(())
}`,

  '/home/kyle/warp/app/commands.rs': `use std::collections::HashMap;

pub struct CommandHandler {
    commands: HashMap<String, Box<dyn Fn(Vec<String>) -> String>>,
}

impl CommandHandler {
    pub fn new() -> Self {
        let mut commands = HashMap::new();

        commands.insert("hello".to_string(), Box::new(|_| "Hello from Warp!".to_string()));
        commands.insert("version".to_string(), Box::new(|_| "Warp Terminal v1.0.0".to_string()));

        Self { commands }
    }

    pub fn handle(&self, cmd: String, args: Vec<String>) -> String {
        if let Some(handler) = self.commands.get(&cmd) {
            handler(args)
        } else {
            format!("Command not found: {}", cmd)
        }
    }
}`,

  '/home/kyle/.bashrc': `# ~/.bashrc: executed by bash(1) for non-login shells.

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Check window size
shopt -s checkwinsize

# Set prompt
PS1='\\u@\\h:\\w\\$ '

# Enable color support for ls
alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Useful aliases
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Set editor
export EDITOR=nano

# Enable completion
if [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
fi`,

  '/home/kyle/warp/package.json': `{
  "name": "warp-terminal",
  "version": "1.0.0",
  "description": "A modern terminal with AI assistance",
  "main": "app/main.js",
  "scripts": {
    "start": "node app/main.js",
    "dev": "nodemon app/main.js",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "typescript": "^5.2.2",
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  },
  "keywords": ["terminal", "ai", "warp"],
  "author": "Warp Dev",
  "license": "MIT"
}`,
}

const mockFs: Record<string, FileEntry[]> = {
  '/': [
    { name: 'home', isDir: true },
    { name: 'usr', isDir: true },
    { name: 'var', isDir: true },
    { name: 'etc', isDir: true },
    { name: 'bin', isDir: true },
    { name: 'sbin', isDir: true },
    { name: 'lib', isDir: true },
    { name: 'opt', isDir: true },
  ],
  '/home': [
    { name: 'kyle', isDir: true },
  ],
  '/home/kyle': [
    { name: 'warp', isDir: true },
    { name: 'README.md', content: mockFileContents['/home/kyle/README.md'] },
    { name: '.bashrc', content: mockFileContents['/home/kyle/.bashrc'] },
    { name: '.zshrc' },
    { name: '.vimrc' },
    { name: 'Documents', isDir: true },
    { name: 'Downloads', isDir: true },
    { name: 'Desktop', isDir: true },
    { name: 'Pictures', isDir: true },
    { name: 'Music', isDir: true },
    { name: 'Videos', isDir: true },
  ],
  '/home/kyle/warp': [
    { name: 'app', isDir: true },
    { name: 'migrations', isDir: true },
    { name: 'ui', isDir: true },
    { name: 'script', isDir: true },
    { name: 'Cargo.toml', content: mockFileContents['/home/kyle/warp/Cargo.toml'] },
    { name: 'README.md', content: mockFileContents['/home/kyle/warp/README.md'] },
    { name: 'package.json', content: mockFileContents['/home/kyle/warp/package.json'] },
    { name: 'node_modules', isDir: true },
    { name: 'dist', isDir: true },
    { name: '.git', isDir: true },
  ],
  '/home/kyle/warp/app': [
    { name: 'main.rs', content: mockFileContents['/home/kyle/warp/app/main.rs'] },
    { name: 'commands.rs', content: mockFileContents['/home/kyle/warp/app/commands.rs'] },
    { name: 'utils.rs' },
    { name: 'types.rs' },
    { name: 'lib.rs' },
    { name: 'Cargo.lock' },
  ],
  '/usr': [
    { name: 'bin', isDir: true },
    { name: 'lib', isDir: true },
    { name: 'local', isDir: true },
    { name: 'share', isDir: true },
  ],
  '/usr/bin': [
    { name: 'ls' },
    { name: 'cat' },
    { name: 'grep' },
    { name: 'curl' },
    { name: 'git' },
    { name: 'node' },
    { name: 'npm' },
    { name: 'python3' },
    { name: 'pip' },
    { name: 'rustc' },
    { name: 'cargo' },
  ],
  '/etc': [
    { name: 'hosts' },
    { name: 'passwd' },
    { name: 'group' },
    { name: 'os-release' },
  ],
}

function joinPath(base: string, name: string): string {
  if (base === '/') return `/${name}`
  return `${base}/${name}`
}

function formatPrompt(cwd: string, durationMs?: number): string {
  const home = '/home/kyle'
  const tildePath = cwd.startsWith(home) ? `~${cwd.slice(home.length) || '/'}` : cwd
  const time = durationMs !== undefined ? ` (${(durationMs / 1000).toFixed(3)}s)` : ''
  return `${tildePath} git:(main)${time}`
}

export default function WarpTerminal({ onClose }: WarpTerminalProps) {
  const [cwd, setCwd] = useState<string>('/home/kyle/warp')
  const [blocks, setBlocks] = useState<TerminalBlock[]>([])
  const [input, setInput] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const outputRef = useRef<HTMLDivElement | null>(null)

  const lsEntries = useMemo<FileEntry[]>(() => mockFs[cwd] ?? [], [cwd]) // eslint-disable-line @typescript-eslint/no-unused-vars

  // Simulate streaming command output
  const runStreamingCommand = useCallback(async (command: string, streamingContent: string) => {
    const id = `blk-${Date.now()}`
    const start = performance.now()

    // Create initial streaming block
    setBlocks(prev => [...prev, {
      id,
      cwd,
      command,
      output: [],
      isStreaming: true,
      streamContent: ''
    }])

    // Simulate streaming content progressively
    const chunks = streamingContent.split('\n')
    let currentContent = ''

    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate delay

      currentContent += chunks[i] + '\n'

      setBlocks(prev => prev.map(block =>
        block.id === id
          ? { ...block, streamContent: currentContent }
          : block
      ))
    }

    // Complete the streaming
    const end = performance.now()
    setBlocks(prev => prev.map(block =>
      block.id === id
        ? {
            ...block,
            isStreaming: false,
            output: chunks,
            durationMs: end - start
          }
        : block
    ))

    setHistory(prev => [...prev, command])
    setHistoryIndex(-1)
  }, [cwd])

  const runCommand = useCallback(async (raw: string) => {
    const command = raw.trim()

    if (command === '') return

    const [cmd, ...args] = command.split(/\s+/)

    // Handle streaming commands
    if (cmd === 'npm' && args[0] === 'install') {
      const streamingContent = `npm install completed

📦 Installing dependencies...
🔍 Resolving packages...
📥 Downloading express@4.18.2...
✅ express@4.18.2 downloaded
📥 Downloading socket.io@4.7.2...
✅ socket.io@4.7.2 downloaded
📥 Downloading react@18.2.0...
✅ react@18.2.0 downloaded
📥 Downloading typescript@5.2.2...
✅ typescript@5.2.2 downloaded
📥 Downloading @types/node@20.8.0...
✅ @types/node@20.8.0 downloaded
📥 Downloading jest@29.7.0...
✅ jest@29.7.0 downloaded
📥 Downloading nodemon@3.0.1...
✅ nodemon@3.0.1 downloaded

🎉 All dependencies installed successfully!

📊 Summary:
- 8 packages installed
- Installation time: 2.3s
- Total size: 12.4 MB

💡 Tip: Run 'npm start' to start your Warp Terminal server!`

      await runStreamingCommand(command, streamingContent)
      return
    } else if (cmd === 'npm' && args[0] === 'start') {
      const streamingContent = `npm start

🚀 Starting Warp Terminal server...
📡 Initializing WebSocket server...
⚡ Loading configuration...
🌐 Server listening on port 3000
🔗 WebSocket ready for connections
📊 Health check: OK
🎯 Warp Terminal is now running!

💡 Server Info:
- Port: 3000
- Environment: development
- WebSocket: enabled
- Health checks: passing

📝 Available endpoints:
- GET  /health
- WS   /terminal
- GET  /api/status

🎉 Ready to accept connections!`

      await runStreamingCommand(command, streamingContent)
      return
    } else if (cmd === 'npm' && args[0] === 'test') {
      const streamingContent = `npm test

🧪 Running test suite...
⚡ Starting Jest...
📝 Running tests...

✅ All tests passed!
📊 Test Results:
- Tests: 12 passed, 0 failed
- Coverage: 85.2%
- Duration: 1.4s

🎯 Test Summary:
- Unit tests: 8/8 passed
- Integration tests: 4/4 passed
- API tests: 0/0 passed

📈 Coverage Details:
- Lines: 89.3%
- Functions: 92.1%
- Branches: 78.5%

🎉 All tests completed successfully!`

      await runStreamingCommand(command, streamingContent)
      return
    } else if (cmd === 'curl' && args[0] && args[0].includes('example.com')) {
      const streamingContent = `curl example.com

🌐 Connecting to example.com...
📡 Sending HTTP request...
📥 Receiving response...

HTTP/2 200 OK
Content-Type: text/html; charset=UTF-8
Date: ${new Date().toLocaleString()}
Server: Example Server
Content-Length: 1256

<!DOCTYPE html>
<html>
<head>
    <title>Example Domain</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div>
        <h1>Example Domain</h1>
        <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
        <p><a href="https://www.iana.org/domains/example">More information...</a></p>
    </div>
</body>
</html>

📊 Request completed:
- Status: 200 OK
- Response time: 234ms
- Content length: 1.2KB
- Connection: HTTP/2`

      await runStreamingCommand(command, streamingContent)
      return
    }

    // Regular command handling
    const id = `blk-${Date.now()}`
    const start = performance.now()
    const output: string[] = []

    function done() {
      const end = performance.now()
      setBlocks(prev => [...prev, { id, cwd, command, output, durationMs: end - start }])
      setHistory(prev => [...prev, command])
      setHistoryIndex(-1)
    }

    switch (cmd) {
      case 'help':
        output.push('Available commands:')
        output.push('')
        output.push('File operations: ls, cd, pwd, cat, head, tail, grep, find')
        output.push('File management: mkdir, touch, rm, cp, mv')
        output.push('Text processing: echo, wc, sort, uniq')
        output.push('System info: date, whoami, uname, ps, which, whereis')
        output.push('Network: curl, wget, ping, nslookup')
        output.push('Git: git status, git log, git add, git commit, git diff')
        output.push('Node.js: npm list, npm install, node, yarn')
        output.push('Utilities: clear, history, !, !!, man, less')
        output.push('')
        output.push('Special features:')
        output.push('- ↑↓ arrow keys for command history')
        output.push('- Tab completion for commands')
        output.push('- Realistic file system navigation')
        output.push('- Mock git repository')
        output.push('- Package management simulation')
        output.push('')
        output.push('Type "help <command>" for detailed help on a specific command.')
        break

      case 'ls': {
        const entries = mockFs[cwd] ?? []
        if (entries.length === 0) {
          output.push('')
          break
        }

        const showAll = args.includes('-a') || args.includes('--all')
        const showLong = args.includes('-l') || args.includes('--long')
        // const showHuman = args.includes('-h') || args.includes('--human-readable') // Not implemented

        const filteredEntries = showAll ? entries : entries.filter(e => !e.name.startsWith('.'))

        if (showLong) {
          // Long format: permissions, size, date, name
          const now = new Date()
          filteredEntries.forEach(entry => {
            const permissions = entry.isDir ? 'drwxr-xr-x' : '-rw-r--r--'
            const size = entry.isDir ? '4096' : (entry.content?.length || '1024').toString()
            const date = now.toLocaleDateString()
            const name = entry.isDir ? `${entry.name}/` : entry.name
            output.push(`${permissions} 1 user user ${size.padStart(8)} ${date} ${name}`)
          })
        } else {
          // Single column format (most common in terminals)
          filteredEntries.forEach(entry => {
            const name = entry.isDir ? `${entry.name}/` : entry.name
            output.push(name)
          })
        }
        break
      }

      case 'cd': {
        const dest = args[0]
        if (!dest) {
          output.push('cd: missing operand')
          break
        }

        if (dest === '~') {
          setCwd('/home/kyle')
        } else if (dest === '..') {
          if (cwd !== '/') setCwd(p => p.slice(0, p.lastIndexOf('/')) || '/')
        } else if (dest === '.') {
          // Do nothing
        } else {
          const next = dest.startsWith('/') ? dest : joinPath(cwd, dest)
          if (mockFs[next]) {
            setCwd(next)
          } else {
            output.push(`cd: no such file or directory: ${dest}`)
          }
        }
        break
      }

      case 'pwd':
        output.push(cwd)
        break

      case 'clear':
        setBlocks([])
        break

      case 'echo':
        output.push(args.join(' '))
        break

      case 'date':
        output.push(new Date().toLocaleString())
        break

      case 'cat': {
        const filename = args[0]
        if (!filename) {
          output.push('cat: missing file operand')
          break
        }

        const filepath = filename.startsWith('/') ? filename : joinPath(cwd, filename)
        const entry = mockFs[filepath]?.[0]

        if (entry && !entry.isDir && entry.content) {
          output.push(entry.content)
        } else if (entry?.isDir) {
          output.push(`cat: ${filepath}: Is a directory`)
        } else {
          output.push(`cat: ${filepath}: No such file or directory`)
        }
        break
      }

      case 'head': {
        const filename = args[0] || ''
        const lines = parseInt(args[1]?.replace('-n', '')) || 10
        const filepath = filename.startsWith('/') ? filename : joinPath(cwd, filename)

        if (filename === '') {
          output.push('head: missing file operand')
          break
        }

        const entry = mockFs[filepath]?.[0]
        if (entry && !entry.isDir && entry.content) {
          const contentLines = entry.content.split('\n')
          output.push(...contentLines.slice(0, lines))
        } else {
          output.push(`head: cannot open '${filepath}' for reading: No such file or directory`)
        }
        break
      }

      case 'tail': {
        const filename = args[0] || ''
        const lines = parseInt(args[1]?.replace('-n', '')) || 10
        const filepath = filename.startsWith('/') ? filename : joinPath(cwd, filename)

        if (filename === '') {
          output.push('tail: missing file operand')
          break
        }

        const entry = mockFs[filepath]?.[0]
        if (entry && !entry.isDir && entry.content) {
          const contentLines = entry.content.split('\n')
          output.push(...contentLines.slice(-lines))
        } else {
          output.push(`tail: cannot open '${filepath}' for reading: No such file or directory`)
        }
        break
      }

      case 'grep': {
        const pattern = args[0]
        const filename = args[1]

        if (!pattern || !filename) {
          output.push('grep: missing arguments')
          break
        }

        const filepath = filename.startsWith('/') ? filename : joinPath(cwd, filename)
        const entry = mockFs[filepath]?.[0]

        if (entry && !entry.isDir && entry.content) {
          const lines = entry.content.split('\n')
          const matches = lines.filter(line => line.includes(pattern))
          output.push(...matches)
        } else {
          output.push(`grep: ${filepath}: No such file or directory`)
        }
        break
      }

      case 'git': {
        const gitCmd = args[0]
        switch (gitCmd) {
          case 'status':
            output.push('On branch main')
            output.push('Your branch is up to date with \'origin/main\'.')
            output.push('')
            output.push('Changes not staged for commit:')
            output.push('  (use "git add <file>..." to update what will be committed)')
            output.push('  (use "git restore <file>..." to discard changes in working directory)')
            output.push('')
            output.push('    modified:   bun.lockb')
            output.push('    modified:   next.config.ts')
            output.push('    modified:   package.json')
            output.push('')
            output.push('Untracked files:')
            output.push('  (use "git add <file>..." to include in what will be committed)')
            output.push('')
            output.push('    WARP.md')
            output.push('    ai-elements.md')
            output.push('    app/api/')
            output.push('    components/')
            output.push('    hooks/')
            output.push('    lib/dock-apps.ts')
            output.push('    public/apple-dark.svg')
            output.push('    public/cursor.svg')
            output.push('    public/discord.svg')
            output.push('    public/docker.svg')
            output.push('    public/headshot.webp')
            output.push('    public/launch.webp')
            output.push('    public/openai.svg')
            output.push('    public/raycast.png')
            output.push('    public/raycast.svg')
            output.push('    public/wallpaper.webp')
            output.push('    public/wallpaper2.webp')
            output.push('    public/warp.svg')
            output.push('    public/zed.svg')
            output.push('    styles/')
            output.push('')
            output.push('no changes added to commit (use "git add" and/or "git commit -a")')
            break
          case 'log':
            output.push('commit abc123def456789 (HEAD -> main, origin/main)')
            output.push('Author: Warp Dev <dev@warp.dev>')
            output.push('Date:   ' + new Date().toLocaleString())
            output.push('')
            output.push('    Add context menu functionality to dock icons')
            output.push('')
            output.push('commit def456abc789123 (origin/main)')
            output.push('Author: Warp Dev <dev@warp.dev>')
            output.push('Date:   ' + new Date(Date.now() - 86400000).toLocaleString())
            output.push('')
            output.push('    Enhance Warp terminal with realistic commands')
            output.push('')
            output.push('commit 789123abc456def')
            output.push('Author: Warp Dev <dev@warp.dev>')
            output.push('Date:   ' + new Date(Date.now() - 172800000).toLocaleString())
            output.push('')
            output.push('    Add macOS dock component with magnification')
            break
          case 'add':
            output.push('Added files to staging area')
            break
          case 'commit':
            output.push('[main abc123d] ' + (args[1] || 'Update terminal'))
            output.push(' 1 file changed, 42 insertions(+)')
            break
          case 'diff':
            output.push('diff --git a/components/apps/warp-terminal.tsx b/components/apps/warp-terminal.tsx')
            output.push('index abc1234..def5678 100644')
            output.push('--- a/components/apps/warp-terminal.tsx')
            output.push('+++ b/components/apps/warp-terminal.tsx')
            output.push('@@ -1,5 +1,5 @@')
            output.push(' /** biome-ignore-all lint/a11y/useButtonType: <explanation> */')
            output.push('-// biome-ignore lint/a11y/useButtonType: Interactive terminal component')
            output.push('+"use client"')
            output.push('+')
            output.push('+import React, { useCallback, useEffect, useMemo, useRef, useState } from \'react\'')
            output.push('+import OSWindow from \'@/components/os-window\'')
            output.push('+import { ChevronRight, Plus } from \'lucide-react\'')
            output.push('+')
            output.push(' interface TerminalBlock {')
            output.push('   id: string')
            output.push('   cwd: string')
            output.push('   command: string')
            output.push('   output: string[]')
            output.push('   durationMs?: number')
            output.push(' }')
            output.push('')
            output.push('@@ -15,7 +15,7 @@')
            output.push(' interface WarpTerminalProps {')
            output.push('   onClose: () => void')
            output.push(' }')
            output.push('')
            output.push(' const mockFileContents: Record<string, string> = {')
            output.push('   \'/home/mich/README.md\': `# Welcome to My Terminal')
            output.push('+   \'/home/kyle/README.md\': `# Welcome to My Terminal')
            break
          default:
            output.push(`git: '${gitCmd}' is not a git command. See 'git help'.`)
        }
        break
      }

      case 'npm': {
        const npmCmd = args[0]
        switch (npmCmd) {
          case 'list':
          case 'ls':
            output.push('warp-terminal@1.0.0 /home/kyle/warp')
            output.push('├── express@4.18.2')
            output.push('├── socket.io@4.7.2')
            output.push('├── react@18.2.0')
            output.push('└── typescript@5.2.2')
            break
          case 'install':
            output.push('npm install completed')
            output.push('Installed dependencies:')
            output.push('  - express@4.18.2')
            output.push('  - socket.io@4.7.2')
            break
          case 'start':
            output.push('Starting Warp Terminal...')
            output.push('Server listening on port 3000')
            output.push('WebSocket server ready')
            break
          case 'test':
            output.push('Running tests...')
            output.push('✓ All tests passed')
            break
          default:
            output.push(`npm: '${npmCmd}' is not a recognized npm command`)
        }
        break
      }

      case 'curl': {
        const url = args[0]
        if (!url) {
          output.push('curl: try \'curl --help\' for more information')
          break
        }

        if (url === 'https://api.github.com/user') {
          output.push('{"login": "warpdev", "name": "Warp Terminal", "followers": 42}')
        } else if (url.includes('google.com')) {
          output.push('<html><head><title>Google</title></head><body>Welcome to Google</body></html>')
        } else if (url.includes('example.com')) {
          output.push('Example Domain response')
        } else {
          output.push(`HTTP/2 200`)
          output.push(`Content-Type: application/json`)
          output.push(`{"message": "Hello from ${url}"}`)
        }
        break
      }

      case 'ps': {
        output.push('PID   USER     %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND')
        output.push('1234  kyle     0.0  1.2 123456  8192 pts/0    Sl   10:30   0:00 warp-terminal')
        output.push('5678  kyle     0.0  0.8  98765  4096 pts/0    S    10:30   0:00 node')
        output.push('9012  kyle     0.0  0.5  54321  2048 pts/0    S    10:31   0:00 npm')
        break
      }

      case 'which': {
        const cmdName = args[0]
        if (cmdName && ['ls', 'cat', 'grep', 'curl', 'git', 'node', 'npm', 'python3'].includes(cmdName)) {
          output.push(`/usr/bin/${cmdName}`)
        } else {
          output.push(`${cmdName} not found`)
        }
        break
      }

      case 'history': {
        if (history.length === 0) {
          output.push('No command history')
          break
        }

        history.forEach((cmd, index) => {
          output.push(`${index + 1}  ${cmd}`)
        })
        break
      }

      case '!': {
        const index = parseInt(args[0])
        if (!index || index < 1 || index > history.length) {
          output.push(`!: ${args[0]}: event not found`)
        } else {
          const commandToRun = history[index - 1]
          void runCommand(commandToRun)
        }
        break
      }

      case '!!': {
        if (history.length === 0) {
          output.push('!!: event not found')
        } else {
          const lastCommand = history[history.length - 1]
          void runCommand(lastCommand)
        }
        break
      }

      case 'whoami':
        output.push('kyle')
        break

      case 'uname': {
        const flag = args[0]
        if (flag === '-a') {
          output.push('Linux warp-terminal 6.1.0-generic #1 SMP x86_64 GNU/Linux')
        } else {
          output.push('Linux')
        }
        break
      }

      case 'wc': {
        const filename = args[0]
        if (!filename) {
          output.push('wc: missing file operand')
          break
        }

        const filepath = filename.startsWith('/') ? filename : joinPath(cwd, filename)
        const entry = mockFs[filepath]?.[0]

        if (entry && !entry.isDir && entry.content) {
          const lines = entry.content.split('\n').length
          const words = entry.content.split(/\s+/).length
          const chars = entry.content.length
          output.push(`${lines.toString().padStart(6)} ${words.toString().padStart(6)} ${chars.toString().padStart(6)} ${filename}`)
        } else {
          output.push(`wc: ${filepath}: No such file or directory`)
        }
        break
      }

      case 'mkdir': {
        const dirname = args[0]
        if (!dirname) {
          output.push('mkdir: missing operand')
        } else {
          output.push(`Created directory: ${dirname}`)
        }
        break
      }

      case 'touch': {
        const filename = args[0]
        if (!filename) {
          output.push('touch: missing file operand')
        } else {
          output.push(`Created file: ${filename}`)
        }
        break
      }

      case 'rm': {
        const filename = args[0]
        if (!filename) {
          output.push('rm: missing operand')
        } else {
          output.push(`Removed: ${filename}`)
        }
        break
      }

      case 'cp': {
        const [src, dest] = args
        if (!src || !dest) {
          output.push('cp: missing file operand')
        } else {
          output.push(`Copied ${src} to ${dest}`)
        }
        break
      }

      case 'mv': {
        const [src, dest] = args
        if (!src || !dest) {
          output.push('mv: missing file operand')
        } else {
          output.push(`Moved ${src} to ${dest}`)
        }
        break
      }

      default:
        output.push(`bash: ${cmd}: command not found`)
    }

    done()
  }, [cwd, history])

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const value = input.trim()
    if (value === '') return
    void runCommand(value)
    setInput('')
  }, [input, runCommand])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Auto-complete basic commands
      const commands = ['ls', 'cd', 'pwd', 'cat', 'git', 'npm', 'curl', 'help']
      const prefix = input.toLowerCase()
      const matching = commands.filter(cmd => cmd.startsWith(prefix))
      if (matching.length === 1) {
        setInput(matching[0])
      }
    }
  }, [history, historyIndex, input])

  useEffect(() => { inputRef.current?.focus() }, [])

  // Auto-scroll to bottom when new blocks are added or input changes
  useEffect(() => {
    if (outputRef.current) {
      const scrollToBottom = () => {
        outputRef.current!.scrollTop = outputRef.current!.scrollHeight
      }

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(scrollToBottom)
    }
  }, [blocks, input])

  // Auto-scroll to bottom when new blocks are added (immediate)
  useEffect(() => {
    if (outputRef.current && blocks.length > 0) {
      const lastBlock = outputRef.current.querySelector(`[data-block-id="${blocks[blocks.length - 1].id}"]`)
      if (lastBlock) {
        lastBlock.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  }, [blocks])

  return (
    <OSWindow title="Warp" onClose={onClose} storageKey="window-warp" initialSize={{ width: 1100, height: 720 }}>
      <div className="flex h-full w-full flex-col" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        {/* Dark terminal body */}
        <div ref={outputRef} className="flex-1 overflow-auto bg-black/70 p-3">
          {blocks.map(block => (
            <div key={block.id} data-block-id={block.id} className="mb-3 rounded-lg border border-white/10 bg-black/60 shadow-inner overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="truncate text-foreground">{formatPrompt(block.cwd, block.durationMs)}</div>
                  {block.command === 'git status' && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-green-400">●</span>
                      <span className="text-white/60">main</span>
                      <span className="text-gray-400">●</span>
                      <span className="text-red-400">106</span>
                      <span className="text-white/60">-</span>
                      <span className="text-green-400">+14514</span>
                      <span className="text-white/60">-</span>
                      <span className="text-red-400">287</span>
                      <span className="text-white/60">●</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <button type="button" className="rounded-md px-1.5 py-0.5 hover:bg-white/10 text-xs">Copy Output</button>
                  <span className="text-white/60">●</span>
                  <span className="text-white/60">●</span>
                  <span className="text-white/60">●</span>
                </div>
              </div>
              <div className="px-3 py-2 text-[13px] text-white/90 whitespace-pre-wrap overflow-auto">
                <div className="mb-1 text-white/80">$ {block.command}</div>

                {/* Handle streaming content */}
                {block.isStreaming && block.streamContent ? (
                  <div className="text-foreground">
                    <Streamdown
                      children={block.streamContent}
                      className="whitespace-pre-wrap break-all"
                      shikiTheme={['github-dark', 'github-light']}
                    />
                  </div>
                ) : block.output.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {block.output.map((line, i) => {
                      // Apply syntax highlighting based on content
                      let textColor = "text-foreground"; // Default
                      let isSpecial = false;

                      if (line.startsWith('    modified:')) {
                        textColor = "text-red-400";
                        isSpecial = true;
                      } else if (line.startsWith('    deleted:')) {
                        textColor = "text-red-500";
                        isSpecial = true;
                      } else if (line.startsWith('    added:')) {
                        textColor = "text-green-400";
                        isSpecial = true;
                      } else if (line.startsWith('    ') && line.includes('.md')) {
                        textColor = "text-blue-300";
                        isSpecial = true;
                      } else if (line.startsWith('    ') && (line.includes('.ts') || line.includes('.tsx'))) {
                        textColor = "text-cyan-300";
                        isSpecial = true;
                      } else if (line.startsWith('    ') && (line.includes('.svg') || line.includes('.webp'))) {
                        textColor = "text-purple-300";
                        isSpecial = true;
                      } else if (line.includes('commit ') && /^[a-f0-9]{7,}/.test(line.split(' ')[1] || '')) {
                        textColor = "text-yellow-300";
                        isSpecial = true;
                      } else if (line.includes('branch') || line.includes('main')) {
                        textColor = "text-green-300";
                        isSpecial = true;
                      } else if (line.includes('commit') && line.includes('(HEAD')) {
                        textColor = "text-cyan-300";
                        isSpecial = true;
                      } else if (line.includes('On branch') || line.includes('Your branch')) {
                        textColor = "text-white/90";
                        isSpecial = true;
                      } else if (line.includes('Changes not staged') || line.includes('Untracked files')) {
                        textColor = "text-yellow-300";
                        isSpecial = true;
                      } else if (line.startsWith('  (use "git')) {
                        textColor = "text-gray-400";
                        isSpecial = true;
                      } else if (line.includes('nothing added to commit') || line.includes('no changes added')) {
                        textColor = "text-gray-300";
                        isSpecial = true;
                      } else if (line.includes('Author:') || line.includes('Date:')) {
                        textColor = "text-gray-400";
                        isSpecial = true;
                      }

                      return (
                        <div
                          key={`${block.id}-${i}`}
                          className={`whitespace-pre-wrap break-all ${textColor} ${isSpecial ? 'font-medium' : ''}`}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ))}

          {/* Active input block */}
          <div className="rounded-lg border border-white/10 bg-black/60">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[12px] text-cyan-300/90">
              <div className="truncate">{formatPrompt(cwd)}</div>
              <div className="flex items-center gap-2 text-white/40">
                <button type="button" className="rounded-md px-1.5 py-0.5 hover:bg-white/10">Create Permalink…</button>
              </div>
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/90">
              <div className="text-cyan-300/90">$</div>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command (try: ls, cd app, pwd, help) • ↑↓ for history • Tab for completion"
                className="flex-1 bg-transparent outline-none placeholder:text-white/30"
                autoCapitalize="none"
                spellCheck={false}
                autoComplete="off"
              />
              <button type="submit" className="rounded-md bg-white/10 px-2 py-1 text-[12px] hover:bg-white/20">Run</button>
            </form>
          </div>
        </div>

        {/* Footer quick actions */}
        <div className="flex items-center gap-2 border-t border-white/10 bg-black/60 px-3 py-2 text-[12px] text-white/70">
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20">
            <Plus className="mr-1 inline size-3.5" /> New Block
          </button>
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20">
            Split Pane
          </button>
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20">
            AI Assistant
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-green-400">●</span>
              <span className="text-cyan-300/90">Warp Terminal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">●</span>
              <span className="text-green-400/80">Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-300">●</span>
              <span className="text-white/60">{blocks.length} blocks</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-300">●</span>
              <span className="text-white/60">↑↓ history • Tab completion</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/60">●</span>
              <span className="text-white/60">●</span>
              <span className="text-white/60">●</span>
            </div>
          </div>
        </div>
      </div>
    </OSWindow>
  )
}


