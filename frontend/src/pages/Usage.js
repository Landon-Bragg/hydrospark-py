import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsage } from '../services/api';

function Usage() {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadUsage();
  }, [dateRange]);

  const loadUsage = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await getUsage({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      setUsage(response.data.usage || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading usage data...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-hydro-deep-aqua">Water Usage History</h1>
        
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field w-48"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-hydro-sky-blue rounded">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-hydro-deep-aqua">{usage.length}</p>
          </div>
          <div className="p-4 bg-hydro-sky-blue rounded">
            <p className="text-sm text-gray-600">Total Usage</p>
            <p className="text-2xl font-bold text-hydro-deep-aqua">
              {usage.reduce((sum, u) => sum + parseFloat(u.daily_usage_ccf || 0), 0).toFixed(2)} CCF
            </p>
          </div>
          <div className="p-4 bg-hydro-sky-blue rounded">
            <p className="text-sm text-gray-600">Average Daily</p>
            <p className="text-2xl font-bold text-hydro-deep-aqua">
              {usage.length > 0 
                ? (usage.reduce((sum, u) => sum + parseFloat(u.daily_usage_ccf || 0), 0) / usage.length).toFixed(2)
                : '0.00'
              } CCF
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Usage Records</h2>
        
        {usage.length === 0 ? (
          <p className="text-gray-500">No usage data found for this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Usage (CCF)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estimated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usage.slice(0, 100).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{record.usage_date}</td>
                    <td className="px-4 py-2 text-sm font-semibold">{parseFloat(record.daily_usage_ccf).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">
                      {record.is_estimated ? (
                        <span className="text-yellow-600">Yes</span>
                      ) : (
                        <span className="text-green-600">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usage.length > 100 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing first 100 of {usage.length} records
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Usage;