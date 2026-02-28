import { apiSlice } from "@/common/api/apiSlice";
import type { components } from "@/common/types/generated-api-types";

export type LibraryNews = components["schemas"]["LibraryNews"];
export type LibraryNewsList = components["schemas"]["PaginatedMinimalLibraryNewsList"];
export type LibraryNewsRequest = components["schemas"]["LibraryNewsRequest"];
export type PatchedLibraryNewsRequest = components["schemas"]["PatchedLibraryNewsRequest"];

export const newsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNewsList: builder.query<
            LibraryNewsList,
            { page?: number; page_size?: number; search?: string; ordering?: string; is_published?: boolean | string }
        >({
            query: ({ page, page_size, search, ordering, is_published } = {}) => {
                let params = ``;
                if (page) {
                    params += `page=${encodeURIComponent(page)}&`;
                }
                if (page_size) {
                    params += `page_size=${encodeURIComponent(page_size)}&`;
                }
                if (search) {
                    params += `search=${encodeURIComponent(search)}&`;
                }
                if (ordering) {
                    params += `ordering=${encodeURIComponent(ordering)}&`;
                }
                if (is_published !== undefined) {
                    params += `is_published=${encodeURIComponent(is_published)}&`;
                }
                // remove trailing &
                if (params.endsWith("&")) {
                    params = params.slice(0, -1);
                }
                return `library/news/${params ? `?${params}` : ""}`;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ slug }) => ({
                            type: "News" as const,
                            id: slug, // use slug or id
                        })),
                        { type: "News", id: "LIST" },
                    ]
                    : [{ type: "News", id: "LIST" }],
        }),

        getNewsBySlug: builder.query<LibraryNews, string>({
            query: (slug) => `library/news/${slug}/`,
            providesTags: (result, error, slug) => [{ type: "News", id: slug }],
        }),

        createNews: builder.mutation<LibraryNews, FormData>({
            query: (body) => ({
                url: "library/news/",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "News", id: "LIST" }],
        }),

        updateNews: builder.mutation<
            LibraryNews,
            { slug: string; data: FormData }
        >({
            query: ({ slug, data }) => ({
                url: `library/news/${slug}/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { slug }) => [{ type: "News", id: slug }, { type: "News", id: "LIST" }],
        }),

        partialUpdateNews: builder.mutation<
            LibraryNews,
            { slug: string; data: FormData }
        >({
            query: ({ slug, data }) => ({
                url: `library/news/${slug}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { slug }) => [{ type: "News", id: slug }, { type: "News", id: "LIST" }],
        }),

        deleteNews: builder.mutation<{ success: boolean }, string>({
            query: (slug) => ({
                url: `library/news/${slug}/`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, slug) => [{ type: "News", id: slug }, { type: "News", id: "LIST" }],
        }),
    }),
});

export const {
    useGetNewsListQuery,
    useGetNewsBySlugQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    usePartialUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApiSlice;
