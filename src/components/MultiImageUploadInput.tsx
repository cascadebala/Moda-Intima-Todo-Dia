import React, { useRef, useState } from 'react';
import { Upload, Plus, X, Image as ImageIcon, Check, Star, Laptop, Link as LinkIcon } from 'lucide-react';
import { processImageFile } from './ImageUploadInput.tsx';

interface MultiImageUploadInputProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  required?: boolean;
}

export const MultiImageUploadInput: React.FC<MultiImageUploadInputProps> = ({
  images,
  onChange,
  label = 'Fotos do Produto',
  required = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const processed: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.type.startsWith('image/')) {
          const dataUrl = await processImageFile(f, 900, 0.84);
          processed.push(dataUrl);
        }
      }
      if (processed.length > 0) {
        onChange([...images, ...processed]);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar fotos do computador');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlField(false);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-medium text-stone-700">
          {label} {required && <span className="text-rose-500">*</span>}
          <span className="text-stone-400 font-normal ml-1.5">
            ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-[11px] text-[#5B1525] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlField ? 'Ocultar Link URL' : 'Adicionar via Link URL'}</span>
        </button>
      </div>

      {showUrlField && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Cole o link da foto (https://...)"
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-medium cursor-pointer"
          >
            Adicionar
          </button>
        </div>
      )}

      {/* Gallery of Uploaded Photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`group relative rounded-2xl overflow-hidden border aspect-[3/4] bg-stone-100 transition-all ${
                idx === 0 ? 'ring-2 ring-[#5B1525] border-transparent' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = '0.3';
                }}
              />

              {/* Cover badge */}
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-[#5B1525] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Capa
                </span>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Excluir foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="w-full py-1.5 bg-white/90 hover:bg-white text-stone-900 text-[10px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Definir como Capa</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone to Add From Computer */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#5B1525] bg-rose-50/50'
            : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#5B1525]/10 text-[#5B1525] flex items-center justify-center">
            <Upload className={`w-4 h-4 ${isProcessing ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <p className="font-semibold text-stone-800">
              {isProcessing ? 'Comprimindo e carregando fotos...' : 'Escolher fotos do computador'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Selecione uma ou mais fotos do seu computador (JPG, PNG, WebP)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
