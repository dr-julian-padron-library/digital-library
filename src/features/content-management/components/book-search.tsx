import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetBooksQuery } from "@/features/content-management/api/booksApiSlice";

export const useBookSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

    const { data: allBooksData, isLoading: allBooksLoading } = useGetBooksQuery({});

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 50);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        if (debouncedQuery && allBooksData?.results?.length) {
            const lowerValue = debouncedQuery.toLowerCase();
            const results = allBooksData.results.filter((b: any) =>
                b.title.toLowerCase().includes(lowerValue)
            );
            setFilteredResults(results.slice(0, 5));
        } else {
            setFilteredResults([]);
        }
    }, [debouncedQuery, allBooksData]);

    const handleSearch = () => {
        const resultToRedirect = highlightedIndex !== null ? filteredResults[highlightedIndex] : filteredResults[0];
        if (resultToRedirect) {
            navigate(`/libros/${resultToRedirect.slug}`);
        }
        setFilteredResults([]);
        setHighlightedIndex(null);
    };

    const handleSuggestionClick = (item: any) => {
        navigate(`/libros/${item.slug}`);
        setSearchQuery("");
        setFilteredResults([]);
    };

    const renderSuggestion = (item: any) => item.title;

    return {
        searchQuery,
        setSearchQuery,
        filteredResults,
        handleSearch,
        handleSuggestionClick,
        highlightedIndex,
        setHighlightedIndex,
        isLoading: allBooksLoading,
        renderSuggestion,
    };
};