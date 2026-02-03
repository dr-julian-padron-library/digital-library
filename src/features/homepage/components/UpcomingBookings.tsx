import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { useGetRoomBookingsQuery } from "@/features/room-bookings/api/roomBookingsApi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { RoomBookingStatus } from "@/features/room-bookings/types/room_bookings";

export function UpcomingBookings() {
    const { t } = useTranslation();

    // Get today's date in YYYY-MM-DD format for filtering
    const today = new Date().toISOString().split('T')[0];

    // Fetch only approved bookings from today onwards
    const { data: bookingsData, isLoading } = useGetRoomBookingsQuery({
        status: RoomBookingStatus.APPROVED,
        event_date: today
    });

    // Process bookings: sort by date and time, take top 3
    const upcomingEvents = bookingsData?.results
        ? [...bookingsData.results]
            .sort((a, b) => {
                const dateA = new Date(`${a.event_date}T${a.start_time}`);
                const dateB = new Date(`${b.event_date}T${b.start_time}`);
                return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 3)
        : [];

    if (isLoading || !upcomingEvents.length) {
        return null; // Don't show section if no events or loading
    }

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-primary mb-4">
                            Próximos Eventos
                        </h2>
                        <p className="text-muted-foreground">
                            Actividades programadas en nuestras salas
                        </p>
                    </div>
                    <Link to="/reservas/salas">
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            Ver calendario
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {upcomingEvents.map((booking) => (
                        <Card key={booking.id} className="book-card-hover border-highlight-gold/20">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                                        {booking.event_type}
                                    </span>
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(booking.event_date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>
                                <CardTitle className="text-primary font-display text-lg line-clamp-2 min-h-[3.5rem]">
                                    {booking.description}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4 mr-2 text-highlight-gold" />
                                        <span>{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2 text-highlight-gold" />
                                        <span className="truncate">Sala Digital</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
