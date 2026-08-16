import React from 'react';
import { InvitationData } from '../../types';
import { CreditCard, Plus, Trash2, Gift, MapPin } from 'lucide-react';

interface BankGiftFormProps {
  data: InvitationData;
  onChange: (newData: InvitationData) => void;
}

export const BankGiftForm: React.FC<BankGiftFormProps> = ({ data, onChange }) => {
  const bankAccounts = data.bankAccounts || [];
  const physicalGift = data.physicalGift || {
    recipientName: data.eventTitle || 'Penerima Kado',
    phoneNumber: '+62 812-3456-7890',
    fullAddress: '',
    city: '',
    postalCode: '',
  };

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

  const updatePhysicalGift = (key: string, value: string) => {
    const updatedGift = {
      ...physicalGift,
      [key]: value
    };
    onChange({
      ...data,
      physicalGift: updatedGift,
      physicalGiftAddress: updatedGift.fullAddress ? `${updatedGift.recipientName}, ${updatedGift.fullAddress}, ${updatedGift.city}` : undefined
    });
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
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Nomor Rekening</label>
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
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-1.5 font-semibold text-[#c4a661]">
          <Gift className="w-3.5 h-3.5" />
          <span>Kirim Kado Fisik (Alamat Kirim Hadiah)</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-neutral-400 mb-1">Nama Penerima Kado</label>
            <input
              type="text"
              value={physicalGift.recipientName || ''}
              onChange={(e) => updatePhysicalGift('recipientName', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Contoh: Romeo & Juliet"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">No. HP / WhatsApp</label>
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
          <label className="block text-neutral-400 mb-1">Alamat Lengkap & Patokan Rumah</label>
          <textarea
            rows={2}
            value={physicalGift.fullAddress || ''}
            onChange={(e) => updatePhysicalGift('fullAddress', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c4a661]"
            placeholder="Jl. Merdeka No. 123, RT 01 / RW 05, Dekat Masjid Raya"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-neutral-400 mb-1">Kota / Kabupaten</label>
            <input
              type="text"
              value={physicalGift.city || ''}
              onChange={(e) => updatePhysicalGift('city', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="Bandung, Jawa Barat"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Kode Pos</label>
            <input
              type="text"
              value={physicalGift.postalCode || ''}
              onChange={(e) => updatePhysicalGift('postalCode', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#c4a661]"
              placeholder="40115"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
