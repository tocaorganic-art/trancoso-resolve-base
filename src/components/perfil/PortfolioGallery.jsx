import React, { useState, useCallback } from 'react';
import { PlusCircle, Trash2, Loader2, GripVertical, ImagePlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const MAX_IMAGES = 20;
const MAX_FILE_SIZE_MB = 10;

/**
 * PortfolioGallery
 * Props:
 *  - images: string[]  (URLs actuais)
 *  - onChange(images: string[]): callback ao alterar
 */
export default function PortfolioGallery({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleFiles = useCallback(async (files) => {
    const fileArr = Array.from(files);
    const slots = MAX_IMAGES - images.length;

    if (slots <= 0) {
      toast.error(`Limite de ${MAX_IMAGES} imagens atingido.`);
      return;
    }

    const toUpload = fileArr.slice(0, slots);
    const oversized = toUpload.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`${oversized.length} arquivo(s) superam ${MAX_FILE_SIZE_MB}MB e foram ignorados.`);
    }
    const valid = toUpload.filter(f => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024 && f.type.startsWith('image/'));

    if (valid.length === 0) return;

    setUploading(true);
    let newUrls = [...images];
    let successCount = 0;

    for (const file of valid) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        newUrls = [...newUrls, file_url];
        successCount++;
      } catch {
        toast.error(`Erro ao enviar ${file.name}.`);
      }
    }

    if (successCount > 0) {
      onChange(newUrls);
      toast.success(`${successCount} foto(s) adicionada(s) ao portfólio!`);
    }
    setUploading(false);
  }, [images, onChange]);

  // Drag & drop na área de upload
  const onDropArea = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Reordenar imagens via drag
  const onDragStartItem = (idx) => setDraggingIdx(idx);
  const onDragOverItem = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const onDropItem = (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) { setDraggingIdx(null); setDragOverIdx(null); return; }
    const next = [...images];
    const [moved] = next.splice(draggingIdx, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const remove = (idx) => {
    const next = [...images];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {images.length}/{MAX_IMAGES} imagens · máx. {MAX_FILE_SIZE_MB}MB por arquivo · arraste para reordenar
        </span>
        {images.length >= MAX_IMAGES && (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Limite atingido
          </span>
        )}
      </div>

      {/* Grid de imagens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img + idx}
            draggable
            onDragStart={() => onDragStartItem(idx)}
            onDragOver={(e) => onDragOverItem(e, idx)}
            onDrop={(e) => onDropItem(e, idx)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing aspect-square
              ${dragOverIdx === idx ? 'border-blue-500 scale-105' : 'border-transparent'}
              ${draggingIdx === idx ? 'opacity-40' : 'opacity-100'}
            `}
          >
            <img
              src={img}
              alt={`Portfólio ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay com ações */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
              <div className="text-white/60 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                title="Remover foto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {/* Badge de posição */}
            <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              {idx + 1}
            </span>
          </div>
        ))}

        {/* Área de upload */}
        {images.length < MAX_IMAGES && (
          <label
            htmlFor="portfolio-multi-upload"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDropArea}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
              ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            ) : (
              <>
                <ImagePlus className="w-7 h-7 text-slate-400 mb-1.5" />
                <span className="text-xs text-slate-500 text-center leading-tight px-2">
                  Clique ou arraste<br />fotos aqui
                </span>
              </>
            )}
            <input
              id="portfolio-multi-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {images.length === 0 && !uploading && (
        <p className="text-xs text-slate-400 text-center py-2">
          Adicione fotos dos seus trabalhos (antes/depois, projetos concluídos, produtos) para atrair mais clientes.
        </p>
      )}
    </div>
  );
}