export type RepairStatus = 'Open' | 'Hold' | 'Notified' | 'Solved';

export interface RepairCard {
  id: string;
  customerName: string;
  phoneNumber: string;
  complaint: string;
  technicianNotes: string;
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
  photo_url?: string | null;
}