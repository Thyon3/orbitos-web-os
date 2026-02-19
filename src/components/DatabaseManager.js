import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const DatabaseManager = () => {
  const { theme } = useTheme();
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [schema, setSchema] = useState({});
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);

  // Database connection templates
  const connectionTemplates = [
    {
      name: 'PostgreSQL',
      icon: '🐘',
      defaultPort: 5432,
      fields: ['host', 'port', 'database', 'username', 'password']
    },
    {
      name: 'MySQL',
      icon: '🐬',
      defaultPort: 3306,
      fields: ['host', 'port', 'database', 'username', 'password']
    },
    {
      name: 'MongoDB',
      icon: '🍃',
      defaultPort: 27017,
      fields: ['host', 'port', 'database', 'username', 'password']
    },
    {
      name: 'SQLite',
      icon: '📦',
      defaultPort: null,
      fields: ['filepath']
    },
    {
      name: 'Redis',
      icon: '🔴',
      defaultPort: 6379,
      fields: ['host', 'port', 'password']
    }
  ];

  // Initialize with sample connections
  useEffect(() => {
    const sampleConnections = [
      {
        id: 1,
        name: 'Development DB',
        type: 'PostgreSQL',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'orbitos_dev',
          username: 'dev_user',
          password: '•••••••'
        },
        connected: false
      },
      {
        id: 2,
        name: 'Production DB',
        type: 'MySQL',
        config: {
          host: 'prod-db.example.com',
          port: 3306,
          database: 'orbitos_prod',
          username: 'prod_user',
          password: '•••••••'
        },
        connected: false
      }
    ];
    setConnections(sampleConnections);
  }, []);

  // Connect to database
  const connectDatabase = async (connection) => {
    setActiveConnection(connection);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update connection status
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connection.id 
          ? { ...conn, connected: true }
          : conn
      )
    );

    // Load databases
    const mockDatabases = [
      { name: 'orbitos_dev', size: '125 MB', tables: 15 },
      { name: 'orbitos_test', size: '45 MB', tables: 8 },
      { name: 'postgres', size: '8 MB', tables: 0 }
    ];
    setDatabases(mockDatabases);

    // Load tables for first database
    loadTables(mockDatabases[0].name);
  };

  // Disconnect database
  const disconnectDatabase = (connectionId) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, connected: false }
          : conn
      )
    );
    
    if (activeConnection?.id === connectionId) {
      setActiveConnection(null);
      setDatabases([]);
      setTables([]);
      setSelectedTable(null);
      setTableData([]);
    }
  };

  // Load tables for database
  const loadTables = async (databaseName) => {
    // Simulate loading tables
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockTables = [
      { name: 'users', rows: 1250, size: '2.3 MB' },
      { name: 'files', rows: 5432, size: '8.7 MB' },
      { name: 'sessions', rows: 892, size: '1.2 MB' },
      { name: 'settings', rows: 45, size: '0.1 MB' },
      { name: 'logs', rows: 12847, size: '15.4 MB' }
    ];
    setTables(mockTables);
  };

  // Load table data
  const loadTableData = async (tableName) => {
    setSelectedTable(tableName);
    
    // Simulate loading data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16', status: 'active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17', status: 'inactive' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', created_at: '2024-01-18', status: 'active' }
    ];
    setTableData(mockData);

    // Generate schema
    const mockSchema = {
      columns: [
        { name: 'id', type: 'integer', nullable: false, primary_key: true },
        { name: 'name', type: 'varchar', nullable: false, max_length: 255 },
        { name: 'email', type: 'varchar', nullable: false, max_length: 255 },
        { name: 'created_at', type: 'timestamp', nullable: false },
        { name: 'status', type: 'enum', nullable: false, values: ['active', 'inactive', 'pending'] }
      ],
      indexes: [
        { name: 'PRIMARY', columns: ['id'], type: 'primary' },
        { name: 'idx_email', columns: ['email'], type: 'unique' },
        { name: 'idx_status', columns: ['status'], type: 'normal' }
      ]
    };
    setSchema(mockSchema);
  };

  // Execute query
  const executeQuery = async () => {
    if (!query.trim() || !activeConnection) return;
    
    setIsExecuting(true);
    
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const mockResults = [
      { id: 1, name: 'Query Result 1', value: Math.random() * 100 },
      { id: 2, name: 'Query Result 2', value: Math.random() * 100 },
      { id: 3, name: 'Query Result 3', value: Math.random() * 100 }
    ];
    
    setQueryResults(mockResults);
    setIsExecuting(false);
  };

  // Add new connection
  const addConnection = () => {
    const template = connectionTemplates[0];
    const newConnection = {
      id: Date.now(),
      name: `New ${template.name} Connection`,
      type: template.name,
      config: {
        host: 'localhost',
        port: template.defaultPort,
        database: '',
        username: '',
        password: ''
      },
      connected: false
    };
    
    setConnections(prev => [...prev, newConnection]);
  };

  // Delete connection
  const deleteConnection = (connectionId) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      if (activeConnection?.id === connectionId) {
        setActiveConnection(null);
        setDatabases([]);
        setTables([]);
        setSelectedTable(null);
        setTableData([]);
      }
    }
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Database Manager</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowQueryBuilder(!showQueryBuilder)}
            className={`px-3 py-1 rounded ${theme.app.button}`}
          >
            {showQueryBuilder ? 'Hide' : 'Show'} Query Builder
          </button>
          <button
            onClick={addConnection}
            className={`px-3 py-1 rounded ${theme.app.button}`}
          >
            + New Connection
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 p-4 space-y-4">
          {/* Connections */}
          <div>
            <h3 className="font-semibold mb-3">Connections</h3>
            <div className="space-y-2">
              {connections.map(connection => (
                <div
                  key={connection.id}
                  className={`p-3 rounded-lg border ${theme.app.border} cursor-pointer ${
                    activeConnection?.id === connection.id ? theme.app.dropdown_item_hover : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {connectionTemplates.find(t => t.name === connection.type)?.icon || '🗄️'}
                      </span>
                      <div>
                        <div className="font-medium">{connection.name}</div>
                        <div className="text-xs text-gray-500">{connection.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        connection.connected ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <button
                        onClick={() => connection.connected ? disconnectDatabase(connection.id) : connectDatabase(connection)}
                        className={`text-xs px-2 py-1 rounded ${
                          connection.connected ? 'bg-red-500 text-white' : theme.app.button
                        }`}
                      >
                        {connection.connected ? 'Disconnect' : 'Connect'}
                      </button>
                      <button
                        onClick={() => deleteConnection(connection.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Connection details */}
                  {activeConnection?.id === connection.id && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {Object.entries(connection.config).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Databases */}
          {activeConnection && (
            <div>
              <h3 className="font-semibold mb-3">Databases</h3>
              <div className="space-y-2">
                {databases.map(database => (
                  <div
                    key={database.name}
                    className={`p-2 rounded ${theme.app.button_subtle_hover} cursor-pointer`}
                    onClick={() => loadTables(database.name)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{database.name}</span>
                      <span className="text-xs text-gray-500">{database.size}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {database.tables} tables
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tables */}
          {activeConnection && databases.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tables</h3>
              <div className="space-y-2">
                {tables.map(table => (
                  <div
                    key={table.name}
                    className={`p-2 rounded ${theme.app.button_subtle_hover} cursor-pointer ${
                      selectedTable === table.name ? theme.app.dropdown_item_hover : ''
                    }`}
                    onClick={() => loadTableData(table.name)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{table.name}</span>
                      <span className="text-xs text-gray-500">{table.rows} rows</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {table.size}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Query Builder */}
          <AnimatePresence>
            {showQueryBuilder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 border-b ${theme.app.border}`}
              >
                <h3 className="font-semibold mb-3">Query Builder</h3>
                <div className="flex space-x-2">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter SQL query..."
                    className={`flex-1 p-3 rounded ${theme.app.input} font-mono text-sm`}
                    rows={4}
                  />
                  <button
                    onClick={executeQuery}
                    disabled={isExecuting || !query.trim()}
                    className={`px-4 py-2 rounded ${
                      isExecuting 
                        ? 'bg-gray-400 text-white' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:opacity-50`}
                  >
                    {isExecuting ? 'Executing...' : 'Execute'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Query Results */}
          {queryResults.length > 0 && (
            <div className="flex-1 p-4">
              <h3 className="font-semibold mb-3">Query Results ({queryResults.length} rows)</h3>
              <div className={`border ${theme.app.border} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme.app.toolbar}`}>
                      <tr>
                        {Object.keys(queryResults[0]).map(key => (
                          <th key={key} className="px-4 py-2 text-left font-medium text-sm">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, index) => (
                        <tr key={index} className={`border-t ${theme.app.border}`}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Table Data */}
          {selectedTable && queryResults.length === 0 && (
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Table: {selectedTable}</h3>
                <div className="flex space-x-2">
                  <span className={`text-sm px-2 py-1 rounded ${theme.app.badge}`}>
                    {tableData.length} rows
                  </span>
                  <button
                    className={`px-3 py-1 rounded ${theme.app.button}`}
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Schema */}
              {schema.columns && (
                <div className={`mb-4 p-3 rounded ${theme.app.bg} border ${theme.app.border}`}>
                  <h4 className="font-medium mb-2">Schema</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Columns</h5>
                      <div className="space-y-1">
                        {schema.columns.map((column, index) => (
                          <div key={index} className="text-xs">
                            <span className={`font-medium ${column.primary_key ? 'text-blue-600' : ''}`}>
                              {column.name}
                            </span>
                            <span className="text-gray-500">
                              {' '}{column.type}
                              {column.nullable ? '' : ' NOT NULL'}
                              {column.max_length ? `(${column.max_length})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Indexes</h5>
                      <div className="space-y-1">
                        {schema.indexes.map((index, indexIndex) => (
                          <div key={indexIndex} className="text-xs">
                            <span className="font-medium">{index.name}</span>
                            <span className="text-gray-500">
                              {' '}({index.columns.join(', ')}) - {index.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data */}
              <div className={`border ${theme.app.border} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme.app.toolbar}`}>
                      <tr>
                        {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                          <th key={key} className="px-4 py-2 text-left font-medium text-sm">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className={`border-t ${theme.app.border}`}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selectedTable && queryResults.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🗄️</div>
                <p>Select a table to view its data</p>
                <p className="text-sm">Or use the query builder to execute custom queries</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
