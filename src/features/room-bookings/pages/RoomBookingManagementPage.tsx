import React, { useState } from "react";
import { useToast } from "@/common/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/common/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/common/components/ui/popover";
import { Button } from "@/common/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/common/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import { Badge } from "@/common/components/ui/badge";
import { Filter, MoreVertical, Calendar as CalendarIcon, Check, X, Ban, Trash2, RotateCcw } from "lucide-react";
import {
    useGetRoomBookingsQuery,
    useApproveBookingMutation,
    useRejectBookingMutation,
    useCancelBookingMutation,
    useDeleteRoomBookingMutation,
    useRestoreRoomBookingMutation,
} from "@/features/room-bookings/api/roomBookingsApi";
import { PaginationComponent } from "@/common/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/common/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RoomBooking } from "@/features/room-bookings/types/room_bookings";

const RoomBookingManagementPage: React.FC = () => {
    const { toast } = useToast();

    const [filters, setFilters] = useState<{
        search?: string;
        status?: string;
        event_date?: string;
        event_type?: string;
    }>({});
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    const { data: bookingsData, isFetching, error } = useGetRoomBookingsQuery({
        search: filters.search,
        status: filters.status === "ALL" ? undefined : filters.status,
        event_date: filters.event_date,
        event_type: filters.event_type === "ALL" ? undefined : filters.event_type,
        page_size: pageSize,
        page: page,
        ordering: "-created_at",
    });

    const [approveBooking] = useApproveBookingMutation();
    const [rejectBooking] = useRejectBookingMutation();
    const [cancelBooking] = useCancelBookingMutation();
    const [deleteBooking] = useDeleteRoomBookingMutation();
    const [restoreBooking] = useRestoreRoomBookingMutation();

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
        setPage(1);
    };

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleAction = async (action: string, booking: RoomBooking) => {
        try {
            let message = "";
            switch (action) {
                case "approve":
                    await approveBooking({ id: booking.id }).unwrap();
                    message = "Reserva aprobada exitosamente.";
                    break;
                case "reject":
                    await rejectBooking({ id: booking.id }).unwrap();
                    message = "Reserva rechazada.";
                    break;
                case "cancel":
                    await cancelBooking({ id: booking.id }).unwrap();
                    message = "Reserva cancelada.";
                    break;
                case "delete":
                    await deleteBooking(booking.id).unwrap();
                    message = "Reserva eliminada permanentemente.";
                    break;
                case "restore":
                    await restoreBooking(booking.id).unwrap();
                    message = "Reserva restaurada.";
                    break;
            }
            toast({
                title: "Acción completada",
                description: message,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Hubo un error al procesar la solicitud.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-500 hover:bg-green-600">Aprobada</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pendiente</Badge>;
            case "REJECTED":
                return <Badge className="bg-red-500 hover:bg-red-600">Rechazada</Badge>;
            case "CANCELLED":
                return <Badge variant="secondary">Cancelada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const bookingResults = bookingsData?.results || [];
    const count = bookingsData?.count || 0;
    const maxPage = Math.ceil(count / pageSize);
    const pageSizeOptions = [10, 20, 50, 100];

    if (isFetching) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="space-y-3">
                    {['ske-1', 'ske-2', 'ske-3', 'ske-4', 'ske-5'].map((key) => (
                        <div key={key} className="h-12 bg-muted rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center text-red-500 font-medium">
                Error al cargar las reservas. Por favor intente nuevamente.
            </div>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-6">
                <CardTitle className="text-2xl font-bold">Gestión de Reservas de Salas</CardTitle>
                <BookingFilters
                    filters={filters as any}
                    handleFilterChange={handleFilterChange as any}
                    pageSizeOptions={pageSizeOptions}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    setPage={setPage}
                    setFilters={setFilters}
                />
            </CardHeader>

            <CardContent>
                {bookingResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No se encontraron reservas que coincidan con los filtros.
                    </div>
                ) : (
                    <>
                        <BookingDesktopTable
                            bookingResults={bookingResults}
                            handleAction={handleAction}
                            getStatusBadge={getStatusBadge}
                        />

                        <BookingMobileList
                            bookingResults={bookingResults}
                            handleAction={handleAction}
                            getStatusBadge={getStatusBadge}
                        />

                        {count > 0 && (
                            <div className="py-4">
                                <PaginationComponent
                                    currentPage={page}
                                    maxPage={maxPage}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const BookingFilters = ({
    filters,
    handleFilterChange,
    pageSizeOptions,
    pageSize,
    setPageSize,
    setPage,
    setFilters
}: {
    filters: { search?: string; status?: string; event_date?: string; event_type?: string; };
    handleFilterChange: (key: string, value: string) => void;
    pageSizeOptions: number[];
    pageSize: number;
    setPageSize: (size: number) => void;
    setPage: (page: number) => void;
    setFilters: (filters: {}) => void;
}) => (
    <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full sm:w-64">
            <Input
                placeholder="Buscar por solicitante, email..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full"
            />
        </div>

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4" align="end">
                <h4 className="font-medium leading-none mb-2">Filtros Avanzados</h4>
                <div className="space-y-2">
                    <div className="text-sm font-medium mb-1">Estado</div>
                    <Select
                        value={filters.status || "ALL"}
                        onValueChange={(val) => handleFilterChange("status", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="APPROVED">Aprobada</SelectItem>
                            <SelectItem value="REJECTED">Rechazada</SelectItem>
                            <SelectItem value="CANCELLED">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <div className="text-sm font-medium mb-1">Fecha del Evento</div>
                    <Input
                        type="date"
                        value={filters.event_date || ""}
                        onChange={(e) => handleFilterChange("event_date", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <div className="text-sm font-medium mb-1">Registros por página</div>
                    <div className="flex flex-wrap gap-2">
                        {pageSizeOptions.map((size) => (
                            <Button
                                key={size}
                                variant={pageSize === size ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                            >
                                {size}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => {
                        setFilters({});
                        setPage(1);
                    }}
                >
                    Limpiar Filtros
                </Button>
            </PopoverContent>
        </Popover>
    </div>
);

const BookingDesktopTable = ({
    bookingResults,
    handleAction,
    getStatusBadge
}: {
    bookingResults: RoomBooking[];
    handleAction: (action: string, booking: RoomBooking) => void;
    getStatusBadge: (status: string) => React.ReactNode;
}) => (
    <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookingResults.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(booking.event_date), "dd MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{booking.full_name}</div>
                            <div className="text-xs text-muted-foreground">{booking.email}</div>
                        </TableCell>
                        <TableCell>
                            <div className="max-w-[150px] truncate" title={booking.description}>
                                {booking.event_type}
                            </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status || "PENDING")}</TableCell>
                        <TableCell className="text-right">
                            <BookingActionsDropdown booking={booking} onAction={handleAction} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

const BookingMobileList = ({
    bookingResults,
    handleAction,
    getStatusBadge
}: {
    bookingResults: RoomBooking[];
    handleAction: (action: string, booking: RoomBooking) => void;
    getStatusBadge: (status: string) => React.ReactNode;
}) => (
    <div className="md:hidden space-y-4">
        {bookingResults.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {format(new Date(booking.event_date), "dd MMM yyyy", { locale: es })}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                            </div>
                        </div>
                        {getStatusBadge(booking.status || "PENDING")}
                    </div>

                    <div className="pt-2 border-t">
                        <div className="font-medium">{booking.full_name}</div>
                        <div className="text-sm text-muted-foreground">{booking.event_type}</div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <BookingActionsDropdown booking={booking} onAction={handleAction} />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

const BookingActionsDropdown = ({
    booking,
    onAction
}: {
    booking: RoomBooking,
    onAction: (action: string, booking: RoomBooking) => void
}) => {
    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {booking.status === 'PENDING' && (
                        <>
                            <DropdownMenuItem onClick={() => onAction('approve', booking)} className="text-green-600 focus:text-green-700">
                                <Check className="w-4 h-4 mr-2" /> Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('reject', booking)} className="text-red-600 focus:text-red-700">
                                <X className="w-4 h-4 mr-2" /> Rechazar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                        <DropdownMenuItem onClick={() => onAction('cancel', booking)} className="text-orange-600 focus:text-orange-700">
                            <Ban className="w-4 h-4 mr-2" /> Cancelar
                        </DropdownMenuItem>
                    )}

                    {(booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
                        <DropdownMenuItem onClick={() => onAction('restore', booking)}>
                            <RotateCcw className="w-4 h-4 mr-2" /> Restaurar estado
                        </DropdownMenuItem>
                    )}

                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600 focus:text-red-700 font-medium">
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro de eliminar esta reserva?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará permanentemente la reserva de <strong>{booking.full_name}</strong> para el día <strong>{booking.event_date}</strong>. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onAction('delete', booking)}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default RoomBookingManagementPage;
