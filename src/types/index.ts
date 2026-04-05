export interface Ancestor {
  id: string;
  name: string;
  generation: 'zǔ' | 'kǎo' | 'bǐ';
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string;
  relationship?: string;
  bio?: string;
}

export interface Offering {
  id: string;
  type: 'fruit' | 'tea' | 'wine' | 'sweet' | 'flower' | 'zongzi';
  placedAt?: number;
}

export interface PaperOffering {
  id: string;
  type: 'gold_ingot' | 'silver_ingot' | 'spirit_money' | 'spirit_clothes' | 'spirit_house';
  burning: boolean;
  burnedAt?: number;
}

export interface Prayer {
  id: string;
  text: string;
  timestamp: number;
  author?: string;
  type: 'family' | 'personal';
  lit: boolean;
}

export interface MemorialDay {
  id: string;
  ancestorId: string;
  date: string;
  label: string;
  reminded?: boolean;
}

export interface LitIncense {
  id: string;
  type: 'sandalwood' | 'agarwood' | 'mugwort';
  litAt: number;
  duration: number;
}

export type NavSection =
  | 'altar'
  | 'incense'
  | 'offerings'
  | 'paper'
  | 'family'
  | 'memorial'
  | 'prayers'
  | 'ritual';

export interface RitualStep {
  id: number;
  name: string;
  nameEn: string;
  icon: string;
  completed: boolean;
}
