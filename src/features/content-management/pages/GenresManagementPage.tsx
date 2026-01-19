import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/common/components/ui/badge";
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
import { Filter, Plus, MoreVertical } from "lucide-react";
import {
    useGetGenresQuery,
    useDeleteGenreMutation,
} from "@/features/content-management/api/genresApiSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import { PaginationComponent } from "@/common/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";

const GenresManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [filters, setFilters] = useState<{ search?: string; sala?: string }>({});
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    const { data: allSalasData } = useGetGenresQuery({ page_size: 1000 });
    const { data: genres, isFetching: isFetchingGenres } = useGetGenresQuery({
        search: filters.search,
        sala: filters.sala,
        page_size: pageSize,
        page: page,
    });
    const [deleteGenre, { isLoading: isDeletingGenre }] = useDeleteGenreMutation();

    const uniqueSalas = allSalasData?.results
        ? Array.from(new Set(allSalasData.results.map((genre) => genre.sala).filter(Boolean))) as string[]
        : [];

    const handleChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
        setPage(1);
    };

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleEdit = (genreSlug: string) => {
        navigate(`/gestion/generos/${genreSlug}`);
    };

    const handleDeleteGenre = async (genreSlug: string, genreLabel: string) => {
        try {
            await deleteGenre(genreSlug).unwrap();
            toast({
                title: "Género Eliminado",
                description: `El género "${genreLabel}" ha sido eliminado exitosamente.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un error al eliminar el género.",
                variant: "destructive",
            });
        }
    };

    const handleAdd = () => {
        navigate("/gestion/generos/create");
    };

    const count = genres?.count || 0;
    const maxPage = Math.ceil(count / pageSize);

    const pageSizeOptions = [10, 20, 50, 100];

    return (
        <Card className="w-full">
            <CardHeader className="flex">
                <CardTitle className="" >Listado de Géneros</CardTitle>
                <div className="flex items-center justify-end space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 space-y-3" align="end">
                            <div className="flex flex-col space-y-2">
                                <span className="text-sm font-medium">Tamaño de página</span>
                                <div className="flex items-center space-x-2">
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
                            <Input
                                placeholder="Buscar por nombre de género..."
                                value={filters.search || ""}
                                onChange={(e) => handleChange("search", e.target.value)}
                            />
                            <Select onValueChange={(value) => handleChange("sala", value === "all" ? "" : value)} value={filters.sala || "all"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Nombre de Sala" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las Salas</SelectItem>
                                    {uniqueSalas.map((sala) => (
                                        <SelectItem key={sala} value={sala}>
                                            {sala}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleAdd} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Género
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {isFetchingGenres ? (
                    <div className="text-center text-muted-foreground py-4">Cargando...</div>
                ) : genres?.count === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No se encontraron géneros.
                    </div>
                ) : (
                    <>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Nombre del Género</TableHead>
                                        <TableHead>Sala</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {genres?.results?.map((genre) => (
                                        <TableRow key={genre.id}>
                                            <TableCell>{genre.code}</TableCell>
                                            <TableCell className="font-medium">{genre.label}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{genre.sala}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menú</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(genre.slug)}>
                                                                Ver Detalles
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEdit(genre.slug)}>
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Esto eliminará
                                                                permanentemente el género "{genre.label}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-500 text-white hover:bg-red-600"
                                                                onClick={() => handleDeleteGenre(genre.slug, genre.label)}
                                                            >
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-center mt-4">
                            <PaginationComponent
                                currentPage={page}
                                maxPage={maxPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default GenresManagementPage;