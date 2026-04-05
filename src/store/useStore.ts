import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ancestor, Offering, PaperOffering, Prayer, MemorialDay, LitIncense, NavSection, RitualStep } from '../types';
import { DEMO_ANCESTORS, DEMO_MEMORIAL_DAYS } from '../data/demo';

interface AppState {
  // Navigation
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;

  // Ancestors
  ancestors: Ancestor[];
  activeAncestorId: string | null;
  addAncestor: (a: Ancestor) => void;
  removeAncestor: (id: string) => void;
  setActiveAncestor: (id: string | null) => void;

  // Offerings
  placedOfferings: Offering[];
  placeOffering: (o: Offering) => void;
  removeOffering: (id: string) => void;

  // Incense
  litIncense: LitIncense[];
  lightIncense: (i: Omit<LitIncense, 'id' | 'litAt'>) => void;
  extinguishIncense: (id: string) => void;

  // Paper offerings
  paperOfferings: PaperOffering[];
  addPaperOffering: (type: PaperOffering['type']) => void;
  burnPaperOffering: (id: string) => void;
  completePaperBurn: (id: string) => void;
  removePaperOffering: (id: string) => void;
  clearBurnedPaper: () => void;

  // Prayers
  prayers: Prayer[];
  addPrayer: (p: Omit<Prayer, 'id' | 'timestamp' | 'lit'>) => void;
  lightPrayer: (id: string) => void;
  removePrayer: (id: string) => void;

  // Memorial days
  memorialDays: MemorialDay[];
  addMemorialDay: (m: Omit<MemorialDay, 'id'>) => void;
  removeMemorialDay: (id: string) => void;
  toggleReminder: (id: string) => void;

  // Ritual
  ritualActive: boolean;
  ritualStep: number;
  ritualSteps: RitualStep[];
  startRitual: () => void;
  advanceRitual: () => void;
  endRitual: () => void;

  // Stats
  totalIncenseBurned: number;
  totalPaperBurned: number;
  incrementIncenseBurned: () => void;
  incrementPaperBurned: (n: number) => void;

  // Bell
  bellRinging: boolean;
  ringBell: () => void;
}

