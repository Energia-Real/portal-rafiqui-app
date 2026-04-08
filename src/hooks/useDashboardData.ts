'use client';

import { useState, useEffect, useRef } from 'react';
import { statisticsApi, DashboardStats, ESGMetrics, MonthlyData, MaterialDistribution } from '@/lib/api';
import { esgMetrics as mockESG, monthlyData as mockMonthly, impactDistribution as mockDistribution } from '@/data/dashboardData';

interface UseDashboardDataReturn {
  esgMetrics: ESGMetrics;
  monthlyData: MonthlyData[];
  materialDistribution: MaterialDistribution[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  refetch: () => Promise<void>;
}

// Transformar datos mock al formato de la API
const transformMockESG = (): ESGMetrics => ({
  co2Saved: mockESG.co2Saved,
  treesEquivalent: mockESG.treesEquivalent,
  energySaved: mockESG.energySaved,
  waterSaved: mockESG.waterSaved,
  panelsRecycled: mockESG.panelsRecycled,
  panelsReused: Math.round(mockESG.panelsRecycled * 0.6),
  panelsRecycledMaterial: Math.round(mockESG.panelsRecycled * 0.4),
});

export function useDashboardData(): UseDashboardDataReturn {
  const [esgMetrics, setEsgMetrics] = useState<ESGMetrics>(transformMockESG());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(mockMonthly);
  const [materialDistribution, setMaterialDistribution] = useState<MaterialDistribution[]>(mockDistribution);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await statisticsApi.getDashboard();

      if (response.data) {
        setEsgMetrics(response.data.esgMetrics);
        setMonthlyData(response.data.monthlyData);
        setMaterialDistribution(response.data.materialDistribution);
        setIsUsingMockData(false);
      } else if (response.error) {
        console.warn('Using mock data due to API error:', response.error);
        setError(response.error);
        setIsUsingMockData(true);
        // Mantener datos mock
        setEsgMetrics(transformMockESG());
        setMonthlyData(mockMonthly);
        setMaterialDistribution(mockDistribution);
      }
    } catch (err) {
      console.warn('Using mock data due to fetch error');
      setError('Error al conectar con el servidor');
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
  }, []);

  return {
    esgMetrics,
    monthlyData,
    materialDistribution,
    isLoading,
    error,
    isUsingMockData,
    refetch: fetchData,
  };
}
