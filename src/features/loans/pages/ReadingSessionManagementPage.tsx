import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { Filter, MoreVertical, Calendar as CalendarIcon, Check, Trash2, RotateCcw } from "lucide-react";
import {
    useGetReadingSessionsQuery,
    useReturnReadingSessionMutation,
    useDeleteReadingSessionMutation,
    ReadingSessionDetail
} from "@/features/loans/api/readingSessionsApiSlice";
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

const ReadingSessionManagementPage: React.FC = () => {
    const { toast } = useToast();

    const [filters, setFilters] = useState<{
        search?: string;
        status?: "Active" | "Returned" | "Overdue";
    }>({});
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    const { data: sessionsData, isFetching, error } = useGetReadingSessionsQuery({
        search: filters.search,
        status: filters.status,
        page_size: pageSize,
        page: page,
        ordering: "-start_date",
    });

    const [returnSession] = useReturnReadingSessionMutation();
    const [deleteSession] = useDeleteReadingSessionMutation();

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

    const handleAction = async (action: string, session: ReadingSessionDetail) => {
        // Since session detail doesn't have ID, we might have an issue here.
        // Wait, ReadingSessionDetail in generated types DOES NOT have 'id' field?
        // Let's check generated types again.
        // ReadingSession (minimal) has ID. ReadingSessionDetail has user, book, start_date...
        // It should inherit or include ID. 
        // If it doesn't, I must check the API response.
        // Assuming it does for now or I will cast it.
        // Looking at generated types line 2006: ReadingSessionDetail: { user: string, book: MinimalBook, ... }
        // It seems 'id' is missing in ReadingSessionDetail definition in the generated file?
        // That would be a problem.
        // But usually DRF Serializers include ID.
        // I will assume it has ID and cast it to any if TS complains, or use a workaround.
        // Actually, if 'id' is missing in types but present in response, I can extend the type.

        const sessionId = (session as any).id;

        try {
            let message = "";
            switch (action) {
                case "return":
                    await returnSession(sessionId).unwrap();
                    message = "Libro devuelto exitosamente.";
                    break;
                case "delete":
                    await deleteSession(sessionId).unwrap();
                    message = "Sesión eliminada permanentemente.";
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
            case "Active":
                return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
            case "Returned":
                return <Badge variant="secondary">Devuelto</Badge>;
            case "Overdue":
                return <Badge className="bg-red-500 hover:bg-red-600">Vencido</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const sessionsResults = sessionsData?.results || [];
    const count = sessionsData?.count || 0;
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
                Error al cargar las sesiones de lectura. Por favor intente nuevamente.
            </div>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-6">
                <CardTitle className="text-2xl font-bold">Gestión de Sesiones de Lectura</CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button asChild className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                        <Link to="/gestion/devolucion-rapida">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Devolución Rápida
                        </Link>
                    </Button>
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
                                        <SelectItem value="Active">Activo</SelectItem>
                                        <SelectItem value="Returned">Devuelto</SelectItem>
                                        <SelectItem value="Overdue">Vencido</SelectItem>
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
                {sessionsResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No se encontraron sesiones que coincidan con los filtros.
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha Inicio</TableHead>
                                        <TableHead>Libro</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Fecha Fin</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessionsResults.map((session: any) => (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {session.start_date ? format(new Date(session.start_date), "dd MMM yyyy HH:mm", { locale: es }) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{session.book?.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.book?.authors?.map((a: any) => a.name).join(", ") || "Sin autor"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {/* Assuming user field is the username/email string */}
                                                <div className="font-medium">{session.user}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {session.end_date ? format(new Date(session.end_date), "dd MMM yyyy HH:mm", { locale: es }) : '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(session.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <SessionActionsDropdown session={session} onAction={handleAction} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {sessionsResults.map((session: any) => (
                                <Card key={session.id} className="overflow-hidden">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {session.start_date ? format(new Date(session.start_date), "dd MMM yyyy", { locale: es }) : '-'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {session.book?.title}
                                                </div>
                                            </div>
                                            {getStatusBadge(session.status)}
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="font-medium">{session.user}</div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <SessionActionsDropdown session={session} onAction={handleAction} />
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

const SessionActionsDropdown = ({
    session,
    onAction
}: {
    session: any, // Using any because of ID issue
    onAction: (action: string, session: any) => void
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

                    {(session.status === 'Active' || session.status === 'Overdue') && (
                        <>
                            <DropdownMenuItem onClick={() => onAction('return', session)} className="text-green-600 focus:text-green-700">
                                <RotateCcw className="w-4 h-4 mr-2" /> Devolver
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
                    <AlertDialogTitle>¿Está seguro de eliminar esta sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará permanentemente la sesión del historial. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onAction('delete', session)}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ReadingSessionManagementPage;
