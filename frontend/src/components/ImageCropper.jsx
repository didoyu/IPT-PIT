import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
import { X, Check, Scissors } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      // Convert blob to File object to match what inputs usually send
      const file = new File([croppedImageBlob], "profile_picture.jpg", { type: "image/jpeg" });
      onCropComplete(file, URL.createObjectURL(croppedImageBlob));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Scissors size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Crop Profile Picture</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Adjust your photo to fit</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative h-80 w-full bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Zoom</span>
              <span className="text-indigo-600">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-black hover:bg-slate-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={20} /> Save Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
