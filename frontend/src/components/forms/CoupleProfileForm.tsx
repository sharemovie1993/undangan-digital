import React, { useState, useCallback } from 'react';
import { InvitationData } from '../../types';
import { User, Heart, Upload, Loader2, Cake, Sparkles, Moon } from 'lucide-react';
import { api } from '../../api/client';
import { compressImage } from '../../utils/imageCompressor';
import { useLocalField } from '../../hooks/useLocalField';

interface CoupleProfileFormProps {
  data: InvitationData;
  onChange: (newData: InvitationData) => void;
}

export const CoupleProfileForm: React.FC<CoupleProfileFormProps> = ({ data, onChange }) => {
  const isWedding = data.eventType === 'wedding';
  const isKhitan = data.eventType === 'khitanan';
  const isAqiqah = data.eventType === 'aqiqah';
  const isBirthday = data.eventType === 'birthday';

  const profiles = data.profiles || [];
  const p1 = profiles[0] || { name: 'Romeo Aris', role: 'Mempelai Pria', bio: 'Putra dari Bpk. Handoko & Ibu Ratna', photoUrl: '' };
  const p2 = profiles[1] || { name: 'Juliet Sarah', role: 'Mempelai Wanita', bio: 'Putri dari Bpk. Suryadi & Ibu Dewi', photoUrl: '' };

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const updateProfile = useCallback((index: number, key: string, value: string) => {
    const updated = [...(data.profiles || [])];
    if (!updated[index]) {
      updated[index] = { name: '', role: '', bio: '', photoUrl: '' };
    }

    if (key === 'name') {
      updated[index] = { ...updated[index], name: value, fullName: value };
    } else if (key === 'bio') {
      updated[index] = { ...updated[index], bio: value, fatherName: undefined, motherName: undefined };
    } else {
      updated[index] = { ...updated[index], [key]: value };
    }

    // Update main title if names changed
    let newTitle = data.eventTitle;
    if (isWedding && updated[0] && updated[1]) {
      newTitle = `${(updated[0].name || '').split(' ')[0]} & ${(updated[1].name || '').split(' ')[0]}`;
    } else if (updated[0]) {
      newTitle = isKhitan
        ? `Walimatul Khitan ${(updated[0].name || '').split(' ')[0]}`
        : isAqiqah
        ? `Tasyakuran Aqiqah ${(updated[0].name || '').split(' ')[0]}`
        : isBirthday
        ? `${(updated[0].name || '').split(' ')[0]}'s Birthday`
        : updated[0].name;
    }

    onChange({
      ...data,
      eventTitle: newTitle,
      profiles: updated
    });
  }, [data, onChange, isWedding, isKhitan, isAqiqah, isBirthday]);

  // 📱 Local-buffered fields — tiap input punya state sendiri, parent diupdate 400ms setelah berhenti ketik
  const [localP1Name, setLocalP1Name] = useLocalField(p1.name || '', useCallback((v: string) => updateProfile(0, 'name', v), [updateProfile]));
  const [localP1Bio, setLocalP1Bio] = useLocalField(p1.bio || '', useCallback((v: string) => updateProfile(0, 'bio', v), [updateProfile]));
  const [localP1Photo, setLocalP1Photo] = useLocalField(p1.photoUrl || '', useCallback((v: string) => updateProfile(0, 'photoUrl', v), [updateProfile]));
  const [localP2Name, setLocalP2Name] = useLocalField(p2.name || '', useCallback((v: string) => updateProfile(1, 'name', v), [updateProfile]));
  const [localP2Bio, setLocalP2Bio] = useLocalField(p2.bio || '', useCallback((v: string) => updateProfile(1, 'bio', v), [updateProfile]));
  const [localP2Photo, setLocalP2Photo] = useLocalField(p2.photoUrl || '', useCallback((v: string) => updateProfile(1, 'photoUrl', v), [updateProfile]));

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(index);
    try {
      const optimizedFile = await compressImage(file, 1000, 1000, 0.85);
      const res = await api.uploadImage(optimizedFile);
      if (res.data?.fileUrl) {
        updateProfile(index, 'photoUrl', res.data.fileUrl);
      }
    } catch (err) {
      console.warn('Upload error, fallback to base64 reader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateProfile(index, 'photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIdx(null);
    }
  };

  const getProfile1Title = () => {
    if (isWedding) return 'Mempelai Pria';
    if (isKhitan) return 'Profil Anak yang Dikhitan';
    if (isAqiqah) return 'Profil Bayi / Buah Hati';
    if (isBirthday) return 'Profil Yang Berulang Tahun';
    return 'Profil Utama';
  };

  const getProfile1NamePlaceholder = () => {
    if (isWedding) return 'Contoh: Romeo Aris Pratama, S.Kom';
    if (isKhitan) return 'Contoh: Muhammad Rayyan Al-Farizi';
    if (isAqiqah) return 'Contoh: Aisyah Humaira Putri';
    if (isBirthday) return 'Contoh: Valerie Anastasia';
    return 'Nama Lengkap';
  };

  const getProfile1BioLabel = () => {
    if (isBirthday) return 'Usia / Keterangan Ulang Tahun';
    return 'Nama Orang Tua (Ayah & Ibu)';
  };

  const getProfile1BioPlaceholder = () => {
    if (isBirthday) return 'Contoh: Sweet 17th Celebration';
    return 'Contoh: Putra tercinta dari Bpk. Fauzi & Ibu Siti';
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Profil 1 */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#c4a661]">
          {isKhitan ? <Moon className="w-3.5 h-3.5 text-emerald-400" /> : isBirthday ? <Cake className="w-3.5 h-3.5 text-pink-400" /> : <User className="w-3.5 h-3.5" />}
          <span>{getProfile1Title()}</span>
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">Nama Lengkap & Gelar</label>
          <input
            type="text"
            value={localP1Name}
            onChange={(e) => setLocalP1Name(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
            placeholder={getProfile1NamePlaceholder()}
          />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">{getProfile1BioLabel()}</label>
          <input
            type="text"
            value={localP1Bio}
            onChange={(e) => setLocalP1Bio(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
            placeholder={getProfile1BioPlaceholder()}
          />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">Foto Profil (URL atau Upload File)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localP1Photo}
              onChange={(e) => setLocalP1Photo(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="https://... atau upload file ->"
            />
            <label className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer flex items-center gap-1 shrink-0 border border-neutral-700">
              {uploadingIdx === 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4a661]" /> : <Upload className="w-3.5 h-3.5 text-[#c4a661]" />}
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(0, e)}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Profil 2 (Mempelai Wanita - Khusus Wedding) */}
      {isWedding && (
        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-[#c4a661]">
            <Heart className="w-3.5 h-3.5" />
            <span>Mempelai Wanita</span>
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              value={localP2Name}
              onChange={(e) => setLocalP2Name(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Contoh: Juliet Sarah Aulia, S.Ked"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Nama Orang Tua (Ayah & Ibu)</label>
            <input
              type="text"
              value={localP2Bio}
              onChange={(e) => setLocalP2Bio(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Putri kedua dari Bpk. Suryadi & Ibu Dewi"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Foto Profil (URL atau Upload File)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localP2Photo}
                onChange={(e) => setLocalP2Photo(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                placeholder="https://... atau upload file ->"
              />
              <label className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer flex items-center gap-1 shrink-0 border border-neutral-700">
                {uploadingIdx === 1 ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c4a661]" /> : <Upload className="w-3.5 h-3.5 text-[#c4a661]" />}
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(1, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
