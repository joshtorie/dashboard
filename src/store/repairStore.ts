import { create } from 'zustand';
import { RepairCard, RepairStatus } from '../types/repair';
import { supabase } from '../lib/supabase';

interface RepairStore {
  repairs: RepairCard[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchRepairs: () => Promise<void>;
  createRepair: (repair: Omit<RepairCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RepairCard>;
  updateRepair: (id: string, updates: Partial<RepairCard>) => Promise<void>;
  updateStatus: (id: string, status: RepairStatus) => Promise<void>;
}

export const useRepairStore = create<RepairStore>((set, get) => ({
  repairs: [],
  loading: false,
  error: null,
  initialized: false,

  fetchRepairs: async () => {
    const state = get();
    if (state.loading || state.initialized) {
      console.log('Skipping fetch - already loaded or loading');
      return;
    }

    console.log('Starting fetchRepairs...');
    set({ loading: true, error: null });
    try {
      console.log('Fetching from Supabase...');
      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .order('createdAt', { ascending: false });

      console.log('Supabase response:', { data: data?.length || 0, error });

      if (error) throw error;
      if (!data) throw new Error('No repairs found');

      set({ repairs: data, loading: false, initialized: true });
    } catch (error) {
      console.error('Error in fetchRepairs:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false 
      });
    }
  },

  createRepair: async (repair) => {
    set({ loading: true, error: null });
    try {
      const { data: lastRepair } = await supabase
        .from('repairs')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      const lastId = lastRepair?.[0]?.id || 'URB0000';
      const nextNumber = parseInt(lastId.substring(3)) + 1;
      const nextId = `URB${nextNumber.toString().padStart(4, '0')}`;

      const newRepair = {
        ...repair,
        id: nextId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photo_url: null, // Explicitly initialize photo_url
      };

      const { data, error } = await supabase
        .from('repairs')
        .insert([newRepair])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create repair');

      set((state) => ({
        repairs: [data, ...state.repairs],
        loading: false,
      }));

      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false 
      });
      throw error;
    }
  },

  updateRepair: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('repairs')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        repairs: state.repairs.map((repair) =>
          repair.id === id ? { ...repair, ...updates } : repair
        ),
        loading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false 
      });
      throw error;
    }
  },

  updateStatus: async (id: string, status: RepairStatus): Promise<void> => {
    return useRepairStore.getState().updateRepair(id, { status });
  },
}));