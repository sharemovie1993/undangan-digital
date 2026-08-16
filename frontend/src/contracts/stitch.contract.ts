export type StitchBlockCategory =
  | 'HERO'
  | 'PROFILE'
  | 'TIMELINE'
  | 'STORY'
  | 'GALLERY'
  | 'BANK'
  | 'RSVP'
  | 'CLOSING'
  | 'MAPS';

export interface StitchBlockManifest {
  id: string;
  category: StitchBlockCategory;
  name: string;
  supportedEvents: ('wedding' | 'khitanan' | 'aqiqah' | 'birthday')[];
  defaultTokens: Record<string, string>;
}

export interface StitchBlockInstance {
  id: string;
  blockId: string;
  name: string;
  category: StitchBlockCategory;
  isEnabled: boolean;
  order: number;
}
