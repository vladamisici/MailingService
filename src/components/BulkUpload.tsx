'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';

export default function BulkUpload() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const text = await file.text();
      const emails = parseCSV(text);
      
      const response = await fetch('/api/send/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send bulk emails');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process bulk emails');
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text: string): Array<{
    to: string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const email: any = {};
      
      headers.forEach((header, index) => {
        if (header === 'to') {
          email.to = [values[index]];
        } else {
          email[header] = values[index];
        }
      });
      
      return email;
    });
  };

  const downloadTemplate = () => {
    const template = `to,subject,html,text,from
recipient1@example.com,Test Subject 1,<h1>Hello Recipient 1</h1>,Plain text content,sender@example.com
recipient2@example.com,Test Subject 2,<h1>Hello Recipient 2</h1>,Plain text content,sender@example.com`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_email_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Email Upload</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-1">CSV Format</h3>
            <p className="text-sm text-blue-700 mb-3">
              Upload a CSV file with columns: to, subject, html, text (optional), from (optional)
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Template
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your CSV file here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Maximum 1000 emails per batch
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Select File
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {results && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <h3 className="text-sm font-medium text-green-900">Bulk Send Complete</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-green-600">Total Emails</p>
              <p className="text-2xl font-bold text-green-900">{results.total}</p>
            </div>
            <div>
              <p className="text-green-600">Successful</p>
              <p className="text-2xl font-bold text-green-900">{results.success}</p>
            </div>
            <div>
              <p className="text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-900">{results.failed}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bulk Sends</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">bulk_send_{i}.csv</p>
                <p className="text-sm text-gray-500">Sent 2 hours ago • 250 emails</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}