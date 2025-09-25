export interface AppItem { id: string; name: string; icon: string }

export const defaultApps: AppItem[] = [
    { id: 'finder', name: 'Finder', icon: 'https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png?rf=1024' },
    { id: 'launchpad', name: 'Launchpad', icon: '/launch.webp' },
    { id: 'safari', name: 'Safari', icon: 'https://cdn.jim-nielsen.com/macos/1024/safari-2021-06-02.png?rf=1024' },
    { id: 'cursor', name: 'Cursor', icon: '/cursor.svg' },
    { id: 'zed', name: 'Zed', icon: 'zed.svg' },
    { id: 'docker', name: 'Docker', icon: 'docker.svg' },
    { id: 'warp', name: 'Warp', icon: '/warp.svg' },
    { id: 'ai-chat', name: 'AI Chat', icon: '/openai.svg' },
    { id: 'raycast', name: 'Raycast', icon: '/raycast.svg' }
  ];