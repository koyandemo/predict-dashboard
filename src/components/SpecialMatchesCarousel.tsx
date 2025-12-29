import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchWithDetails } from "@/interfaces";

interface SpecialMatchesCarouselProps {
  title: string;
  matches: MatchWithDetails[];
  onEdit: (match: MatchWithDetails) => void;
  onDelete: (id: number) => void;
}

export function SpecialMatchesCarousel({ title, matches, onEdit, onDelete }: SpecialMatchesCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(matches.length > 0);

  const carouselRef = (element: HTMLDivElement | null) => {
    if (element) {
      const handleScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = element;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
      };
      
      element.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef) {
      const carousel = document.querySelector('.special-matches-carousel') as HTMLElement;
      if (carousel) {
        const { scrollLeft, clientWidth } = carousel;
        const scrollTo = direction === "right"
          ? scrollLeft + clientWidth - 100
          : scrollLeft - clientWidth + 100;

        carousel.scrollTo({ left: scrollTo, behavior: "smooth" });
      }
    }
  };

  // Limit to 10 matches for the carousel
  const limitedMatches = matches.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/80 border border-border flex items-center justify-center shadow-md hover:bg-card transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        <div
          ref={carouselRef}
          className="special-matches-carousel flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-2"
        >
          {limitedMatches.length > 0 ? (
            limitedMatches.map((match) => (
              <div key={match.match_id} className="shrink-0 w-80 border rounded-lg p-4 bg-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">
                      {match.leagues?.name || "Unknown League"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {match.big_match && (
                      <span className="px-2 py-1 rounded text-xs bg-red-500 text-white">
                        Big
                      </span>
                    )}
                    {match.derby && (
                      <span className="px-2 py-1 rounded text-xs bg-orange-500 text-white">
                        Derby
                      </span>
                    )}
                    {match.match_type && match.match_type !== 'Normal' && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
                        {match.match_type}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="text-center flex-1">
                    <div className="font-medium truncate">
                      {match.home_team?.name || "Home Team"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      vs
                    </div>
                  </div>
                  
                  <div className="text-center mx-2">
                    <div className="text-lg font-bold">
                      {match.match_time || "--:--"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {match.match_timezone || "UTC"}
                    </div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <div className="font-medium truncate">
                      {match.away_team?.name || "Away Team"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      vs
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onEdit(match)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onDelete(match.match_id!)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8 text-muted-foreground">
              No special matches found
            </div>
          )}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/80 border border-border flex items-center justify-center shadow-md hover:bg-card transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}