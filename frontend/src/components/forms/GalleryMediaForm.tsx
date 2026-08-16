import React, { useState } from 'react';
import { InvitationData } from '../../types';
import { Image, Plus, Trash2, Video, Upload, Loader2, Images } from 'lucide-react';
import { api } from '../../api/client';
import { compressImage } from '../../utils/imageCompressor';

interface GalleryMediaFormProps {
  data: InvitationData;
  onChange: (newData: InvitationData) => void;
}

export const GalleryMediaForm: React.FC<GalleryMediaFormProps> = ({ data, onChange }) => {
  const gallery = data.gallery || [];
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Single file upload with client-side WebP compression
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimizedFile = await compressImage(file, 1400, 1400, 0.82);
      const res = await api.uploadImage(optimizedFile);
      if (res.data?.fileUrl) {
        setNewPhotoUrl(res.data.fileUrl);
      }
    } catch (err) {
      console.warn('Upload error, fallback to base64 reader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Bulk / Multiple files upload with concurrent WebP compression
  const handleBulkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    setIsBulkUploading(true);

    try {
      // Concurrent parallel compressed upload across all chosen images
      const uploadPromises = filesArray.map(async (file, idx) => {
        try {
          const optimizedFile = await compressImage(file, 1400, 1400, 0.82);
          const res = await api.uploadImage(optimizedFile);
          if (res.data?.fileUrl) {
            return {
              id: `img-${Date.now()}-${idx}-${Math.random()}`,
              url: res.data.fileUrl,
              caption: file.name.replace(/\.[^/.]+$/, '')
            };
          }
        } catch (err) {
          console.warn(`Single upload fallback for ${file.name}:`, err);
        }

        // Local fallback if single request fails
        return new Promise<any>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `img-${Date.now()}-${idx}-${Math.random()}`,
              url: typeof reader.result === 'string' ? reader.result : '',
              caption: file.name.replace(/\.[^/.]+$/, '')
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedItems = await Promise.all(uploadPromises);
      const validItems = uploadedItems.filter(item => Boolean(item && item.url));

      if (validItems.length > 0) {
        onChange({ ...data, gallery: [...gallery, ...validItems] });
      }
    } catch (err) {
      console.error('Bulk upload overall error:', err);
    } finally {
      setIsBulkUploading(false);
      // Reset input value to allow re-uploading same files if needed
      e.target.value = '';
    }
  };

  const addPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const newItem = {
      id: `img-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newCaption.trim() || 'Momen Bahagia'
    };
    onChange({ ...data, gallery: [...gallery, newItem] });
    setNewPhotoUrl('');
    setNewCaption('');
  };

  const removePhoto = (id: string) => {
    onChange({ ...data, gallery: gallery.filter(g => g.id !== id) });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Video YouTube Embed */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#c4a661]">
          <Video className="w-3.5 h-3.5" />
          <span>Video Streaming / Teaser YouTube</span>
        </div>
        <label className="block text-neutral-400 mb-1">ID Video YouTube / URL</label>
        <input
          type="text"
          value={data.youtubeVideoId || ''}
          onChange={(e) => onChange({ ...data, youtubeVideoId: e.target.value })}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
          placeholder="Contoh: dQw4w9WgXcQ"
        />
      </div>

      {/* Upload Massal Foto (Pilih Banyak Foto Sekaligus) */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-[#c4a661]/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-[#c4a661]">
            <Images className="w-4 h-4" />
            <span>Upload Massal Banyak Foto Sekaligus</span>
          </div>
          <span className="text-[10px] text-neutral-400">Pilih 5-20+ Foto</span>
        </div>

        <label className="border-2 border-dashed border-[#c4a661]/40 hover:border-[#c4a661] bg-neutral-950/70 p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center group">
          {isBulkUploading ? (
            <div className="flex items-center gap-2 text-[#c4a661] py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold text-xs">Mengunggah Foto ke Server...</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-[#c4a661]/15 text-[#c4a661] flex items-center justify-center group-hover:scale-110 transition">
                <Upload className="w-4 h-4" />
              </div>
              <span className="font-semibold text-neutral-200 text-xs">Klik untuk Memilih Banyak Foto</span>
              <span className="text-[10px] text-neutral-400">JPG, PNG, atau WEBP langsung masuk ke galeri</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={isBulkUploading}
            onChange={handleBulkFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Tambah Foto Satuan / URL Eksternal */}
      <form onSubmit={addPhoto} className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
          <Image className="w-3.5 h-3.5 text-[#c4a661]" />
          <span>Atau Tambah Foto Satuan / Link URL</span>
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">URL Gambar atau Upload 1 File</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="https://... atau upload file ->"
            />
            <label className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer flex items-center gap-1 shrink-0 border border-neutral-700">
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4a661]" /> : <Upload className="w-3.5 h-3.5 text-[#c4a661]" />}
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSingleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">Keterangan / Caption</label>
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
            placeholder="Pertama Kali Bertemu"
          />
        </div>
        <button
          type="submit"
          disabled={!newPhotoUrl.trim() || isUploading}
          className="w-full py-2 rounded-lg bg-[#c4a661] text-neutral-950 font-bold hover:bg-[#d5b874] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambahkan Foto Ini</span>
        </button>
      </form>

      {/* Grid Foto yang Ada ({gallery.length} Foto) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-neutral-400 text-[11px] px-1">
          <span>Koleksi Foto ({gallery.length})</span>
          {gallery.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...data, gallery: [] })}
              className="text-rose-400 hover:text-rose-300 text-[10px]"
            >
              Hapus Semua
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {gallery.map((item) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
              <img src={item.url} alt={item.caption} className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
              <div className="p-1.5 text-[10px] text-neutral-300 truncate">{item.caption}</div>
              <button
                type="button"
                onClick={() => removePhoto(item.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-red-400 hover:text-white"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
