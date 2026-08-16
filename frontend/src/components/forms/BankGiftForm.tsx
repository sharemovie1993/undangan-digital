import React, { useState } from 'react';
import { InvitationData, PhysicalGiftAddress } from '../../types';
import { CreditCard, Plus, Trash2, Gift, MapPin, ExternalLink, Copy, Check, MessageSquare, Phone } from 'lucide-react';

interface BankGiftFormProps {
  data: InvitationData;
  onChange: (newData: InvitationData) => void;
}

export const BankGiftForm: React.FC<BankGiftFormProps> = ({ data, onChange }) => {
  const bankAccounts = data.bankAccounts || [];
  const physicalGift: PhysicalGiftAddress = data.physicalGift || {
    recipientName: data.eventTitle || 'Penerima Kado',
    phoneNumber: '+62 812-3456-7890',
    fullAddress: '',
    city: '',
    postalCode: '',
    mapsUrl: '',
    notes: '',
  };

  const [copiedTest, setCopiedTest] = useState(false);

  const updateAccount = (index: number, key: string, value: string) => {
    const updated = [...bankAccounts];
    updated[index] = { ...updated[index], [key]: value };
    onChange({ ...data, bankAccounts: updated });
  };

  const addAccount = () => {
    const newAcc = {
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: data.eventTitle || 'Penerima Hadiah',
      qrImageUrl: ''
    };
    onChange({ ...data, bankAccounts: [...bankAccounts, newAcc] });
  };

  const removeAccount = (index: number) => {
    const updated = bankAccounts.filter((_, i) => i !== index);
    onChange({ ...data, bankAccounts: updated });
  };

  const updatePhysicalGift = (key: keyof PhysicalGiftAddress, value: string) => {
    const updatedGift: PhysicalGiftAddress = {
      ...physicalGift,
      [key]: value
    };
    onChange({
      ...data,
      physicalGift: updatedGift,
      physicalGiftAddress: updatedGift.fullAddress ? `${updatedGift.recipientName}, ${updatedGift.fullAddress}, ${updatedGift.city}` : undefined
    });
  };

  const handleTestCopyAddress = () => {
    const text = `${physicalGift.recipientName || ''}\n${physicalGift.phoneNumber || ''}\n${physicalGift.fullAddress || ''}, ${physicalGift.city || ''} ${physicalGift.postalCode || ''}\n${physicalGift.notes ? `(Catatan: ${physicalGift.notes})` : ''}`.trim();
    navigator.clipboard.writeText(text);
    setCopiedTest(true);
    setTimeout(() => setCopiedTest(false), 2000);
  };

  return (
    <div className="space-y-5 text-xs">
      {/* 1. BANK ACCOUNTS & E-WALLETS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400 font-medium">Daftar Rekening & E-Wallet</span>
          <button
            type="button"
            onClick={addAccount}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#c4a661] hover:text-[#d5b874] bg-[#c4a661]/10 px-2.5 py-1 rounded-lg border border-[#c4a661]/30 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Rekening</span>
          </button>
        </div>

        {bankAccounts.map((acc, index) => (
          <div key={index} className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <CreditCard className="w-3.5 h-3.5 text-[#c4a661]" />
                <span>Rekening #{index + 1}</span>
              </div>
              {bankAccounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAccount(index)}
                  className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1">Pilihan Bank / Dompet</label>
                <select
                  value={acc.bankName}
                  onChange={(e) => updateAccount(index, 'bankName', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                  <option value="BSI">BSI (Syariah)</option>
                  <option value="DANA">DANA</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="QRIS">QRIS Standar</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Nomor Rekening / No. HP</label>
                <input
                  type="text"
                  value={acc.accountNumber}
                  onChange={(e) => updateAccount(index, 'accountNumber', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Atas Nama (Pemilik Rekening)</label>
              <input
                type="text"
                value={acc.accountHolder}
                onChange={(e) => updateAccount(index, 'accountHolder', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                placeholder="Romeo Aris Pratama"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 2. PHYSICAL GIFT DELIVERY SECTION */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-[#c4a661]">
            <Gift className="w-4 h-4" />
            <span>Alamat Pengiriman Kado Fisik</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            Terintegrasi
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Tamu undangan dapat melihat alamat ini dan menyalinnya dengan 1-klik untuk mengirim kado paket/kurir ke rumah Anda.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Nama Penerima Kado</label>
            <input
              type="text"
              value={physicalGift.recipientName || ''}
              onChange={(e) => updatePhysicalGift('recipientName', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Contoh: Romeo & Juliet"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">No. HP / WhatsApp Penerima</label>
            <input
              type="text"
              value={physicalGift.phoneNumber || ''}
              onChange={(e) => updatePhysicalGift('phoneNumber', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="0812-3456-7890"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 mb-1 font-medium">Alamat Lengkap (Jalan, RT/RW, No. Rumah, Patokan)</label>
          <textarea
            rows={2}
            value={physicalGift.fullAddress || ''}
            onChange={(e) => updatePhysicalGift('fullAddress', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
            placeholder="Jl. Merdeka No. 123, RT 01 / RW 05, Kelurahan Babakan, Dekat Masjid Raya"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Kota / Kabupaten & Provinsi</label>
            <input
              type="text"
              value={physicalGift.city || ''}
              onChange={(e) => updatePhysicalGift('city', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Bandung, Jawa Barat"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Kode Pos</label>
            <input
              type="text"
              value={physicalGift.postalCode || ''}
              onChange={(e) => updatePhysicalGift('postalCode', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="40115"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Link Google Maps (Opsional)</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="url"
                value={physicalGift.mapsUrl || ''}
                onChange={(e) => updatePhysicalGift('mapsUrl', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Instruksi Kurir / Catatan</label>
            <input
              type="text"
              value={physicalGift.notes || ''}
              onChange={(e) => updatePhysicalGift('notes', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Titip ke Pos Satpam / Bel Rumah Hitam"
            />
          </div>
        </div>

        {/* Live Preview Box */}
        {(physicalGift.fullAddress || physicalGift.recipientName) && (
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span className="font-semibold text-neutral-300">Pratinjau Kartu Alamat Kado:</span>
              <button
                type="button"
                onClick={handleTestCopyAddress}
                className="flex items-center gap-1 text-[#c4a661] hover:underline cursor-pointer"
              >
                {copiedTest ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTest ? 'Tersalin!' : 'Tes Salin'}</span>
              </button>
            </div>
            <div className="text-[11px] text-neutral-300 font-mono space-y-0.5">
              <p className="font-bold text-white">{physicalGift.recipientName || 'Nama Penerima'}</p>
              <p className="text-neutral-400">{physicalGift.phoneNumber || 'Nomor HP'}</p>
              <p className="text-neutral-300">
                {physicalGift.fullAddress || 'Alamat lengkap'}
                {physicalGift.city ? `, ${physicalGift.city}` : ''}
                {physicalGift.postalCode ? ` ${physicalGift.postalCode}` : ''}
              </p>
              {physicalGift.notes && (
                <p className="text-amber-400/90 text-[10px] italic">Catatan: {physicalGift.notes}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
