// src/components/position/HealthIndicator.tsx
import { formatNumber } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useHealthFactor } from '@/hooks/position/useHealthFactor';

interface HealthIndicatorProps {
  poolId: string;
}

export const HealthIndicator = ({ poolId }: HealthIndicatorProps) => {
  const { healthInfo, isLoading, error } = useHealthFactor(poolId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !healthInfo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load health factor
        </AlertDescription>
      </Alert>
    );
  }

  const { healthFactor, riskLevel } = healthInfo;

  const getHealthColor = () => {
    switch (riskLevel) {
      case 'safe': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHealthIcon = () => {
    switch (riskLevel) {
      case 'safe': return <ShieldCheck className="h-5 w-5" />;
      case 'medium':
      case 'high':
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getHealthColor()}`}>
      <div className="flex items-start gap-3">
        {getHealthIcon()}
        <div>
          <h3 className="font-semibold text-lg">
            Health Factor: {formatNumber(healthFactor, 2)}
          </h3>
          <p className="text-sm">
            {riskLevel === 'safe' && 'Your position is healthy'}
            {riskLevel === 'medium' && 'Your position requires attention'}
            {riskLevel === 'high' && 'Your position is at risk'}
            {riskLevel === 'critical' && 'Liquidation risk is imminent'}
          </p>
          {riskLevel !== 'safe' && (
            <div className="mt-2">
              <button 
                onClick={() => window.location.href = `/pools/${poolId}/collateral`}
                className="text-sm font-medium hover:underline"
              >
                Manage Collateral →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};