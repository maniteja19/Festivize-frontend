import React, { useState } from 'react';
import { uploadImage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Upload } from 'lucide-react';

const UploadImagePage = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file to upload.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await uploadImage(file);
      if (result.data) {
        setMessage(result.message || 'Image uploaded successfully!');
        setFile(null); // Clear file input
        document.getElementById('file-input').value = '';
        if (onUploadSuccess) {
          onUploadSuccess(); // Callback to refresh gallery, if provided
        }
      } else {
        setError(result.message || 'Failed to upload image.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Upload Image</h2>
      <p className="text-gray-600 mb-6">Upload photos of event setup, idol, or decoration.</p>

      {message && <p className="text-green-600 text-center mb-4">{message}</p>}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">
            Select Image
          </label>
          <input
            type="file"
            id="file-input"
            name="photo" // This name MUST match your multer.single('photo') in the backend
            onChange={handleFileChange}
            accept="image/*"
            className="w-full text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className={`flex items-center justify-center py-2 px-4 rounded-md shadow-md font-semibold transition duration-200 ${
            loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Upload size={20} className="mr-2" /> Upload
        </button>
      </form>
    </div>
  );
};

export default UploadImagePage;
