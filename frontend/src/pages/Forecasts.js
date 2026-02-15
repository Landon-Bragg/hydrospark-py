import React, { useState, useEffect } from 'react';
import { generateForecast, getForecasts } from '../services/api';

function Forecasts() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const response = await getForecasts();
      setForecasts(response.data.forecasts || []);
    } catch (err) {
      setError('Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForecast = async () => {
    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      await generateForecast({ months: 12 });
      
      setSuccess('Forecast generated successfully!');
      await loadForecasts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate forecast');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading forecasts...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-hydro-deep-aqua">Usage Forecasts</h1>
        
        <button
          onClick={handleGenerateForecast}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? 'Generating...' : '📊 Generate 12-Month Forecast'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {generating && (
        <div className="card mb-6 text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hydro-spark-blue mb-4"></div>
          <p className="text-lg font-semibold">Generating forecast using ML model...</p>
          <p className="text-sm text-gray-600 mt-2">This may take 1-2 minutes</p>
        </div>
      )}

      {forecasts.length === 0 && !generating ? (
        <div className="card text-center py-12">
          <p className="text-xl text-gray-600 mb-4">No forecasts available yet</p>
          <p className="text-gray-500 mb-6">Generate a 12-month forecast using our ML model</p>
          <button onClick={handleGenerateForecast} className="btn-primary">
            Generate Forecast
          </button>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Predicted Usage (Next 12 Months)</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Predicted Usage (CCF)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Predicted Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Confidence Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {forecasts.map((forecast) => (
                  <tr key={forecast.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{forecast.forecast_date}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-hydro-deep-aqua">
                      {parseFloat(forecast.predicted_usage_ccf).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-green-600">
                      ${parseFloat(forecast.predicted_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {forecast.confidence_lower && forecast.confidence_upper ? (
                        `${parseFloat(forecast.confidence_lower).toFixed(2)} - ${parseFloat(forecast.confidence_upper).toFixed(2)} CCF`
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {forecasts.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Forecasts are generated using Facebook Prophet ML model based on historical usage patterns.
                Confidence intervals show the likely range of actual usage.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Forecasts;