import { create } from 'zustand';
import { RepairCard, RepairStatus } from '../types/repair';
import { supabase } from '../lib/supabase';

interface RepairStore {
  repairs: RepairCard[];
  loading: boolean;
  error: string | null;
  fetchRepairs: () => Promise<void>;
  createRepair: (repair: Omit<RepairCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RepairCard>;
  updateRepair: (id: string, updates: Partial<RepairCard>) => Promise<void>;
  updateStatus: (id: string, status: RepairStatus) => Promise<void>;
}

export const useRepairStore = create<RepairStore>((set, get) => ({
  repairs: [],
  loading: false,
  error: null,

  fetchRepairs: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data received from database');
      }
      
      set({ repairs: data });
    } catch (error) {
      console.error('Error fetching repairs:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createRepair: async (repair) => {
    set({ loading: true, error: null });
    try {
      // First, get the last repair ID
      const { data: lastRepair, error: fetchError } = await supabase
        .from('repairs')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Generate the next ID
      const lastId = lastRepair?.[0]?.id || 'URB0000';
      const nextNumber = parseInt(lastId.substring(3)) + 1;
      const nextId = `URB${nextNumber.toString().padStart(4, '0')}`;

      const newRepair = {
        ...repair,
        id: nextId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('repairs')
        .insert([newRepair])
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data received from database');
      }

      set((state) => ({
        repairs: [data, ...state.repairs],
      }));

      return data;
    } catch (error) {
      console.error('Error creating repair:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
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

      // Fetch all repairs again to update the store
      await get().fetchRepairs();
    } catch (error) {
      console.error('Error updating repair:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    await get().updateRepair(id, { status });
  },
}));