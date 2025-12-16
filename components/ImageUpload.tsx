import React, { useCallback, useState } from 'react';
import { Upload, FileImage, AlertCircle, Info, Users } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large. Please upload an image under 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onImageSelected(e.target.result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] w-full max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Photo (Family, Couple, or Individual)</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
           <span className="px-3 py-1 bg-brand-500/10 text-brand-400 text-xs font-medium rounded-full border border-brand-500/20 flex items-center gap-1">
             <Users className="w-3 h-3" />
             Multi-Subject Identity Protection
           </span>
        </div>
        <p className="text-slate-400 max-w-lg mx-auto">
          Our AI is strictly tuned to preserve facial identity and skin tones for everyone in the photo. Perfect for couple shoots, family portraits, and group photos.
        </p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative w-full aspect-video rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group
          ${isDragging 
            ? 'border-brand-500 bg-brand-500/10' 
            : 'border-slate-700 bg-slate-800/50 hover:border-brand-500/50 hover:bg-slate-800'
          }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4 p-6 text-center pointer-events-none">
          <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-brand-500/20' : 'bg-slate-700'}`}>
            {isDragging ? (
              <FileImage className="w-10 h-10 text-brand-400" />
            ) : (
              <Upload className="w-10 h-10 text-slate-300" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-slate-200">
              {isDragging ? "Drop it like it's hot" : "Drag & drop or click to upload"}
            </p>
            <p className="text-sm text-slate-400 mt-1">Supports JPG, PNG, WebP up to 5MB</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-800 w-full max-w-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Best Results Guide</h4>
            <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
              <li>Use high-resolution photos where all faces are clearly visible.</li>
              <li>Ensure evenly lit faces for accurate skin tone detection.</li>
              <li>Avoid photos with heavy filters or deep shadows on faces.</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg animate-pulse">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};