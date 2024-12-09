export type RepairStatus = 'Open' | 'Hold' | 'Notified' | 'Solved';

export interface RepairCard {
  id: string;
  customerName: string;
  phoneNumber: string;
  complaint: string;
  technicianNotes: string;
  status: RepairStatus;
  type: 'Bike' | 'Scooter' | 'Battery'; // Define specific types for repairs
  createdAt: string;
  updatedAt: string;
  photo_url?: string | null;
  backgroundColor?: string; // Optional background color for the repair card
}