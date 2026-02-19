import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const ApiTester = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState({
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    params: {}
  });
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState([]);
  const [environments, setEnvironments] = useState({
    development: { baseUrl: 'http://localhost:3001' },
    staging: { baseUrl: 'https://staging-api.orbitos.com' },
    production: { baseUrl: 'https://api.orbitos.com' }
  });
  const [currentEnv, setCurrentEnv] = useState('development');

  // HTTP methods
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Common headers
  const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN',
    'Accept': 'application/json',
    'User-Agent': 'OrbitOS-API-Tester/1.0'
  };

  // Send request
  const sendRequest = async () => {
    if (!currentRequest.url) {
      alert('Please enter a URL');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const fullUrl = currentRequest.url.startsWith('http') 
        ? currentRequest.url 
        : `${environments[currentEnv].baseUrl}${currentRequest.url}`;

      const options = {
        method: currentRequest.method,
        headers: {
          ...commonHeaders,
          ...currentRequest.headers
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(currentRequest.method) && currentRequest.body) {
        options.body = currentRequest.body;
      }

      const response = await fetch(fullUrl, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
        responseTime,
        timestamp: new Date().toISOString()
      };

      setResponse(responseData);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        request: { ...currentRequest, url: fullUrl },
        response: responseData,
        timestamp: new Date().toISOString()
      };
      
      setRequests(prev => [historyItem, ...prev]);
    } catch (error) {
      setResponse({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save request
  const saveRequest = () => {
    const savedRequest = {
      id: Date.now(),
      name: prompt('Enter a name for this request:') || 'Untitled Request',
      request: { ...currentRequest },
      timestamp: new Date().toISOString()
    };
    
    setSavedRequests(prev => [savedRequest, ...prev]);
  };

  // Load saved request
  const loadRequest = (savedRequest) => {
    setCurrentRequest(savedRequest.request);
  };

  // Delete saved request
  const deleteSavedRequest = (id) => {
    setSavedRequests(prev => prev.filter(req => req.id !== id));
  };

  // Format JSON
  const formatJson = (text) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  // Add header
  const addHeader = () => {
    const key = prompt('Header key:');
    const value = prompt('Header value:');
    
    if (key && value) {
      setCurrentRequest(prev => ({
        ...prev,
        headers: { ...prev.headers, [key]: value }
      }));
    }
  };

  // Remove header
  const removeHeader = (key) => {
    setCurrentRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">API Tester</h2>
        <div className="flex items-center space-x-2">
          {/* Environment selector */}
          <select
            value={currentEnv}
            onChange={(e) => setCurrentEnv(e.target.value)}
            className={`px-3 py-1 rounded ${theme.app.input}`}
          >
            {Object.keys(environments).map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
          
          {/* Save request */}
          <button
            onClick={saveRequest}
            className={`px-3 py-1 rounded ${theme.app.button}`}
          >
            Save Request
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left panel - Request builder */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          {/* Method and URL */}
          <div className="flex space-x-2 mb-4">
            <select
              value={currentRequest.method}
              onChange={(e) => setCurrentRequest(prev => ({ ...prev, method: e.target.value }))}
              className={`px-3 py-2 rounded ${theme.app.input} font-semibold`}
            >
              {httpMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            <input
              type="text"
              value={currentRequest.url}
              onChange={(e) => setCurrentRequest(prev => ({ ...prev, url: e.target.value }))}
              placeholder={`${environments[currentEnv].baseUrl}/api/endpoint`}
              className={`flex-1 px-3 py-2 rounded ${theme.app.input}`}
            />
            <button
              onClick={sendRequest}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${theme.app.button} disabled:opacity-50`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Headers */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Headers</h3>
              <button
                onClick={addHeader}
                className={`px-2 py-1 rounded text-sm ${theme.app.button}`}
              >
                + Add Header
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(currentRequest.headers).map(([key, value]) => (
                <div key={key} className="flex space-x-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className={`flex-1 px-2 py-1 rounded ${theme.app.input} text-sm`}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setCurrentRequest(prev => ({
                      ...prev,
                      headers: { ...prev.headers, [key]: e.target.value }
                    }))}
                    className={`flex-1 px-2 py-1 rounded ${theme.app.input} text-sm`}
                  />
                  <button
                    onClick={() => removeHeader(key)}
                    className="px-2 py-1 rounded bg-red-500 text-white text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(currentRequest.method) && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Body</h3>
              <textarea
                value={currentRequest.body}
                onChange={(e) => setCurrentRequest(prev => ({ ...prev, body: e.target.value }))}
                placeholder='{"key": "value"}'
                className={`w-full h-32 px-3 py-2 rounded ${theme.app.input} font-mono text-sm`}
              />
            </div>
          )}

          {/* Saved Requests */}
          <div>
            <h3 className="font-semibold mb-2">Saved Requests</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedRequests.map(saved => (
                <div
                  key={saved.id}
                  className={`flex items-center justify-between p-2 rounded ${theme.app.button_subtle_hover}`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => loadRequest(saved)}
                  >
                    <div className="font-medium">{saved.name}</div>
                    <div className="text-xs opacity-75">
                      {saved.request.method} {saved.request.url}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSavedRequest(saved.id)}
                    className="px-2 py-1 rounded bg-red-500 text-white text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - Response */}
        <div className="w-1/2 p-4">
          {response ? (
            <div className="h-full flex flex-col">
              {/* Response status */}
              <div className={`p-3 rounded mb-4 ${
                response.error 
                  ? 'bg-red-100 text-red-800' 
                  : response.status >= 200 && response.status < 300
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {response.error ? 'Error' : `${response.status} ${response.statusText}`}
                  </span>
                  <span className="text-sm">
                    {response.responseTime ? `${response.responseTime}ms` : ''}
                  </span>
                </div>
              </div>

              {/* Response headers */}
              {response.headers && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Response Headers</h3>
                  <div className={`p-3 rounded ${theme.app.bg} border ${theme.app.border} max-h-32 overflow-y-auto`}>
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response body */}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Response Body</h3>
                <div className={`h-full p-3 rounded ${theme.app.bg} border ${theme.app.border} overflow-auto`}>
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {response.error 
                      ? response.error 
                      : formatJson(response.body)
                    }
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📡</div>
                <div>Send a request to see the response</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request history */}
      <div className={`border-t ${theme.app.border} p-4`}>
        <h3 className="font-semibold mb-2">Request History</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {requests.slice(0, 10).map(request => (
            <div
              key={request.id}
              className={`flex items-center justify-between p-2 rounded ${theme.app.button_subtle_hover}`}
              onClick={() => {
                setCurrentRequest(request.request);
                setResponse(request.response);
              }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    request.response.status >= 200 && request.response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.request.method}
                  </span>
                  <span className="text-sm">{request.request.url}</span>
                </div>
                <div className="text-xs opacity-75">
                  {request.response.status} • {request.response.responseTime}ms • {new Date(request.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;
