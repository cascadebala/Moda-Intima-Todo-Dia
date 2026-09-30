import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Laptop, Check } from 'lucide-react';

export function processImageFile(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for best compression & Firestore storage efficiency
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao processar imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo do computador.'));
    reader.readAsDataURL(file);
  });
}

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  aspectRatio?: 'video' | 'square' | 'portrait';
  placeholder?: string;
  maxDimension?: number;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label = 'Imagem',
  required = false,
  aspectRatio = 'video',
  placeholder = 'Cole a URL da imagem ou envie do computador...',
  maxDimension = 1200
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleProcessFile(file);
  };

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file, maxDimension);
      onChange(dataUrl);
    } catch (err: any) {
      alert(err.message || 'Falha ao carregar a imagem do computador');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : 'aspect-video';

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-medium text-stone-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Laptop className="w-3 h-3 text-[#5B1525]" />
            <span>Do Computador</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'url' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LinkIcon className="w-3 h-3 text-[#5B1525]" />
            <span>URL Web</span>
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#5B1525] bg-rose-50/50'
              : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#5B1525]/10 text-[#5B1525] flex items-center justify-center">
              <Upload className={`w-5 h-5 ${isProcessing ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <p className="font-semibold text-stone-800">
                {isProcessing ? 'Processando imagem...' : 'Clique para escolher do computador'}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                ou arraste e solte o arquivo aqui (JPG, PNG, WebP)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 pr-8 text-xs focus:bg-white focus:outline-hidden focus:border-[#5B1525]"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Image Preview & Details */}
      {value && (
        <div className="flex items-center gap-3 p-2 bg-stone-100/70 border border-stone-200 rounded-xl">
          <div className={`w-16 ${aspectClass} rounded-lg overflow-hidden bg-white border border-stone-200 shrink-0`}>
            <img
              src={value}
              alt="Prévia"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>Imagem carregada com sucesso</span>
            </div>
            <p className="text-[10px] text-stone-500 truncate mt-0.5">
              {value.startsWith('data:image') ? 'Arquivo do computador (otimizado para nuvem)' : value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Remover imagem"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
