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
  useGetAuthorsQuery,
  useDeleteAuthorMutation,
} from "@/features/content-management/api/authorsApiSlice";
import { PaginationComponent } from "@/common/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const AuthorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<{ search?: string }>({});
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const { data: authors, isFetching: isFetchingAuthors, error } = useGetAuthorsQuery({
    search: filters.search,
    page_size: pageSize,
    page: page,
  });
  const [deleteAuthor, { isLoading: isDeletingAuthor }] = useDeleteAuthorMutation();

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

  const handleEdit = (authorSlug: string) => {
    if (!authorSlug) {
      console.error("Author slug is undefined or empty. Cannot navigate.");
      toast({
        title: t("authorManagement.navigationError"),
        description: t("authorManagement.authorEditError"),
        variant: "destructive",
      });
      return;
    }
    navigate(`/gestion/autores/${authorSlug}`);
  };

  const handleDeleteAuthor = async (authorSlug: string, authorName: string) => {
    try {
      await deleteAuthor(authorSlug).unwrap();
      toast({
        title: t("authorManagement.authorDeleted"),
        description: t("authorManagement.authorDeletedSuccess", { name: authorName }),
      });
    } catch (error) {
      toast({
        title: t("authorManagement.error"),
        description: t("authorManagement.authorDeleteError"),
        variant: "destructive",
      });
    }
  };

  const handleAdd = () => {
    navigate("/gestion/autores/create");
  };

  let authorResults = [];
  let count = 0;

  if (authors && "results" in authors) {
    authorResults = authors.results;
    count = authors.count;
  } else if (Array.isArray(authors)) {
    authorResults = authors;
    count = authors.length;
  }

  const maxPage = Math.ceil(count / pageSize);
  const pageSizeOptions = [10, 20, 50, 100];

  if (isFetchingAuthors) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((skeletonId) => (
              <div key={`author-skeleton-${skeletonId}`} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-xl font-medium text-red-500">
          {t("authorManagement.errorLoadingAuthors")}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex">
        <CardTitle className="">{t("authorManagement.authorList")}</CardTitle>
        <div className="flex items-center justify-end space-x-2 pt-2 mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t("authorManagement.filters")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-3" align="end">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">{t("authorManagement.pageSize")}</span>
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
                placeholder={t("authorManagement.searchAuthorPlaceholder")}
                value={filters.search || ""}
                onChange={(e) => handleChange("search", e.target.value)}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("authorManagement.addAuthor")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {count === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("authorManagement.noAuthorsFound")}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("authorManagement.authorName")}</TableHead>
                      <TableHead className="text-right">{t("authorManagement.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorResults.map((author) => (
                      <TableRow key={author.slug}>
                        <TableCell className="font-medium">{author.name}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("authorManagement.openMenu")}</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(author.slug)}>
                                  {t("authorManagement.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(author.slug)}>
                                  {t("authorManagement.edit")}
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    {t("authorManagement.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("authorManagement.areYouSure")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("authorManagement.deleteConfirmation", { name: author.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                  {t("authorManagement.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => handleDeleteAuthor(author.slug, author.name)}
                                >
                                  {t("authorManagement.delete")}
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden grid gap-4">
              {authorResults.map((author) => (
                <Card key={author.slug}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm">{author.name}</h3>
                        <div className="flex gap-1">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("authorManagement.openMenu")}</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(author.slug)}>
                                  {t("authorManagement.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(author.slug)}>
                                  {t("authorManagement.edit")}
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    {t("authorManagement.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("authorManagement.areYouSure")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("authorManagement.deleteConfirmation", { name: author.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                  {t("authorManagement.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => handleDeleteAuthor(author.slug, author.name)}
                                >
                                  {t("authorManagement.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {count > 0 && (
              <div className="flex justify-center mt-4">
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

export default AuthorManagementPage;