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
      console.log('Fetching repairs from Supabase...');
      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data received from Supabase');
        throw new Error('No data received from database');
      }
      
      console.log('Received repairs:', data);
      set({ repairs: data });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      set({ error: error.message || 'Failed to fetch repairs' });
    } finally {
      set({ loading: false });
    }
  },

  createRepair: async (repair) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating new repair in Supabase...');
      // First, get the last repair ID
      const { data: lastRepair, error: fetchError } = await supabase
        .from('repairs')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

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

      console.log('Inserting new repair into Supabase...');
      const { data, error } = await supabase
        .from('repairs')
        .insert([newRepair])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data received from Supabase');
        throw new Error('No data received from database');
      }

      console.log('New repair created:', data);
      set((state) => ({
        repairs: [data, ...state.repairs],
      }));

      return data;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      set({ error: error.message || 'Failed to create repair' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateRepair: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating repair in Supabase...');
      const { error } = await supabase
        .from('repairs')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Repair updated successfully');
      // Fetch all repairs again to update the store
      await get().fetchRepairs();
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      set({ error: error.message || 'Failed to update repair' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    await get().updateRepair(id, { status });
  },
}));