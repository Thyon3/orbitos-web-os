import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import CloudStorageManager from '@/lib/cloudStorage';

const CloudStorageConnector = () => {
  const { theme } = useTheme();
  const [activeProviders, setActiveProviders] = useState({
    google: false,
    dropbox: false,
    aws: false,
    onedrive: false
  });
  const [credentials, setCredentials] = useState({
    google: { clientId: '', clientSecret: '', accessToken: '' },
    dropbox: { accessToken: '' },
    aws: { accessKeyId: '', secretAccessKey: '', region: '', bucket: '' },
    onedrive: { clientId: '', clientSecret: '', accessToken: '' }
  });
  const [isConnecting, setIsConnecting] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const [cloudStorage, setCloudStorage] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Initialize cloud storage manager
  useEffect(() => {
    const manager = new CloudStorageManager();
    setCloudStorage(manager);
    
    // Load saved credentials from localStorage
    const savedCredentials = localStorage.getItem('orbitos-cloud-credentials');
    if (savedCredentials) {
      setCredentials(JSON.parse(savedCredentials));
    }
    
    const savedProviders = localStorage.getItem('orbitos-cloud-providers');
    if (savedProviders) {
      setActiveProviders(JSON.parse(savedProviders));
    }
  }, []);

  // Save credentials to localStorage
  const saveCredentials = () => {
    localStorage.setItem('orbitos-cloud-credentials', JSON.stringify(credentials));
    localStorage.setItem('orbitos-cloud-providers', JSON.stringify(activeProviders));
  };

  // Test connection
  const testConnection = async (provider) => {
    setIsConnecting(prev => ({ ...prev, [provider]: true }));
    setConnectionStatus(prev => ({ ...prev, [provider]: 'testing' }));

    try {
      let result = { success: false, message: '', data: null };

      switch (provider) {
        case 'google':
          if (credentials.google.accessToken) {
            // Test Google Drive API
            const response = await fetch('https://www.googleapis.com/drive/v3/about', {
              headers: {
                'Authorization': `Bearer ${credentials.google.accessToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              result = {
                success: true,
                message: 'Connected to Google Drive',
                data: { user: data.user, storageQuota: data.storageQuota }
              };
            } else {
              result = { success: false, message: 'Invalid Google Drive access token' };
            }
          } else {
            result = { success: false, message: 'Missing Google Drive credentials' };
          }
          break;

        case 'dropbox':
          if (credentials.dropbox.accessToken) {
            // Test Dropbox API
            const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${credentials.dropbox.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              result = {
                success: true,
                message: 'Connected to Dropbox',
                data: { user: data }
              };
            } else {
              result = { success: false, message: 'Invalid Dropbox access token' };
            }
          } else {
            result = { success: false, message: 'Missing Dropbox access token' };
          }
          break;

        case 'aws':
          if (credentials.aws.accessKeyId && credentials.aws.secretAccessKey) {
            // Test AWS S3
            try {
              cloudStorage.setupS3(
                credentials.aws.accessKeyId,
                credentials.aws.secretAccessKey,
                credentials.aws.region || 'us-east-1',
                credentials.aws.bucket || 'orbitos-storage'
              );
              
              const files = await cloudStorage.listS3Files();
              result = {
                success: true,
                message: 'Connected to AWS S3',
                data: { fileCount: files.length }
              };
            } catch (error) {
              result = { success: false, message: `AWS S3 error: ${error.message}` };
            }
          } else {
            result = { success: false, message: 'Missing AWS credentials' };
          }
          break;

        case 'onedrive':
          if (credentials.onedrive.accessToken) {
            // Test OneDrive API
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: {
                'Authorization': `Bearer ${credentials.onedrive.accessToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              result = {
                success: true,
                message: 'Connected to OneDrive',
                data: { user: data }
              };
            } else {
              result = { success: false, message: 'Invalid OneDrive access token' };
            }
          } else {
            result = { success: false, message: 'Missing OneDrive access token' };
          }
          break;
      }

      setTestResults(prev => ({ ...prev, [provider]: result }));
      setConnectionStatus(prev => ({ ...prev, [provider]: result.success ? 'connected' : 'failed' }));
      
      if (result.success) {
        setActiveProviders(prev => ({ ...prev, [provider]: true }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, message: `Connection error: ${error.message}` }
      }));
      setConnectionStatus(prev => ({ ...prev, [provider]: 'failed' }));
    } finally {
      setIsConnecting(prev => ({ ...prev, [provider]: false }));
    }
  };

  // Disconnect provider
  const disconnectProvider = (provider) => {
    setActiveProviders(prev => ({ ...prev, [provider]: false }));
    setConnectionStatus(prev => ({ ...prev, [provider]: 'disconnected' }));
    setTestResults(prev => ({ ...prev, [provider]: null }));
    saveCredentials();
  };

  // Update credentials
  const updateCredentials = (provider, field, value) => {
    setCredentials(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  // OAuth handlers
  const handleGoogleAuth = () => {
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${credentials.google.clientId}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
      `scope=https://www.googleapis.com/auth/drive&` +
      `response_type=code&` +
      `access_type=offline`;
    
    window.open(authUrl, 'google-auth', 'width=500,height=600');
  };

  const handleDropboxAuth = () => {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${credentials.dropbox.clientId}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/dropbox/callback')}&` +
      `response_type=code`;
    
    window.open(authUrl, 'dropbox-auth', 'width=500,height=600');
  };

  // Provider configurations
  const providerConfigs = {
    google: {
      name: 'Google Drive',
      icon: '🔵',
      color: '#4285f4',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your Google Client ID' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your Google Client Secret' },
        { key: 'accessToken', label: 'Access Token', type: 'text', placeholder: 'OAuth Access Token' }
      ]
    },
    dropbox: {
      name: 'Dropbox',
      icon: '🔷',
      color: '#0061ff',
      fields: [
        { key: 'accessToken', label: 'Access Token', type: 'text', placeholder: 'Dropbox Access Token' }
      ]
    },
    aws: {
      name: 'AWS S3',
      icon: '🟠',
      color: '#ff9900',
      fields: [
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AWS Access Key ID' },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'AWS Secret Access Key' },
        { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' },
        { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'orbitos-storage' }
      ]
    },
    onedrive: {
      name: 'OneDrive',
      icon: '🔵',
      color: '#0078d4',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your Microsoft App Client ID' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your Microsoft App Client Secret' },
        { key: 'accessToken', label: 'Access Token', type: 'text', placeholder: 'OAuth Access Token' }
      ]
    }
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Cloud Storage Connectors</h2>
        <button
          onClick={saveCredentials}
          className={`px-4 py-2 rounded ${theme.app.button}`}
        >
          Save Configuration
        </button>
      </div>

      {/* Providers */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(providerConfigs).map(([provider, config]) => (
            <motion.div
              key={provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg border ${theme.app.border} ${theme.app.bg}`}
            >
              {/* Provider Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className="font-semibold">{config.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activeProviders[provider] 
                          ? 'bg-green-500' 
                          : connectionStatus[provider] === 'testing'
                            ? 'bg-yellow-500 animate-pulse'
                            : connectionStatus[provider] === 'failed'
                              ? 'bg-red-500'
                              : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-gray-500">
                        {activeProviders[provider] 
                          ? 'Connected' 
                          : connectionStatus[provider] === 'testing'
                            ? 'Testing...'
                            : connectionStatus[provider] === 'failed'
                              ? 'Failed'
                              : 'Disconnected'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Connection controls */}
                <div className="flex space-x-2">
                  {activeProviders[provider] ? (
                    <button
                      onClick={() => disconnectProvider(provider)}
                      className={`px-3 py-1 rounded bg-red-500 text-white text-sm`}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => testConnection(provider)}
                      disabled={isConnecting[provider]}
                      className={`px-3 py-1 rounded ${theme.app.button} text-sm disabled:opacity-50`}
                    >
                      {isConnecting[provider] ? 'Testing...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              {/* OAuth buttons for providers that support it */}
              {(provider === 'google' || provider === 'dropbox') && (
                <div className="mb-4">
                  <button
                    onClick={provider === 'google' ? handleGoogleAuth : handleDropboxAuth}
                    className={`w-full px-3 py-2 rounded text-white text-sm`}
                    style={{ backgroundColor: config.color }}
                  >
                    Connect with {config.name}
                  </button>
                </div>
              )}

              {/* Credential fields */}
              <div className="space-y-3">
                {config.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={credentials[provider][field.key]}
                      onChange={(e) => updateCredentials(provider, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 rounded ${theme.app.input} text-sm`}
                      disabled={activeProviders[provider]}
                    />
                  </div>
                ))}
              </div>

              {/* Test result */}
              <AnimatePresence>
                {testResults[provider] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 p-3 rounded text-sm ${
                      testResults[provider].success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <div className="font-medium">
                      {testResults[provider].success ? '✅' : '❌'} {testResults[provider].message}
                    </div>
                    {testResults[provider].data && (
                      <div className="mt-2 text-xs">
                        {Object.entries(testResults[provider].data).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Storage Usage Summary */}
        {Object.values(activeProviders).some(Boolean) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-6 rounded-lg border ${theme.app.border} ${theme.app.bg}`}
          >
            <h3 className="font-semibold mb-4">Connected Services Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(activeProviders).map(([provider, isActive]) => {
                if (!isActive) return null;
                const config = providerConfigs[provider];
                const testResult = testResults[provider];
                
                return (
                  <div key={provider} className="text-center">
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <div className="font-medium">{config.name}</div>
                    {testResult?.data && (
                      <div className="text-xs text-gray-500 mt-1">
                        {testResult.data.fileCount !== undefined && `${testResult.data.fileCount} files`}
                        {testResult.data.user?.displayName && `User: ${testResult.data.user.displayName}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CloudStorageConnector;
