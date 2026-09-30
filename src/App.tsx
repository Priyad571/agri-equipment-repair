import { useState } from 'react';
import { LanguageProvider } from '@/lib/LanguageContext';
import RoleSelector from '@/components/RoleSelector';
import FarmerDashboard from '@/components/FarmerDashboard';
import TechnicianDashboard from '@/components/TechnicianDashboard';

type Role = 'farmer' | 'technician' | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);

  return (
    <LanguageProvider>
      {role === 'farmer' && <FarmerDashboard onBack={() => setRole(null)} />}
      {role === 'technician' && <TechnicianDashboard onBack={() => setRole(null)} />}
      {role === null && <RoleSelector onSelect={setRole} />}
    </LanguageProvider>
  );
}
