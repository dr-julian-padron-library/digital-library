import { Link } from "react-router-dom";
import type { components } from '@/common/types/generated-api-types';

export type MinimalBook = components['schemas']['MinimalBook'];

interface MinimalBookCardProps {
  book: MinimalBook;
}

export function BookCard({ book }: MinimalBookCardProps) {
  return (
    <Link to={`/libros/${book.slug}`} className="group relative block w-full h-full">
      {/* Book Cover */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-lg">
        <img
          src={book.cover}
          alt={`Portada de ${book.title}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover overlay for title and authors */}
        <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="text-center">
            {/* Book Title */}
            <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
              {book.title}
            </h3>
            {/* Authors' names in a smaller font */}
            {book.authors && book.authors.length > 0 && (
              <p className="mt-1 text-xs text-gray-600 line-clamp-1">
                {book.authors.map(a => a.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
