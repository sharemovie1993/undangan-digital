import fs from 'fs';
import path from 'path';

export interface OtpRecord {
  otp: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  mode: 'login' | 'register';
  role?: 'USER' | 'RESELLER' | 'PERCETAKAN';
  name?: string;
  email?: string;
}

const STORAGE_FILE = path.join(__dirname, '../../data/otp_store.json');

function ensureDir() {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadAll(): Record<string, OtpRecord> {
  ensureDir();
  if (!fs.existsSync(STORAGE_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, OtpRecord>) {
  ensureDir();
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[OtpStore File Write Error]', err);
  }
}

export const PersistentOtpStore = {
  get(key: string): OtpRecord | null {
    const all = loadAll();
    const entry = all[key];
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      delete all[key];
      saveAll(all);
      return null;
    }
    return entry;
  },

  find(phone: string): { key: string; entry: OtpRecord } | null {
    const all = loadAll();
    const raw = phone.trim();
    const digits = raw.replace(/[^0-9]/g, '') || raw;
    let std = digits;
    if (std.startsWith('0')) std = '62' + std.slice(1);
    else if (std.startsWith('8')) std = '62' + std;

    const candidates = [std, digits, raw, `+${digits}`, `0${digits.replace(/^62/, '')}`];
    for (const c of candidates) {
      if (all[c] && all[c].expiresAt >= Date.now()) {
        return { key: c, entry: all[c] };
      }
    }

    if (digits.length >= 7) {
      const tail = digits.slice(-7);
      for (const [k, v] of Object.entries(all)) {
        if (v.expiresAt >= Date.now() && (k.endsWith(tail) || digits.endsWith(k.slice(-7)))) {
          return { key: k, entry: v };
        }
      }
    }
    return null;
  },

  set(key: string, data: OtpRecord): void {
    const all = loadAll();
    all[key] = data;
    saveAll(all);
  },

  delete(key: string): void {
    const all = loadAll();
    if (all[key]) {
      delete all[key];
      saveAll(all);
    }
  },

  updateAttempts(key: string, attempts: number): void {
    const all = loadAll();
    if (all[key]) {
      all[key].attempts = attempts;
      saveAll(all);
    }
  }
};
