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
import { Filter, MoreVertical, Calendar as CalendarIcon, Check, Trash2, Ban } from "lucide-react";
import {
    useGetBookReservationsQuery,
    useFulfillBookReservationMutation,
    useDeleteBookReservationMutation,
    useCancelBookReservationMutation,
    BookReservation
} from "@/features/loans/api/bookReservationsApiSlice";
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

const BookReservationManagementPage: React.FC = () => {
    const { toast } = useToast();

    const [filters, setFilters] = useState<{
        search?: string;
        status?: string;
    }>({});
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    const { data: reservationsData, isFetching, error } = useGetBookReservationsQuery({
        search: filters.search,
        status: filters.status,
        page_size: pageSize,
        page: page,
        ordering: "-created_at",
    });

    const [fulfillReservation] = useFulfillBookReservationMutation();
    const [cancelReservation] = useCancelBookReservationMutation();
    const [deleteReservation] = useDeleteBookReservationMutation();

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "ALL" ? undefined : value,
        }));
        setPage(1);
    };

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleAction = async (action: string, reservation: BookReservation) => {
        try {
            let message = "";
            switch (action) {
                case "fulfill":
                    await fulfillReservation(reservation.id).unwrap();
                    message = "Reserva marcada como cumplida (sesión iniciada).";
                    break;
                case "cancel":
                    await cancelReservation(reservation.id).unwrap();
                    message = "Reserva cancelada.";
                    break;
                case "delete":
                    await deleteReservation(reservation.id).unwrap();
                    message = "Reserva eliminada permanentemente.";
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

    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case "PENDING":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pendiente</Badge>;
            case "CONFIRMED":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmada</Badge>;
            case "FULFILLED":
                return <Badge className="bg-green-500 hover:bg-green-600">Cumplida</Badge>;
            case "CANCELLED":
                return <Badge variant="secondary">Cancelada</Badge>;
            case "EXPIRED":
                return <Badge variant="destructive">Expirada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const reservationsResults = reservationsData?.results || [];
    const count = reservationsData?.count || 0;
    const maxPage = Math.ceil(count / pageSize);
    const pageSizeOptions = [10, 20, 50, 100];

    if (isFetching) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
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
                <CardTitle className="text-2xl font-bold">Gestión de Reservas de Libros</CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Buscar por usuario, libro..."
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
                                <label className="text-sm font-medium">Estado</label>
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
                                        <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                                        <SelectItem value="FULFILLED">Cumplida</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                        <SelectItem value="EXPIRED">Expirada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Registros por página</label>
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
            </CardHeader>

            <CardContent>
                {reservationsResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No se encontraron reservas que coincidan con los filtros.
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha Reserva</TableHead>
                                        <TableHead>Libro</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Cota</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservationsResults.map((reservation) => (
                                        <TableRow key={reservation.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {format(new Date(reservation.reservation_date), "dd MMM yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{reservation.book_details?.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {reservation.book_details?.authors?.map((a: any) => a.name).join(", ") || "Sin autor"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {/* Assuming user field is the ID. Ideally we need user name. BookReservation doesn't seem to have user name embedded? 
                                                    Wait, BookReservation has `user: number`. 
                                                    RoomBooking had `full_name`.
                                                    BookReservation might not have user details. 
                                                    I will display User ID for now.
                                                */}
                                                <div className="font-medium">ID: {reservation.user}</div>
                                            </TableCell>
                                            <TableCell>
                                                {reservation.cota}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <ReservationActionsDropdown reservation={reservation} onAction={handleAction} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {reservationsResults.map((reservation) => (
                                <Card key={reservation.id} className="overflow-hidden">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {format(new Date(reservation.reservation_date), "dd MMM yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {reservation.book_details?.title}
                                                </div>
                                            </div>
                                            {getStatusBadge(reservation.status)}
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="font-medium">Usuario: {reservation.user}</div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <ReservationActionsDropdown reservation={reservation} onAction={handleAction} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

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

const ReservationActionsDropdown = ({
    reservation,
    onAction
}: {
    reservation: BookReservation,
    onAction: (action: string, reservation: BookReservation) => void
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

                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                        <>
                            <DropdownMenuItem onClick={() => onAction('fulfill', reservation)} className="text-green-600 focus:text-green-700">
                                <Check className="w-4 h-4 mr-2" /> Entregar (Ceder)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('cancel', reservation)} className="text-orange-600 focus:text-orange-700">
                                <Ban className="w-4 h-4 mr-2" /> Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
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
                        Esta acción eliminará permanentemente la reserva. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onAction('delete', reservation)}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default BookReservationManagementPage;
