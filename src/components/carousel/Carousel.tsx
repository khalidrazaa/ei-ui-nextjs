"use client";

import Autoplay from "embla-carousel-autoplay";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  Children,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CarouselState = {
  selected: number;
  count: number;
  canPrev: boolean;
  canNext: boolean;
};

type CarouselContextValue = CarouselState & {
  viewportRef: ReturnType<typeof useEmblaCarousel>[0];
  hasAutoplay: boolean;
  playing: boolean;
  prev: () => void;
  next: () => void;
  goTo: (index: number) => void;
  toggleAutoplay: () => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("Carousel parts must be used inside <Carousel>.");
  return context;
}

type CarouselProps = {
  label: string;
  options?: EmblaOptionsType;
  /** Delay between slides. Omit for a manual carousel. */
  autoplayMs?: number;
  className?: string;
  children: ReactNode;
};

export function Carousel({ label, options, autoplayMs, className, children }: CarouselProps) {
  const reducedMotion = useReducedMotion();
  const plugins = useMemo(
    () =>
      autoplayMs && !reducedMotion
        ? [Autoplay({ delay: autoplayMs, stopOnMouseEnter: true, stopOnInteraction: false })]
        : [],
    [autoplayMs, reducedMotion],
  );
  const [viewportRef, api] = useEmblaCarousel(options, plugins);
  const [state, setState] = useState<CarouselState>({ selected: 0, count: 0, canPrev: false, canNext: false });
  const [playing, setPlaying] = useState(plugins.length > 0);

  const sync = useCallback((embla: EmblaCarouselType) => {
    setState({
      selected: embla.selectedScrollSnap(),
      count: embla.scrollSnapList().length,
      canPrev: embla.canScrollPrev(),
      canNext: embla.canScrollNext(),
    });
  }, []);

  useEffect(() => {
    if (!api) return;
    sync(api);
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api, sync]);

  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);
  const goTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = api?.plugins().autoplay;
    if (!autoplay) return;
    if (autoplay.isPlaying()) {
      autoplay.stop();
      setPlaying(false);
    } else {
      autoplay.play();
      setPlaying(true);
    }
  }, [api]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  }

  const value: CarouselContextValue = {
    ...state,
    viewportRef,
    hasAutoplay: plugins.length > 0,
    playing,
    prev,
    next,
    goTo,
    toggleAutoplay,
  };

  return (
    <CarouselContext.Provider value={value}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={className}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

type CarouselContentProps = {
  children: ReactNode;
  className?: string;
  slideClassName?: string;
};

export function CarouselContent({ children, className, slideClassName }: CarouselContentProps) {
  const { viewportRef } = useCarousel();
  const slides = Children.toArray(children);

  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div className={cn("flex", className)}>
        {slides.map((slide, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            className={cn("min-w-0 shrink-0 grow-0 basis-full", slideClassName)}
          >
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CarouselArrows({ className }: { className?: string }) {
  const { prev, next, canPrev, canNext } = useCarousel();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button type="button" variant="outline" size="icon" className="size-8 rounded-full" onClick={prev} disabled={!canPrev} aria-label="Previous">
        <ChevronLeft aria-hidden="true" />
      </Button>
      <Button type="button" variant="outline" size="icon" className="size-8 rounded-full" onClick={next} disabled={!canNext} aria-label="Next">
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}

export function CarouselDots({ className }: { className?: string }) {
  const { count, selected, goTo } = useCarousel();

  return (
    <div className={cn("flex items-center gap-1.5", className)} role="tablist" aria-label="Choose slide">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === selected}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => goTo(index)}
          className={cn(
            "h-1.5 rounded-full transition-[width,background-color] duration-300",
            index === selected ? "w-7 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/50",
          )}
        />
      ))}
    </div>
  );
}

export function CarouselPlayToggle() {
  const { hasAutoplay, playing, toggleAutoplay } = useCarousel();
  if (!hasAutoplay) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 rounded-full"
      onClick={toggleAutoplay}
      aria-label={playing ? "Pause autoplay" : "Start autoplay"}
    >
      {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
    </Button>
  );
}
