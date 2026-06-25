import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface CarouselSlide {
  key: string;
  node: React.ReactNode;
}

interface ProductCarouselProps {
  slides: CarouselSlide[];
  tierColor: string;
  dotInactiveColor: string;
}

function padSlides(slides: CarouselSlide[], min = 6): CarouselSlide[] {
  if (slides.length >= min) return slides;
  const result: CarouselSlide[] = [];
  while (result.length < min) {
    slides.forEach(s => result.push({ key: `${s.key}-dup${result.length}`, node: s.node }));
  }
  return result.slice(0, min);
}

export function ProductCarousel({ slides, tierColor, dotInactiveColor }: ProductCarouselProps) {
  const items = padSlides(slides);
  const origLen = slides.length;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [totalSnaps, setTotalSnaps] = useState(items.length);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setTotalSnaps(emblaApi.scrollSnapList().length);
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  function getScale(i: number): number {
    const fwd = (i - selectedIndex + totalSnaps) % totalSnaps;
    const bwd = (selectedIndex - i + totalSnaps) % totalSnaps;
    const dist = Math.min(fwd, bwd);
    if (dist === 0) return 1.12;
    if (dist === 1) return 0.9;
    return 0.82;
  }

  function getOpacity(i: number): number {
    const fwd = (i - selectedIndex + totalSnaps) % totalSnaps;
    const bwd = (selectedIndex - i + totalSnaps) % totalSnaps;
    const dist = Math.min(fwd, bwd);
    if (dist === 0) return 1;
    if (dist === 1) return 0.72;
    return 0.45;
  }

  const arrowStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [side]: 4,
    top: '44%',
    transform: 'translateY(-50%)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: tierColor,
    color: 'white',
    fontSize: 24,
    fontWeight: 700,
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    boxShadow: `0 2px 12px ${tierColor}55`,
    transition: 'opacity 0.2s',
  });

  return (
    <div style={{ position: 'relative', padding: '0 52px 48px' }}>
      {/* Viewport */}
      <div ref={emblaRef} style={{ overflow: 'hidden', padding: '16px 0 24px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', touchAction: 'pan-y pinch-zoom' }}>
          {items.map((slide, i) => (
            <div
              key={slide.key}
              style={{
                flex: '0 0 280px',
                transform: `scale(${getScale(i)})`,
                opacity: getOpacity(i),
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
                transformOrigin: 'center center',
              }}
            >
              {slide.node}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={scrollPrev}
        style={arrowStyle('left')}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={scrollNext}
        style={arrowStyle('right')}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots — only original count */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
        {slides.map((slide, i) => {
          const isActive = selectedIndex % origLen === i;
          return (
            <button
              key={slide.key}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ir a producto ${i + 1}`}
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                padding: 0,
                background: isActive ? tierColor : dotInactiveColor,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
