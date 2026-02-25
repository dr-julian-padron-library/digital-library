import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/common/hooks/use-toast";
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
import { Filter, Plus, User, MoreVertical } from "lucide-react";
import { useGetProfilesQuery, useDeleteProfileMutation } from "@/features/content-management/api/profilesApiSlice";
import { PaginationComponent } from "@/common/components/ui/pagination";
import { Badge } from "@/common/components/ui/badge";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import { Profile } from "@/features/content-management/components/ProfileForm/ProfileFormConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<{ search?: string }>({});
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const { data: profiles, isFetching, error } = useGetProfilesQuery({
    search: filters.search,
    page_size: pageSize,
    page: page,
  });
  const [deleteProfile, { isLoading: isDeleting }] = useDeleteProfileMutation();

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

  const handleEdit = (profileId: string) => {
    navigate(`/gestion/usuarios/${profileId}`);
  };

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    try {
      await deleteProfile(profileId).unwrap();
      toast({
        title: t("profileManagement.profileDeleted"),
        description: t("profileManagement.profileDeletedSuccess", { name: profileName }),
      });
    } catch (error) {
      toast({
        title: t("profileManagement.error"),
        description: t("profileManagement.profileDeleteError"),
        variant: "destructive",
      });
    }
  };

  const handleAdd = () => {
    navigate("/gestion/usuarios/create");
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const profileResults = profiles?.results ?? [];
  const count = profiles?.count ?? 0;

  const maxPage = Math.ceil(count / pageSize);
  const pageSizeOptions = [10, 20, 50, 100];

  if (isFetching && !profiles) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
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
          {t("profileManagement.errorLoadingProfiles")}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex">
        <CardTitle>{t("profileManagement.userManagement")}</CardTitle>
        <div className="flex items-center justify-end space-x-2 pt-2 mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t("profileManagement.filters")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-3" align="end">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">{t("profileManagement.pageSize")}</span>
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
                placeholder={t("profileManagement.searchProfilePlaceholder")}
                value={filters.search || ""}
                onChange={(e) => handleChange("search", e.target.value)}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("profileManagement.addUser")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {count === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("profileManagement.noProfilesFound")}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("profileManagement.fullName")}</TableHead>
                      <TableHead>{t("profileManagement.email")}</TableHead>
                      <TableHead>{t("profileManagement.nationalDocument")}</TableHead>
                      <TableHead className="text-right">{t("profileManagement.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profileResults.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-biblioteca-primary text-white">
                                {getInitials(profile.user?.first_name, profile.user?.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{`${profile.user?.first_name} ${profile.user?.last_name}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>{profile.user?.email}</TableCell>
                        <TableCell>{profile.national_document}</TableCell>
                        {/* <TableCell>
                          <Badge variant={profile.activo ? "default" : "secondary"}>
                            {profile.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell> */}
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("profileManagement.openMenu")}</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(profile.id)}>
                                  {t("profileManagement.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(profile.id)}>
                                  {t("profileManagement.edit")}
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    {t("profileManagement.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("profileManagement.areYouSure")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("profileManagement.deleteConfirmation", { name: `${profile.user?.first_name} ${profile.user?.last_name}` })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                  {t("profileManagement.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => handleDeleteProfile(profile.id, `${profile.user?.first_name} ${profile.user?.last_name}`)}
                                >
                                  {t("profileManagement.delete")}
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
              {profileResults.map((profile) => (
                <Card key={profile.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-xs bg-biblioteca-primary text-white">
                              {getInitials(profile.user?.first_name, profile.user?.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-sm">{`${profile.user?.first_name} ${profile.user?.last_name}`}</h3>
                            <p className="text-xs text-muted-foreground">{profile.user?.email}</p>
                            <p className="text-xs text-muted-foreground">{profile.national_document}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("profileManagement.openMenu")}</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(profile.id)}>
                                  {t("profileManagement.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(profile.id)}>
                                  {t("profileManagement.edit")}
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    {t("profileManagement.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("profileManagement.areYouSure")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("profileManagement.deleteConfirmation", { name: `${profile.user?.first_name} ${profile.user?.last_name}` })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">
                                  {t("profileManagement.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => handleDeleteProfile(profile.id, `${profile.user?.first_name} ${profile.user?.last_name}`)}
                                >
                                  {t("profileManagement.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {/* <div className="mt-2">
                        <Badge variant={profile.activo ? "default" : "secondary"}>
                          {profile.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div> */}
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

export default UserManagementPage;