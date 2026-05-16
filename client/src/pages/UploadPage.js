import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadMeme } from '../services/api';
import toast from 'react-hot-toast';

const UploadPage = () => {
  const [image, setImage] = useState(null);          // File object
  const [preview, setPreview] = useState(null);      // data URL for preview
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle file selection (camera or gallery)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setImage(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input with camera option (on mobile, this opens camera)
  const handleCamera = () => {
    // Use capture attribute to open camera directly on mobile
    fileInputRef.current.setAttribute('capture', 'environment'); // or 'user'
    fileInputRef.current.click();
    // Remove capture after click to allow gallery next time
    fileInputRef.current.removeAttribute('capture');
  };

  // Trigger file input for gallery
  const handleGallery = () => {
    // Ensure no capture attribute (opens gallery/file picker)
    fileInputRef.current.removeAttribute('capture');
    fileInputRef.current.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload meme
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      setUploading(true);
      await uploadMeme(formData);
      toast.success('Meme uploaded!');
      navigate('/'); // Go back to feed
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">New Post</h1>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* If no image selected, show camera and gallery options */}
      {!preview ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-4xl">📷</div>
          <p className="text-gray-500">Choose how you want to add a photo</p>
          <div className="flex gap-4">
            <button
              onClick={handleCamera}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Take Photo
            </button>
            <button
              onClick={handleGallery}
              className="border border-gray-300 px-6 py-2 rounded-lg font-semibold"
            >
              Choose from Gallery
            </button>
          </div>
        </div>
      ) : (
        /* Preview and caption area */
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-80 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border rounded p-2 text-sm resize-none h-20"
            maxLength={500}
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-3 w-full py-2 rounded-lg font-semibold text-white ${
              uploading ? 'bg-blue-300' : 'bg-blue-500'
            }`}
          >
            {uploading ? 'Uploading...' : 'Share'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;