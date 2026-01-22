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
                    <Component {...pageProps} />
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
