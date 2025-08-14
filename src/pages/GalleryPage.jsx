// src/pages/GalleryPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllImages, uploadImage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Image as ImageIcon, UploadCloud, X, Download } from 'lucide-react';
import Modal from '../components/Modal.jsx';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for the upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  // States for the image preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getAllImages();
      setImages(data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch images.');
      console.error('Fetch images error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadMessage('');
      setUploadError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select an image file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadMessage('');
    setUploadError('');

    try {
      const result = await uploadImage(file);
      if (result.data) {
        setUploadMessage(result.message || 'Image uploaded successfully!');
        setFile(null);
        document.getElementById('file-input').value = '';
        fetchImages();
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadMessage('');
        }, 1500);
      } else {
        setUploadError(result.message || 'Failed to upload image.');
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setUploadLoading(false);
    }
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setFile(null);
    setUploadMessage('');
    setUploadError('');
  };

  const openPreviewModal = (image) => {
    console.log('Opening preview for image:', image)
    setSelectedImage(image);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setSelectedImage(null);
    setIsPreviewModalOpen(false);
  };
  
  const handleDownload = async (e, imageUrl, publicId) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${publicId}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the image:', error);
      alert('Failed to download the image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center text-red-600">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Image Gallery</h2>
        <p>{error}</p>
        <p>Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Image Gallery</h2>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
        >
          <UploadCloud size={20} className="mr-2" /> Upload
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-600 text-center text-lg flex items-center justify-center">
          <ImageIcon size={24} className="mr-2" /> No images have been uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image._id}
              className="relative overflow-hidden rounded-lg shadow-lg group"
              onClick={() => {openPreviewModal(image)
                console.log('Image clicked:', image.url);
            }}
            >
              <img
                src={image.url}
                alt={`Uploaded by ${image.uploadedBy ? image.uploadedBy.name : 'Unknown'}`}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/e2e8f0/718096?text=Image+Not+Found'; }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end justify-between p-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <p className="text-white text-sm font-semibold">
                  Uploaded by: {image.uploadedBy ? image.uploadedBy.name : 'N/A'}
                </p>
                <button
                  onClick={(e) => handleDownload(e, image.url, image.publicId)}
                  className="p-1 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                  title="Download Image"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} title="Upload Image">
        <p className="text-gray-600 mb-6">Upload celebration photos.</p>
        {uploadMessage && <p className="text-green-600 text-center mb-4">{uploadMessage}</p>}
        {uploadError && <p className="text-red-600 text-center mb-4">{uploadError}</p>}
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">
              Select Image
            </label>
            <input
              type="file"
              id="file-input"
              name="photo"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeUploadModal}
              className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md shadow-sm transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadLoading || !file}
              className={`flex items-center justify-center py-2 px-4 rounded-md shadow-md font-semibold transition duration-200 ${
                uploadLoading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <UploadCloud size={20} className="mr-2" /> Upload
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal isOpen={isPreviewModalOpen} onClose={closePreviewModal} title="Image Preview">
        {selectedImage && (
          <div className="w-full">
            <img src={selectedImage.url} alt={`Uploaded by ${selectedImage.uploadedBy ? selectedImage.uploadedBy.name : 'Unknown'}`} className="w-full max-h-[80vh] object-contain" />
            <p className="mt-4 text-gray-600 text-center text-sm">
              Uploaded by: {selectedImage.uploadedBy ? selectedImage.uploadedBy.name : 'N/A'} on {new Date(selectedImage.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GalleryPage;
