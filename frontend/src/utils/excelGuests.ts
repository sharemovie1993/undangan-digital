import * as XLSX from 'xlsx';
import { GuestRecipient } from '../types';

export interface ParsedGuestRow {
  name: string;
  addressOrCity?: string;
  group?: string;
  paxQuota?: number;
}

/**
 * Generates and downloads a real formatted .xlsx file containing all guests.
 */
export const exportGuestsToExcel = (guests: GuestRecipient[], invitationTitle = 'Undangan') => {
  const cleanTitle = invitationTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const fileName = `Daftar_Tamu_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxury.absenta.id';

  const rows = guests.map((g, idx) => ({
    No: idx + 1,
    'Nama Tamu': g.name,
    'Kota / Alamat': g.addressOrCity || '-',
    'Kategori / Grup': g.group || 'Tamu Undangan',
    'Kuota (Pax)': g.paxQuota || 2,
    'Status Check-In': g.hasOpened ? 'Sudah Membuka / Hadir' : 'Belum Membuka',
    'Tautan Undangan Khusus': `${baseUrl}/?to=${encodeURIComponent(g.name)}`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for optimal reading in Microsoft Excel
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 30 }, // Nama Tamu
    { wch: 22 }, // Kota / Alamat
    { wch: 18 }, // Kategori / Grup
    { wch: 12 }, // Kuota
    { wch: 22 }, // Status
    { wch: 45 }, // Tautan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Tamu');
  XLSX.writeFile(workbook, fileName);
};

/**
 * Downloads a ready-to-fill Excel template for bulk importing guests.
 */
export const downloadGuestTemplateExcel = () => {
  const sampleRows = [
    {
      'Nama Tamu (Wajib)': 'Bpk. Dr. Hendra Suprayogi & Istri',
      'Kota / Alamat (Opsional)': 'Jakarta Selatan',
      'Kategori / Grup (Opsional)': 'VVIP',
      'Kuota Pax (Opsional)': 2,
    },
    {
      'Nama Tamu (Wajib)': 'Ibu Hj. Aminah & Keluarga',
      'Kota / Alamat (Opsional)': 'Bandung',
      'Kategori / Grup (Opsional)': 'Keluarga',
      'Kuota Pax (Opsional)': 4,
    },
    {
      'Nama Tamu (Wajib)': 'Dimas Aditya & Partner',
      'Kota / Alamat (Opsional)': 'Surabaya',
      'Kategori / Grup (Opsional)': 'Sahabat',
      'Kuota Pax (Opsional)': 2,
    },
    {
      'Nama Tamu (Wajib)': 'dr. Farhan Maulana',
      'Kota / Alamat (Opsional)': 'Jakarta',
      'Kategori / Grup (Opsional)': 'Kolega',
      'Kuota Pax (Opsional)': 1,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 35 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Tamu');
  XLSX.writeFile(workbook, 'template_daftar_tamu_undangan.xlsx');
};

/**
 * Reads and parses an uploaded .xlsx, .xls, or .csv file into guest objects.
 */
export const parseExcelOrCsvFile = async (file: File): Promise<ParsedGuestRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedList: ParsedGuestRow[] = [];

        rawJson.forEach((row) => {
          // Normalize column keys to lowercase for flexible matching
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            normalized[key.trim().toLowerCase()] = row[key];
          });

          // Find name column
          const name =
            normalized['nama'] ||
            normalized['nama tamu'] ||
            normalized['nama tamu (wajib)'] ||
            normalized['name'] ||
            normalized['guest name'] ||
            normalized['tamu'] ||
            row[Object.keys(row)[0]]; // Fallback to first column

          if (!name || typeof name !== 'string' || !name.trim()) return;

          // Find city/address column
          const addressOrCity =
            normalized['kota'] ||
            normalized['alamat'] ||
            normalized['kota / alamat'] ||
            normalized['kota / alamat (opsional)'] ||
            normalized['city'] ||
            normalized['address'] ||
            '';

          // Find category/group column
          const group =
            normalized['kategori'] ||
            normalized['grup'] ||
            normalized['group'] ||
            normalized['kategori / grup'] ||
            normalized['kategori / grup (opsional)'] ||
            normalized['category'] ||
            'Tamu Undangan';

          // Find pax quota
          const paxVal =
            normalized['kuota'] ||
            normalized['pax'] ||
            normalized['kuota pax'] ||
            normalized['kuota pax (opsional)'] ||
            normalized['quota'];
          const paxQuota = Number(paxVal) && Number(paxVal) > 0 ? Number(paxVal) : 2;

          parsedList.push({
            name: name.trim(),
            addressOrCity: typeof addressOrCity === 'string' ? addressOrCity.trim() : String(addressOrCity),
            group: typeof group === 'string' ? group.trim() : 'Tamu Undangan',
            paxQuota,
          });
        });

        resolve(parsedList);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