const RITUAL_STEPS: RitualStep[] = [
  { id: 1, name: '点香', nameEn: 'Light Incense', icon: '🔥', completed: false },
  { id: 2, name: '献供', nameEn: 'Present Offerings', icon: '🍎', completed: false },
  { id: 3, name: '敬酒', nameEn: 'Pour Tea/Wine', icon: '🍶', completed: false },
  { id: 4, name: '上香', nameEn: 'Offer Incense', icon: '香', completed: false },
  { id: 5, name: '叩拜', nameEn: 'Kowtow', icon: '🙏', completed: false },
  { id: 6, name: '鸣钟', nameEn: 'Ring Bell', icon: '🔔', completed: false },
  { id: 7, name: '化纸', nameEn: 'Burn Offerings', icon: '💰', completed: false },
  { id: 8, name: '祈福', nameEn: 'Pray & Bless', icon: '✨', completed: false },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeSection: 'altar',
      setActiveSection: (s) => set({ activeSection: s }),

      // Ancestors
      ancestors: DEMO_ANCESTORS,
      activeAncestorId: 'anc-1',
      addAncestor: (a) => set((st) => ({ ancestors: [...st.ancestors, a] })),
      removeAncestor: (id) => set((st) => ({
        ancestors: st.ancestors.filter((a) => a.id !== id),
        activeAncestorId: st.activeAncestorId === id ? null : st.activeAncestorId,
      })),
      setActiveAncestor: (id) => set({ activeAncestorId: id }),

      // Offerings
      placedOfferings: [],
      placeOffering: (o) => set((st) => ({ placedOfferings: [...st.placedOfferings, o] })),
      removeOffering: (id) => set((st) => ({ placedOfferings: st.placedOfferings.filter((o) => o.id !== id) })),

      // Incense
      litIncense: [],
      lightIncense: (i) => {
        const id = `inc-${Date.now()}`;
        set((st) => ({ litIncense: [...st.litIncense, { ...i, id, litAt: Date.now() }] }));
      },
      extinguishIncense: (id) => set((st) => ({
        litIncense: st.litIncense.filter((i) => i.id !== id),
        totalIncenseBurned: st.totalIncenseBurned + 1,
      })),

      // Paper offerings
      paperOfferings: [],
      addPaperOffering: (type) => {
        const id = `po-${Date.now()}-${Math.random()}`;
        set((st) => ({ paperOfferings: [...st.paperOfferings, { id, type, burning: false }] }));
      },
      burnPaperOffering: (id) => {
        set((st) => {
          return {
            paperOfferings: st.paperOfferings.map((p) =>
              p.id === id ? { ...p, burning: true } : p
            ),
          };
        });
      },
      completePaperBurn: (id) => {
        set((st) => ({
          paperOfferings: st.paperOfferings.map((p) =>
            p.id === id ? { ...p, burning: false, burnedAt: Date.now() } : p
          ),
          totalPaperBurned: st.totalPaperBurned + 1,
        }));
      },
      removePaperOffering: (id) => set((st) => ({
        paperOfferings: st.paperOfferings.filter((p) => p.id !== id),
      })),
      clearBurnedPaper: () => set((st) => ({
        paperOfferings: st.paperOfferings.filter((p) => !p.burnedAt),
      })),

      // Prayers
      prayers: [],
      addPrayer: (p) => {
        const id = `pr-${Date.now()}`;
        set((st) => ({ prayers: [...st.prayers, { ...p, id, timestamp: Date.now(), lit: false }] }));
      },
      lightPrayer: (id) => set((st) => ({
        prayers: st.prayers.map((p) => p.id === id ? { ...p, lit: true } : p),
      })),
      removePrayer: (id) => set((st) => ({ prayers: st.prayers.filter((p) => p.id !== id) })),

      // Memorial days
      memorialDays: DEMO_MEMORIAL_DAYS,
      addMemorialDay: (m) => {
        const id = `mem-${Date.now()}`;
        set((st) => ({ memorialDays: [...st.memorialDays, { ...m, id }] }));
      },
      removeMemorialDay: (id) => set((st) => ({
        memorialDays: st.memorialDays.filter((m) => m.id !== id),
      })),
      toggleReminder: (id) => set((st) => ({
        memorialDays: st.memorialDays.map((m) =>
          m.id === id ? { ...m, reminded: !m.reminded } : m
        ),
      })),

      // Ritual
      ritualActive: false,
      ritualStep: 0,
      ritualSteps: RITUAL_STEPS,
      startRitual: () => set({
        ritualActive: true,
        ritualStep: 1,
        ritualSteps: RITUAL_STEPS.map((s) => ({ ...s, completed: false })),
      }),
      advanceRitual: () => {
        const { ritualStep, ritualSteps } = get();
        const nextStep = ritualStep + 1;
        if (nextStep > RITUAL_STEPS.length) {
          set({ ritualActive: false, ritualStep: 0 });
        } else {
          const updated = ritualSteps.map((s) =>
            s.id === ritualStep ? { ...s, completed: true } : s
          );
          set({ ritualStep: nextStep, ritualSteps: updated });
        }
      },
      endRitual: () => set({
        ritualActive: false,
        ritualStep: 0,
        ritualSteps: RITUAL_STEPS.map((s) => ({ ...s, completed: false })),
      }),

      // Stats
      totalIncenseBurned: 0,
      totalPaperBurned: 0,
      incrementIncenseBurned: () => set((st) => ({ totalIncenseBurned: st.totalIncenseBurned + 1 })),
      incrementPaperBurned: (n) => set((st) => ({ totalPaperBurned: st.totalPaperBurned + n })),

      // Bell
      bellRinging: false,
      ringBell: () => {
        set({ bellRinging: true });
        setTimeout(() => set({ bellRinging: false }), 1200);
      },
    }),
    {
      name: 'cyber-zhenzu-storage',
      partialize: (state) => ({
        ancestors: state.ancestors,
        placedOfferings: state.placedOfferings,
        prayers: state.prayers,
        memorialDays: state.memorialDays,
        totalIncenseBurned: state.totalIncenseBurned,
        totalPaperBurned: state.totalPaperBurned,
      }),
    }
  )
);
