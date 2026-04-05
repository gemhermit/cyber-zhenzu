import type { MemorialDay } from '../types';
import type { Ancestor } from '../types';

export const DEMO_ANCESTORS: Ancestor[] = [
  {
    id: 'anc-1',
    name: '曾祖父 陈德福',
    generation: 'zǔ',
    birthYear: 1921,
    deathYear: 1998,
    photoUrl: '',
    relationship: '曾祖父',
    bio: '一生勤俭持家，乐善好施',
  },
  {
    id: 'anc-2',
    name: '曾祖母 陈林氏',
    generation: 'bǐ',
    birthYear: 1925,
    deathYear: 2001,
    photoUrl: '',
    relationship: '曾祖母',
    bio: '慈祥和蔼，抚育后代',
  },
  {
    id: 'anc-3',
    name: '祖父 陈建国',
    generation: 'kǎo',
    birthYear: 1948,
    deathYear: 2019,
    photoUrl: '',
    relationship: '祖父',
    bio: '技艺精湛，为人正直',
  },
];

export const DEMO_MEMORIAL_DAYS: MemorialDay[] = [
  {
    id: 'mem-1',
    ancestorId: 'anc-1',
    date: '04-05',
    label: '忌日',
  },
  {
    id: 'mem-2',
    ancestorId: 'anc-3',
    date: '02-20',
    label: '忌日',
  },
];

export const OFFERING_LABELS: Record<string, { zh: string; en: string; emoji: string }> = {
  fruit: { zh: '水果', en: 'Fruit', emoji: '🍎' },
  tea: { zh: '清茶', en: 'Tea', emoji: '🍵' },
  wine: { zh: '清酒', en: 'Wine', emoji: '🍶' },
  sweet: { zh: '糕点', en: 'Sweets', emoji: '🍡' },
  flower: { zh: '鲜花', en: 'Flowers', emoji: '🌸' },
  zongzi: { zh: '粽子', en: 'Zongzi', emoji: '🍙' },
};

export const INCENSE_LABELS: Record<string, { zh: string; en: string; color: string }> = {
  sandalwood: { zh: '檀香', en: 'Sandalwood', color: '#f4a825' },
  agarwood: { zh: '沉香', en: 'Agarwood', color: '#e63946' },
  mugwort: { zh: '艾草', en: 'Mugwort', color: '#7cb342' },
};

export const PAPER_OFFERING_LABELS: Record<string, { zh: string; en: string }> = {
  gold_ingot: { zh: '金元宝', en: 'Gold Ingot' },
  silver_ingot: { zh: '银元宝', en: 'Silver Ingot' },
  spirit_money: { zh: '纸钱', en: 'Spirit Money' },
  spirit_clothes: { zh: '纸衣服', en: 'Spirit Clothes' },
  spirit_house: { zh: '纸房子', en: 'Spirit House' },
};
