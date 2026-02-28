
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/common/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User, BookOpen } from "lucide-react";

// @ts-ignore
declare const supabase: any;

export const RecentActivity = () => {
  const { data: recentRequests, isLoading } = useQuery({
    queryKey: ['recent-prestamo-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  // Mock data for other activities
  const mockActivities = [
    {
      type: "Nuevo Usuario",
      description: "María González se registró",
      time: "Hace 2 horas",
      icon: User,
      status: "success"
    },
    {
      type: "Libro Reservado",
      description: "Cien años de soledad - Juan Pérez",
      time: "Hace 3 horas",
      icon: BookOpen,
      status: "info"
    },
    {
      type: "Libro Devuelto",
      description: "El Quijote - Ana Martínez",
      time: "Hace 5 horas",
      icon: BookOpen,
      status: "success"
    }
  ];

  const getStatusBadge = (estado: string) => {
    const statusMap = {
      'PENDING': { label: 'Pendiente', variant: 'secondary' as const },
      'APPROVED': { label: 'Aprobada', variant: 'default' as const },
      'REJECTED': { label: 'Rechazada', variant: 'destructive' as const },
      'CANCELLED': { label: 'Cancelada', variant: 'outline' as const }
    };

    return statusMap[estado as keyof typeof statusMap] || { label: estado, variant: 'secondary' as const };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Prestamo Sala Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-biblioteca-blue flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Solicitudes de Préstamo de Sala Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((skeletonId) => (
                <div key={`recent-skeleton-${skeletonId}`} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests?.slice(0, 5).map((request) => (
                <div key={request.id} className="flex justify-between items-start p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{request.event_type}</p>
                    <p className="text-xs text-gray-600">{request.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.event_date).toLocaleDateString('es-ES')} •
                      {request.start_time} - {request.end_time}
                    </p>
                  </div>
                  <Badge variant={getStatusBadge(request.status).variant}>
                    {getStatusBadge(request.status).label}
                  </Badge>
                </div>
              ))}
              {(!recentRequests || recentRequests.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No hay solicitudes recientes
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* General Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-biblioteca-blue flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Actividad General Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.description} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="p-2 rounded-full bg-biblioteca-blue/10">
                  <activity.icon className="w-4 h-4 text-biblioteca-blue" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{activity.type}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
