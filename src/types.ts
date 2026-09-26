export type Urgency = 'normal' | 'urgent' | 'critical';
export type Status = 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  rating_count: number;
  rating_sum: number;
  created_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  technician_id: string;
  farmer_name: string;
  rating: number;
  feedback: string | null;
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
  symptoms: string[] | null;
  likely_issue: string | null;
}

export interface RepairRequestWithTech extends RepairRequest {
  technician: Pick<Technician, 'id' | 'name' | 'specialization' | 'rating' | 'rating_count'> | null;
  review: Pick<Review, 'id' | 'rating' | 'feedback'> | null;
}

export interface TechnicianWithReviews extends Technician {
  reviews: Review[];
}
