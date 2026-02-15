import React, { useState } from 'react';
import { importData } from '../services/api';
import axios from 'axios';

function AdminDashboard() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [detectingAnomalies, setDetectingAnomalies] = useState(false);
  const [result, setResult] = useState(null);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await importData(formData);
      setResult(response.data);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDetectAnomalies = async () => {
    setDetectingAnomalies(true);
    setError(null);
    setAnomalyResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/alerts/detect',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setAnomalyResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Anomaly detection failed');
    } finally {
      setDetectingAnomalies(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-hydro-deep-aqua mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Import Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Data Import</h2>
          <p className="text-gray-600 mb-4">Import CSV/XLSX usage data (max 100MB)</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {result && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">{result.message}</p>
              <p>Records imported: {result.imported_records}</p>
              <p>Customers created: {result.customers_created}</p>
              {result.errors && result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-semibold">Errors ({result.errors.length})</summary>
                  <ul className="mt-2 text-sm">
                    {result.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="input-field mb-4"
            disabled={importing}
          />
          
          {file && (
            <p className="text-sm text-gray-600 mb-2">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="btn-primary w-full"
          >
            {importing ? 'Importing... This may take several minutes' : 'Import Data'}
          </button>
          
          {importing && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-hydro-spark-blue"></div>
              <p className="text-sm text-gray-600 mt-2">Processing large file... Please wait</p>
            </div>
          )}
        </div>

        {/* Anomaly Detection Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Anomaly Detection</h2>
          <p className="text-gray-600 mb-4">
            Run ML-based anomaly detection on all customer usage data to identify spikes, leaks, and unusual patterns.
          </p>

          {anomalyResult && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">{anomalyResult.message}</p>
              <p className="text-sm mt-1">
                Detected {anomalyResult.anomalies?.length || 0} anomalies across all customers
              </p>
            </div>
          )}

          <button
            onClick={handleDetectAnomalies}
            disabled={detectingAnomalies}
            className="btn-primary w-full"
          >
            {detectingAnomalies ? 'Running Detection...' : '🚨 Run Anomaly Detection'}
          </button>

          {detectingAnomalies && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-hydro-spark-blue"></div>
              <p className="text-sm text-gray-600 mt-2">Analyzing usage patterns... This may take 1-2 minutes</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <p className="font-semibold text-hydro-deep-aqua mb-1">Detection Method:</p>
            <p className="text-gray-700">Uses Isolation Forest ML algorithm with dynamic thresholds to identify:</p>
            <ul className="list-disc list-inside mt-2 text-gray-700">
              <li>Usage spikes (100%+ above normal)</li>
              <li>Potential leaks (unusual patterns)</li>
              <li>Abnormal consumption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-hydro-sky-blue rounded">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-hydro-deep-aqua">1,035,131</p>
            <p className="text-xs text-gray-500 mt-1">Water usage records</p>
          </div>
          <div className="p-4 bg-hydro-sky-blue rounded">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-hydro-deep-aqua">657</p>
            <p className="text-xs text-gray-500 mt-1">Active accounts</p>
          </div>
          <div className="p-4 bg-hydro-sky-blue rounded">
            <p className="text-sm text-gray-600">Date Range</p>
            <p className="text-2xl font-bold text-hydro-deep-aqua">2018-2026</p>
            <p className="text-xs text-gray-500 mt-1">8 years of data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;