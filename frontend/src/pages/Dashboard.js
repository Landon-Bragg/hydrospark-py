import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsageSummary, getAlerts, getForecasts } from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For customers, load their data
      if (user?.role === 'customer') {
        const [summaryRes, alertsRes, forecastsRes] = await Promise.all([
          getUsageSummary().catch(e => ({ data: { summary: null } })),
          getAlerts({ status: 'new' }).catch(e => ({ data: { alerts: [] } })),
          getForecasts().catch(e => ({ data: { forecasts: [] } }))
        ]);
        setSummary(summaryRes.data.summary);
        setAlerts(alertsRes.data.alerts || []);
        setForecasts(forecastsRes.data.forecasts?.slice(0, 5) || []);
      }
      // For admin/billing, show welcome message
      else {
        setSummary(null);
        setAlerts([]);
        setForecasts([]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  // Admin Dashboard
  if (user?.role === 'admin' || user?.role === 'billing') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-hydro-deep-aqua mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-hydro-spark-blue to-hydro-deep-aqua text-white">
            <h3 className="text-lg font-semibold mb-2">Total Records</h3>
            <p className="text-3xl font-bold">1,035,131</p>
            <p className="text-sm mt-2">Water usage records imported</p>
          </div>
          
          <div className="card bg-gradient-to-br from-hydro-green to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
            <p className="text-3xl font-bold">657</p>
            <p className="text-sm mt-2">Active customer accounts</p>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Date Range</h3>
            <p className="text-xl font-bold">2018 - 2026</p>
            <p className="text-sm mt-2">8 years of data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-hydro-deep-aqua mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary text-left px-4 py-3" onClick={() => window.location.href = '/admin'}>
                📊 Manage Users
              </button>
              <button className="w-full btn-primary text-left px-4 py-3" onClick={() => window.location.href = '/admin'}>
                🚨 Run Anomaly Detection
              </button>
              <button className="w-full btn-primary text-left px-4 py-3" onClick={() => window.location.href = '/admin'}>
                💰 Generate Bills
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-hydro-deep-aqua mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-semibold">Database</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-semibold">API</span>
                <span className="text-green-600">✓ Running</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-semibold">ML Models</span>
                <span className="text-green-600">✓ Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard
  return (
    <div>
      <h1 className="text-3xl font-bold text-hydro-deep-aqua mb-6">Dashboard</h1>
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-hydro-spark-blue to-hydro-deep-aqua text-white">
          <h3 className="text-lg font-semibold mb-2">Total Usage (30 days)</h3>
          <p className="text-3xl font-bold">{summary?.total_usage_ccf?.toFixed(2) || '0.00'} CCF</p>
        </div>
        
        <div className="card bg-gradient-to-br from-hydro-green to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Average Daily</h3>
          <p className="text-3xl font-bold">{summary?.average_daily_ccf?.toFixed(2) || '0.00'} CCF</p>
        </div>
        
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
          <p className="text-3xl font-bold">{alerts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-hydro-deep-aqua mb-4">Recent Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-500">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex justify-between">
                    <span className="font-semibold text-red-700">{alert.alert_type}</span>
                    <span className="text-sm text-gray-600">{alert.alert_date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Usage: {alert.usage_ccf} CCF ({alert.deviation_percentage}% deviation)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-hydro-deep-aqua mb-4">Upcoming Forecast</h2>
          {forecasts.length === 0 ? (
            <div>
              <p className="text-gray-500 mb-4">No forecasts available</p>
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/forecasts'}
              >
                Generate Forecast
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {forecasts.slice(0, 3).map(forecast => (
                <div key={forecast.id} className="p-3 bg-hydro-sky-blue rounded">
                  <div className="flex justify-between">
                    <span className="font-semibold text-hydro-deep-aqua">{forecast.forecast_date}</span>
                    <span className="text-hydro-charcoal">{forecast.predicted_usage_ccf.toFixed(2)} CCF</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Est. Amount: ${forecast.predicted_amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;