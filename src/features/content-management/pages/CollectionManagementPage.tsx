import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/common/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/common/components/ui/popover";
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
import { useToast } from "@/common/components/ui/use-toast";
import {
  useGetBooksQuery,
  useDeleteBookMutation,
} from "@/features/content-management/api/booksApiSlice";
import { MinimalBook } from "@/features/content-management/api/booksApiSlice";
import {
  useGetVideosQuery,
  useDeleteVideoMutation,
} from "@/features/content-management/api/videosApiSlice";
import { MinimalVideo } from "@/features/content-management/api/videosApiSlice";
import { Author } from "@/features/content-management/api/authorsApiSlice";
import BookFilters from "@/features/content-management/components/book-filters";
import { PaginationComponent } from "@/common/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [activeLabel, setActiveLabel] = useState("Libros");
  const [filters, setFilters] = useState<{
    search?: string;
    author?: string;
    genres__name?: string;
    publication_date?: string;
    material_type?: string;
    language?: string;
    director?: string;
    release_date?: string;
    duration?: string;
  }>({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Valor por defecto de 10

  const { data: booksData, isFetching: isFetchingBooks } = useGetBooksQuery(
    activeLabel === "Libros"
      ? { ...filters, page, page_size: pageSize }
      : undefined,
  );
  const { data: videosData, isFetching: isFetchingVideos } = useGetVideosQuery(
    activeLabel === "Videos" ? filters : undefined,
  );
  const [deleteBook, { isLoading: isDeletingBook }] = useDeleteBookMutation();
  const [deleteVideo, { isLoading: isDeletingVideo }] = useDeleteVideoMutation();

  const handleChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1); // Reset page to 1 on filter change
  };

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1); // Reset to the first page when page size changes
  };

  const handleEdit = (slug: string) => {
    if (activeLabel === "Libros") {
      navigate(`/gestion/libro/${slug}`);
    } else {
      navigate(`/gestion/video/${slug}`);
    }
  };

  const handleDeleteBook = async (slug: string) => {
    try {
      await deleteBook(slug).unwrap();
      toast({
        title: t("collectionManagement.bookDeleted"),
        description: t("collectionManagement.bookDeletedSuccess"),
      });
    } catch (error) {
      toast({
        title: t("collectionManagement.error"),
        description: t("collectionManagement.bookDeleteError"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteVideo = async (slug: string) => {
    try {
      await deleteVideo(slug).unwrap();
      toast({
        title: t("collectionManagement.videoDeleted"),
        description: t("collectionManagement.videoDeletedSuccess"),
      });
    } catch (error) {
      toast({
        title: t("collectionManagement.error"),
        description: t("collectionManagement.videoDeleteError"),
        variant: "destructive",
      });
    }
  };

  const handleAdd = (type: "book" | "video") => {
    if (type === "book") {
      navigate("/gestion/libro/create");
    } else {
      navigate("/gestion/video/create");
    }
  };

  const books = booksData?.results || [];
  const videos = videosData?.results || [];
  const isFetching = isFetchingBooks || isFetchingVideos;
  const isDeleting = isDeletingBook || isDeletingVideo;
  const count = booksData?.count || 0;
  const maxPage = Math.ceil(count / pageSize);

  return (
    <Card className="w-full">
      <CardHeader className="justify-between">
        <div className="items-center gap-4">
          <CardTitle>{t("collectionManagement.materialsList")}</CardTitle>
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                variant={activeLabel === "Libros" ? "default" : "outline"}
                onClick={() => {
                  setActiveLabel("Libros");
                  setPage(1);
                }}
                size="sm"
              >
                {t("collectionManagement.books")}
              </Button>
              <Button
                variant={activeLabel === "Videos" ? "default" : "outline"}
                onClick={() => setActiveLabel("Videos")}
                size="sm"
              >
                {t("collectionManagement.videos")}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {activeLabel === "Libros" ? (
                <BookFilters
                  filters={filters}
                  onFilterChange={handleChange}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                />
              ) : (
                <div className="text-sm text-muted-foreground">{t("collectionManagement.videoFiltersComingSoon")}</div>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    {t("collectionManagement.add")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-auto p-2 min-w-[120px]"
                  sideOffset={5}
                >
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleAdd("book")}
                    >{t("collectionManagement.addBook")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleAdd("video")}
                    >{t("collectionManagement.addVideo")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

      </CardHeader>

      <CardContent>
        {isFetching && (
          <div className="text-center text-muted-foreground py-4">
            {t("collectionManagement.loading")}
          </div>
        )}

        {!isFetching && activeLabel === "Libros" && books.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {t("collectionManagement.noMaterialsFound")}
          </div>
        )}
        {!isFetching && activeLabel === "Videos" && videos.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {t("collectionManagement.noMaterialsFound")}
          </div>
        )}

        {activeLabel === "Libros" && books.length > 0 && (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("collectionManagement.title")}</TableHead>
                    <TableHead>{t("collectionManagement.author")}</TableHead>
                    <TableHead>{t("collectionManagement.year")}</TableHead>
                    <TableHead>{t("collectionManagement.quantity")}</TableHead>
                    <TableHead>{t("collectionManagement.available")}</TableHead>
                    <TableHead>{t("collectionManagement.type")}</TableHead>
                    <TableHead className="text-right">{t("collectionManagement.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book: MinimalBook) => {
                    const authors =
                      book.authors
                        ?.filter((a): a is Author => a !== null)
                        .map((a) => a.name)
                        .join(", ") || t("collectionManagement.noAuthor");

                    return (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{authors}</TableCell>
                        <TableCell>{book.publication_date || t("collectionManagement.NA")}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              book.quantity_in_stock > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {book.quantity_in_stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              book.available_copies > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {book.available_copies}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {book.material_type_detail?.name || t("collectionManagement.NA")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("collectionManagement.openMenu")}</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(book.slug)}>
                                  {t("collectionManagement.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(book.slug)}>
                                  {t("collectionManagement.edit")}
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    {t("collectionManagement.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("collectionManagement.areYouSure")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("collectionManagement.deleteConfirmation")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                  {t("collectionManagement.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => handleDeleteBook(book.slug)}
                                >
                                  {t("collectionManagement.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <PaginationComponent
              currentPage={page}
              maxPage={maxPage}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {activeLabel === "Videos" && videos.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("collectionManagement.title")}</TableHead>
                  <TableHead>{t("collectionManagement.director")}</TableHead>
                  <TableHead>{t("collectionManagement.releaseYear")}</TableHead>
                  <TableHead>{t("collectionManagement.duration")}</TableHead>
                  <TableHead>{t("collectionManagement.type")}</TableHead>
                  <TableHead className="text-right">{t("collectionManagement.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video: MinimalVideo) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>{video.director || t("collectionManagement.NA")}</TableCell>
                    <TableCell>{video.release_date || t("collectionManagement.NA")}</TableCell>
                    <TableCell>{video.duration || t("collectionManagement.NA")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {video.material_type_detail?.name || t("collectionManagement.NA")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("collectionManagement.openMenu")}</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(video.slug)}>
                              {t("collectionManagement.viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(video.slug)}>
                              {t("collectionManagement.edit")}
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600">
                                {t("collectionManagement.delete")}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("collectionManagement.areYouSure")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("collectionManagement.deleteConfirmation")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                              {t("collectionManagement.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 text-white hover:bg-red-600"
                              onClick={() => handleDeleteVideo(video.slug)}
                            >
                              {t("collectionManagement.delete")}
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
        )}
      </CardContent>
    </Card>
  );
};

export default CollectionPage;