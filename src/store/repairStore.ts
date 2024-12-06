import { create } from 'zustand';
import { RepairCard, RepairStatus } from '../types/repair';
import { supabase } from '../lib/supabase';

interface RepairStore {
  repairs: RepairCard[];
  loading: boolean;
  error: string | null;
  statusFilter: RepairStatus | null;
  setStatusFilter: (status: RepairStatus | null) => void;
  fetchRepairs: () => Promise<void>;
  createRepair: (repair: Omit<RepairCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RepairCard>;
  updateRepair: (id: string, updates: Partial<RepairCard>) => Promise<void>;
  updateStatus: (id: string, status: RepairStatus) => Promise<void>;
}

export const useRepairStore = create<RepairStore>((set, get) => ({
  repairs: [],
  loading: false,
  error: null,
  statusFilter: null,

  setStatusFilter: (status) => set({ statusFilter: status }),

  fetchRepairs: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching repairs from Supabase...');
      const query = supabase.from('repairs').select('*').order('createdAt', { ascending: false });

      // Apply status filter only if it exists
      if (get().statusFilter) {
        query.eq('status', get().statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        set({ error: 'Failed to fetch repairs. Please try again later.' });
        return;
      }

      if (!data) {
        console.error('No data received from Supabase');
        set({ error: 'No repairs found.' });
        return;
      }

      set({ repairs: data });
    } catch (error) {
      console.error('Error in fetchRepairs:', error);
      set({ error: 'An unexpected error occurred. Please try again later.' });
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
        console.error('שגיאת Supabase:', fetchError);
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
        throw new Error('לא התקבלו נתונים מהמסד נתונים');
      }

      console.log('New repair created:', data);
      set((state) => ({
        repairs: [data, ...state.repairs],
      }));

      return data;
    } catch (error) {
      console.error('פרטי השגיאה:', {
        error,
        message: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      });
      set({ error: error instanceof Error ? error.message : 'שגיאה ביצירת התיקון' });
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
      console.error('פרטי השגיאה:', {
        error,
        message: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      });
      set({ error: error instanceof Error ? error.message : 'שגיאה בעדכון התיקון' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    await get().updateRepair(id, { status });
  },
}));