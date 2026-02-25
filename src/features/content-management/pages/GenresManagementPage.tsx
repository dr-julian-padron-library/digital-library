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
import { useTranslation } from "react-i18next";

const GenresManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();

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
                title: t("genresManagement.genreDeleted"),
                description: t("genresManagement.genreDeletedSuccess", { name: genreLabel }),
            });
        } catch (error) {
            toast({
                title: t("genresManagement.error"),
                description: t("genresManagement.genreDeleteError"),
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
                <CardTitle className="" >{t("genresManagement.genresList")}</CardTitle>
                <div className="flex items-center justify-end space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                {t("genresManagement.filters")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 space-y-3" align="end">
                            <div className="flex flex-col space-y-2">
                                <span className="text-sm font-medium">{t("genresManagement.pageSize")}</span>
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
                                placeholder={t("genresManagement.searchGenrePlaceholder")}
                                value={filters.search || ""}
                                onChange={(e) => handleChange("search", e.target.value)}
                            />
                            <Select onValueChange={(value) => handleChange("sala", value === "all" ? "" : value)} value={filters.sala || "all"}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("genresManagement.roomName")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("genresManagement.allRooms")}</SelectItem>
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
                        {t("genresManagement.addGenre")}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {isFetchingGenres ? (
                    <div className="text-center text-muted-foreground py-4">{t("genresManagement.loading")}</div>
                ) : genres?.count === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        {t("genresManagement.noGenresFound")}
                    </div>
                ) : (
                    <>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("genresManagement.code")}</TableHead>
                                        <TableHead>{t("genresManagement.genreName")}</TableHead>
                                        <TableHead>{t("genresManagement.room")}</TableHead>
                                        <TableHead className="text-right">{t("genresManagement.actions")}</TableHead>
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
                                                                <span className="sr-only">{t("genresManagement.openMenu")}</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(genre.slug)}>
                                                                {t("genresManagement.viewDetails")}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEdit(genre.slug)}>
                                                                {t("genresManagement.edit")}
                                                            </DropdownMenuItem>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    {t("genresManagement.delete")}
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t("genresManagement.areYouSure")}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t("genresManagement.deleteConfirmation", { name: genre.label })}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                                                {t("genresManagement.cancel")}
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-500 text-white hover:bg-red-600"
                                                                onClick={() => handleDeleteGenre(genre.slug, genre.label)}
                                                            >
                                                                {t("genresManagement.delete")}
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