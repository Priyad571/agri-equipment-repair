export type Urgency = 'normal' | 'urgent' | 'critical';
export type Status = 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  created_at: string;
}

export interface RepairRequest {
  id: string;
  farmer_name: string;
  equipment_type: string;
  problem_description: string;
  urgency: Urgency;
  status: Status;
  technician_id: string | null;
  created_at: string;
}

export interface RepairRequestWithTech extends RepairRequest {
  technician: Pick<Technician, 'id' | 'name' | 'specialization' | 'rating'> | null;
}
