import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';

export const NotFound = () => {
  const navigate = useNavigate();
  return <div className="flex items-center justify-center py-12"><EmptyState icon={Home} title="Page not found" description="The page you're looking for doesn't exist." action={<Button onClick={() => navigate('/')}>Go Home</Button>} /></div>;
};
