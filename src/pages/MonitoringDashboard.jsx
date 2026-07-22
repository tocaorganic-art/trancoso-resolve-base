import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingUp, Shield, Zap } from 'lucide-react';
import ContinuousMonitor from '../components/monitoring/ContinuousMonitor';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import SystemHealthCheck from '../components/maintenance/SystemHealthCheck';
import PermissionChecker from '../components/auth/PermissionChecker';

function MonitoringDashboardContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-brand-primary" />
          Dashboard de Monitoramento
        </h1>
        <p className="text-muted-foreground">
          Visão unificada de todos os sistemas e métricas da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-brand-primary" />
              <span className="text-sm font-medium text-foreground">Uptime</span>
            </div>
            <p className="text-3xl font-bold text-brand-primary">99.9%</p>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-[#3E8E5A]/10 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[#3E8E5A]" />
              <span className="text-sm font-medium text-foreground">Performance</span>
            </div>
            <p className="text-3xl font-bold text-[#3E8E5A]">92</p>
            <p className="text-xs text-muted-foreground mt-1">Score médio</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-foreground">Segurança</span>
            </div>
            <p className="text-3xl font-bold text-amber-700">100</p>
            <p className="text-xs text-muted-foreground mt-1">Sem vulnerabilidades</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-foreground">API</span>
            </div>
            <p className="text-3xl font-bold text-orange-700">145ms</p>
            <p className="text-xs text-muted-foreground mt-1">Latência média</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <SystemHealthCheck />
        <ContinuousMonitor />
        <AnalyticsDashboard />
      </div>
    </div>
  );
}

export default function MonitoringDashboardPage() {
  return (
    <PermissionChecker requiredRole="admin">
      <MonitoringDashboardContent />
    </PermissionChecker>
  );
}