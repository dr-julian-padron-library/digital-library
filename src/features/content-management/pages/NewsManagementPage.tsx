import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    useGetNewsListQuery,
    useDeleteNewsMutation,
} from "@/features/content-management/api/newsApiSlice";
import { PaginationComponent } from "@/common/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";

const NewsManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();

    const [filters, setFilters] = useState<{ search?: string }>({});
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    const { data: newsList, isFetching: isFetchingNews } = useGetNewsListQuery({
        search: filters.search,
        page_size: pageSize,
        page: page,
    });
    const [deleteNews] = useDeleteNewsMutation();

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

    const handleEdit = (newsSlug?: string) => {
        if (newsSlug) navigate(`/gestion/noticias/${newsSlug}`);
    };

    const handleDeleteNews = async (newsSlug: string, newsTitle: string) => {
        try {
            await deleteNews(newsSlug).unwrap();
            toast({
                title: t("newsManagement.deleteSuccessTitle"),
                description: `${t("newsManagement.deleteSuccessDesc1")}${newsTitle}${t("newsManagement.deleteSuccessDesc2")}`,
            });
        } catch (error) {
            toast({
                title: t("newsManagement.deleteErrorTitle"),
                description: t("newsManagement.deleteErrorDesc"),
                variant: "destructive",
            });
        }
    };

    const handleAdd = () => {
        navigate("/gestion/noticias/create");
    };

    const count = newsList?.count || 0;
    const maxPage = Math.ceil(count / pageSize);

    const pageSizeOptions = [10, 20, 50, 100];

    return (
        <Card className="w-full">
            <CardHeader className="flex">
                <CardTitle>{t("newsManagement.title")}</CardTitle>
                <div className="flex items-center justify-end space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                {t("newsManagement.filters")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 space-y-3" align="end">
                            <div className="flex flex-col space-y-2">
                                <span className="text-sm font-medium">{t("newsManagement.pageSize")}</span>
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
                                placeholder={t("newsManagement.searchPlaceholder")}
                                value={filters.search || ""}
                                onChange={(e) => handleChange("search", e.target.value)}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleAdd} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {t("newsManagement.addNews")}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {isFetchingNews ? (
                    <div className="text-center text-muted-foreground py-4">{t("newsManagement.loading")}</div>
                ) : newsList?.count === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        {t("newsManagement.noNews")}
                    </div>
                ) : (
                    <>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("newsManagement.tableTitle")}</TableHead>
                                        <TableHead>{t("newsManagement.tableDate")}</TableHead>
                                        <TableHead>{t("newsManagement.tableStatus")}</TableHead>
                                        <TableHead className="text-right">{t("newsManagement.tableActions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {newsList?.results?.map((news) => (
                                        <TableRow key={news.id}>
                                            <TableCell className="font-medium">{news.title}</TableCell>
                                            <TableCell>
                                                {news.published_date
                                                    ? new Date(news.published_date).toLocaleDateString()
                                                    : t("newsManagement.na")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={news.is_published ? "default" : "secondary"}
                                                    className={news.is_published ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    {news.is_published ? t("newsManagement.published") : t("newsManagement.draft")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">{t("newsManagement.openMenu")}</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(news.slug)}>
                                                                {t("newsManagement.edit")}
                                                            </DropdownMenuItem>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    {t("newsManagement.delete")}
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t("newsManagement.areYouSure")}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t("newsManagement.deleteWarning1")}{news.title}{t("newsManagement.deleteWarning2")}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                                                {t("newsManagement.cancel")}
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-500 text-white hover:bg-red-600"
                                                                onClick={() => news.slug && handleDeleteNews(news.slug, news.title)}
                                                            >
                                                                {t("newsManagement.delete")}
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

export default NewsManagementPage;
