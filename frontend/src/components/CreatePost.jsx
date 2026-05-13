// frontend/src/components/CreatePost.jsx

import { useState, useRef } from 'react';
import API from '../api/axios';
import ImageCropper from './ImageCropper';

const CreatePost = ({ onClose, onPostCreated }) => {
  const [type, setType] = useState('project');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [rawFileName, setRawFileName] = useState('');
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    techStack: '',
    projectLink: '',
    githubLink: '',
    companyName: '',
    jobRole: '',
    jobLocation: '',
    applyLink: '',
    rating: 5,
    reviewCategory: 'college',
    tags: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Only images and videos are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');

    if (isVideo) {
      // Videos don't need cropping
      setMediaFile(file);
      setMediaType('video');
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      // Images go through cropper
      setRawFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropDone = (croppedFile, previewUrl) => {
    setMediaFile(croppedFile);
    setMediaPreview(previewUrl);
    setMediaType('image');
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType('');
    setRawImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('type', type);
      payload.append('title', formData.title);
      payload.append('content', formData.content);
      payload.append('tags', formData.tags);
      payload.append('techStack', formData.techStack);
      payload.append('projectLink', formData.projectLink);
      payload.append('githubLink', formData.githubLink);
      payload.append('companyName', formData.companyName);
      payload.append('jobRole', formData.jobRole);
      payload.append('jobLocation', formData.jobLocation);
      payload.append('applyLink', formData.applyLink);
      payload.append('rating', formData.rating);
      payload.append('reviewCategory', formData.reviewCategory);
      if (mediaFile) payload.append('media', mediaFile);

      const { data } = await API.post('/posts', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onPostCreated(data.post);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // Show cropper fullscreen when image selected
  if (showCropper && rawImageSrc) {
    return (
      <ImageCropper
        imageSrc={rawImageSrc}
        fileName={rawFileName}
        onCropDone={handleCropDone}
        onCancel={handleCropCancel}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800">Create Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Post Type */}
          <div className="flex gap-2">
            {[
              { value: 'project', label: '🚀 Project' },
              { value: 'job', label: '💼 Job' },
              { value: 'review', label: '⭐ Review' },
            ].map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  type === t.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={
                type === 'project' ? 'Project name...' :
                type === 'job' ? 'Job role at Company...' :
                'Review of...'
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Describe in detail..."
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo / Video
              <span className="text-gray-400 text-xs ml-1">(optional, max 50MB)</span>
            </label>

            {!mediaPreview ? (
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
                <span className="text-2xl">📎</span>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Add photo or video</p>
                  <p className="text-xs text-gray-400">Images will open crop tool • Videos uploaded directly</p>
                </div>
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} controls className="w-full max-h-64 object-cover" />
                ) : (
                  <div>
                    <img src={mediaPreview} alt="preview" className="w-full max-h-64 object-cover" />
                    {/* Re-crop button */}
                    <button
                      type="button"
                      onClick={() => {
                        setRawImageSrc(mediaPreview);
                        setShowCropper(true);
                      }}
                      className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-3 py-1 rounded-full hover:bg-opacity-80"
                    >
                      ✂️ Re-crop
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-opacity-80"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Project Fields */}
          {type === 'project' && (
            <div className="space-y-3">
              <input type="text" name="techStack" value={formData.techStack}
                onChange={handleChange} placeholder="Tech Stack (e.g. React, Node.js, MongoDB)"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="url" name="githubLink" value={formData.githubLink}
                onChange={handleChange} placeholder="GitHub Link (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="url" name="projectLink" value={formData.projectLink}
                onChange={handleChange} placeholder="Live Project Link (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          )}

          {/* Job Fields */}
          {type === 'job' && (
            <div className="space-y-3">
              <input type="text" name="companyName" value={formData.companyName}
                onChange={handleChange} placeholder="Company Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="text" name="jobRole" value={formData.jobRole}
                onChange={handleChange} placeholder="Job Role"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="text" name="jobLocation" value={formData.jobLocation}
                onChange={handleChange} placeholder="Location (e.g. Remote, Bangalore)"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="url" name="applyLink" value={formData.applyLink}
                onChange={handleChange} placeholder="Apply Link (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          )}

          {/* Review Fields */}
          {type === 'review' && (
            <div className="space-y-3">
              <select name="reviewCategory" value={formData.reviewCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="college">College</option>
                <option value="course">Course</option>
                <option value="teacher">Company</option>
                <option value="other">Other</option>
              </select>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Rating: {'⭐'.repeat(Number(formData.rating))} ({formData.rating}/5)
                </label>
                <input type="range" name="rating" min="1" max="5"
                  value={formData.rating} onChange={handleChange}
                  className="w-full accent-indigo-600" />
              </div>
            </div>
          )}

          {/* Tags */}
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Tags (comma separated, e.g. react, internship)"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Share Post 🚀'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreatePost;