import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/api.client';

export interface Entitlements {
  plan: {
    id: string | null;
    type: string | null;
    name: string;
  };
  subscription: {
    status: string;
  };
  features: Record<string, boolean>;
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEntitlements() {
      try {
        const response = await apiClient.get('/student/entitlements') as any;
        setEntitlements(response.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEntitlements();
  }, []);

  const hasFeature = (featureKey: string) => {
    return entitlements?.features?.[featureKey] === true;
  };

  return { entitlements, loading, error, hasFeature };
}
