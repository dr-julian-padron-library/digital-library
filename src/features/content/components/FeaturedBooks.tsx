
import { BookOpen, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";

const featuredBooks = [
  {
    id: 1,
    title: "Cien Años de Soledad",
    author: "Gabriel García Márquez",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
    description: "Una obra maestra del realismo mágico que narra la historia de la familia Buendía.",
    rating: 4.8,
    available: true
  },
  {
    id: 2,
    title: "Doña Bárbara",
    author: "Rómulo Gallegos",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "Clásico de la literatura venezolana que retrata la lucha entre civilización y barbarie.",
    rating: 4.6,
    available: true
  },
  {
    id: 3,
    title: "Las Lanzas Coloradas",
    author: "Arturo Uslar Pietri",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "Novela histórica sobre la Guerra de Independencia de Venezuela.",
    rating: 4.4,
    available: false
  }
];

export function FeaturedBooks() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-primary mb-4">
            Libros Destacados
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre las obras más populares y recomendadas de nuestra colección
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden book-card-hover group">
              <div className="relative overflow-hidden">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-destructive"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                {!book.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-destructive text-white px-3 py-1 rounded-full text-sm font-medium">
                      No Disponible
                    </span>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((starId) => (
                    <Star
                      key={`star-${starId}`}
                      className={`w-4 h-4 ${(starId - 1) < Math.floor(book.rating)
                        ? 'text-highlight-gold fill-highlight-gold'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">({book.rating})</span>
                </div>

                <h3 className="font-display text-lg font-semibold text-primary mb-2">
                  {book.title}
                </h3>
                <p className="text-destructive font-medium mb-3">
                  {book.author}
                </p>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {book.description}
                </p>

                <Button
                  className={`w-full ${book.available
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  disabled={!book.available}
                >
                  <BookOpen className="mr-2 w-4 h-4" />
                  {book.available ? 'Solicitar Préstamo' : 'No Disponible'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
