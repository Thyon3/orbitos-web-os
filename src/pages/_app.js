// src/pages/_app.js

import '@/styles/globals.css';
import { AppProvider } from '@/context/AppContext';
import { CollaborationProvider } from '@/context/CollaborationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/system/services/NotificationRegistry';
import { SettingsProvider } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/AuthContext';
import { DriveProvider } from '@/context/DriveContext';
import { SearchProvider } from '@/context/SearchContext';
import { ClipboardProvider } from '@/context/ClipboardContext';
import { ShortcutProvider } from '@/context/ShortcutContext';
import { WallpaperProvider } from '@/context/WallpaperContext';
import { DashboardProvider } from '@/context/DashboardContext';

// We will use one function for our app wrapper
export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <CollaborationProvider>
              <SettingsProvider>
                <DriveProvider>
                  <SearchProvider>
                    <ClipboardProvider>
                      <ShortcutProvider>
                        <WallpaperProvider>
                          <DashboardProvider>
                            <Component {...pageProps} />
                          </DashboardProvider>
                        </WallpaperProvider>
                      </ShortcutProvider>
                    </ClipboardProvider>
                  </SearchProvider>
                </DriveProvider>
              </SettingsProvider>
            </CollaborationProvider>
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
