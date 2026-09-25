import { useState } from 'react';
import RoleSelector from '@/components/RoleSelector';
import FarmerDashboard from '@/components/FarmerDashboard';
import TechnicianDashboard from '@/components/TechnicianDashboard';

type Role = 'farmer' | 'technician' | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);

  if (role === 'farmer') {
    return <FarmerDashboard onBack={() => setRole(null)} />;
  }

  if (role === 'technician') {
    return <TechnicianDashboard onBack={() => setRole(null)} />;
  }

  return <RoleSelector onSelect={setRole} />;
}
