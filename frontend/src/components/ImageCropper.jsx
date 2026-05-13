// frontend/src/components/ImageCropper.jsx

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper to create initial centered crop
const createInitialCrop = (mediaWidth, mediaHeight, aspect) => {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
};

// Helper to get cropped image as a File
const getCroppedImage = (image, crop, fileName) => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.95);
  });
};

const ASPECT_RATIOS = [
  { label: '1:1', value: 1, icon: '⬛' },
  { label: '4:5', value: 4 / 5, icon: '📱' },
  { label: '16:9', value: 16 / 9, icon: '🖥️' },
  { label: 'Free', value: undefined, icon: '✂️' },
];

const ImageCropper = ({ imageSrc, fileName, onCropDone, onCancel }) => {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(1);
  const [loading, setLoading] = useState(false);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(createInitialCrop(width, height, aspect));
  }, [aspect]);

  const handleAspectChange = (newAspect) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(createInitialCrop(width, height, newAspect));
    }
  };

  const handleCropDone = async () => {
    if (!completedCrop || !imgRef.current) return;
    setLoading(true);
    try {
      const croppedFile = await getCroppedImage(imgRef.current, completedCrop, fileName);
      const previewUrl = URL.createObjectURL(croppedFile);
      onCropDone(croppedFile, previewUrl);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-between z-50">

      {/* Header */}
      <div className="w-full flex justify-between items-center px-4 py-3 bg-black">
        <button
          onClick={onCancel}
          className="text-white text-sm font-medium px-3 py-1 hover:text-gray-300"
        >
          ← Back
        </button>
        <h3 className="text-white font-semibold">Crop Image</h3>
        <button
          onClick={handleCropDone}
          disabled={loading || !completedCrop}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Done ✓'}
        </button>
      </div>

      {/* Crop Area */}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden px-2">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          className="max-h-full"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop"
            onLoad={onImageLoad}
            className="max-h-[65vh] max-w-full object-contain"
          />
        </ReactCrop>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="w-full bg-black py-4 px-4">
        <p className="text-gray-400 text-xs text-center mb-3">Select Aspect Ratio</p>
        <div className="flex justify-center gap-3">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.label}
              onClick={() => handleAspectChange(ratio.value)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                aspect === ratio.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{ratio.icon}</span>
              <span className="text-xs font-medium">{ratio.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ImageCropper;