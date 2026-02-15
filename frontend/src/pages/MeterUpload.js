import React from 'react';

function MeterUpload() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-hydro-deep-aqua mb-6">Meter Reading Upload</h1>
      <div className="card">
        <p className="text-gray-600 mb-4">Upload a photo of your water meter for instant bill estimation.</p>
        <input type="file" accept="image/*" className="input-field" />
        <button className="btn-primary mt-4">Upload & Analyze</button>
      </div>
    </div>
  );
}

export default MeterUpload;
