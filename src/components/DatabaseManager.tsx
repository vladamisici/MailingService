'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Database, RefreshCw, Trash2, Edit2, Plus, Check, X, Download, Upload } from 'lucide-react';

interface TableData {
  tableName: string;
  columns: string[];
  rows: any[];
  totalRows: number;
}

export default function DatabaseManager() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const [newRow, setNewRow] = useState<any>({});
  const [showNewRow, setShowNewRow] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch available tables
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/database/tables');
      const data = await res.json();
      setTables(data.tables || []);
      if (data.tables?.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0]);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  }, [selectedTable]);

  // Fetch table data
  const fetchTableData = useCallback(async () => {
    if (!selectedTable) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        table: selectedTable,
        page: page.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const res = await fetch(`/api/database/data?${params}`);
      const data = await res.json();
      setTableData(data);
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTable, page, pageSize, searchTerm]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable, fetchTableData]);

  // Handle edit
  const handleEdit = (rowIndex: number, row: any) => {
    setEditingRow(rowIndex);
    setEditedData({ ...row });
  };

  // Handle save
  const handleSave = async (id: string) => {
    try {
      const res = await fetch('/api/database/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          id,
          data: editedData
        })
      });

      if (res.ok) {
        setEditingRow(null);
        fetchTableData();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch('/api/database/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          id
        })
      });

      if (res.ok) {
        fetchTableData();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Handle new row
  const handleAddNew = async () => {
    try {
      const res = await fetch('/api/database/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          data: newRow
        })
      });

      if (res.ok) {
        setShowNewRow(false);
        setNewRow({});
        fetchTableData();
      }
    } catch (error) {
      console.error('Failed to add new row:', error);
    }
  };

  // Export data
  const handleExport = async () => {
    try {
      const res = await fetch(`/api/database/export?table=${selectedTable}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}_export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  // Import data
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('table', selectedTable);

    try {
      const res = await fetch('/api/database/import', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        fetchTableData();
      }
    } catch (error) {
      console.error('Failed to import:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Database Manager</h2>
        </div>
        <button
          onClick={fetchTableData}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table selector */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedTable}
          onChange={(e) => {
            setSelectedTable(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="h-4 w-4" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search and actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowNewRow(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {tableData?.columns.map(column => (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showNewRow && (
                <tr className="bg-blue-50">
                  {tableData?.columns.map(column => (
                    <td key={column} className="px-6 py-4">
                      <input
                        type="text"
                        value={newRow[column] || ''}
                        onChange={(e) => setNewRow({ ...newRow, [column]: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder={column}
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleAddNew}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowNewRow(false);
                          setNewRow({});
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {loading ? (
                <tr>
                  <td colSpan={tableData?.columns.length || 1 + 1} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : tableData?.rows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                  {tableData.columns.map(column => (
                    <td key={column} className="px-6 py-4 text-sm text-gray-900">
                      {editingRow === rowIndex ? (
                        <input
                          type="text"
                          value={editedData[column] || ''}
                          onChange={(e) => setEditedData({ ...editedData, [column]: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="truncate block max-w-xs">
                          {typeof row[column] === 'boolean' ? (row[column] ? '✓' : '✗') : 
                           row[column] === null ? '-' : 
                           String(row[column])}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingRow === rowIndex ? (
                        <>
                          <button
                            onClick={() => handleSave(row.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRow(null);
                              setEditedData({});
                            }}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(rowIndex, row)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {tableData && tableData.totalRows > pageSize && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, tableData.totalRows)} of {tableData.totalRows} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= tableData.totalRows}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}