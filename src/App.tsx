import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CategoryBar } from '@/src/components/CategoryBar';
import { Footer } from '@/src/components/Footer';
import { Header } from '@/src/components/Header';
import { Hero } from '@/src/components/Hero';
import { MasonryGrid } from '@/src/components/MasonryGrid';
import { StaticPage } from '@/src/components/StaticPage';
import { StockPage } from '@/src/components/StockPage';
import {
  downloadImageFile,
  filterImages,
  getAllImages,
  getCategoryCounts,
} from '@/src/services/imageService';
import {
  CATEGORIES,
  type Category,
  type ImageCategory,
  type ImageItem,
  type InfoModalType,
  type SourceFilter,
} from '@/src/types/image';

type PageRoute =
  | { type: 'home' }
  | { type: 'stock'; slug: string }
  | { type: 'static'; page: Exclude<InfoModalType, null> };

function parseRoute(pathname: string): PageRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/about') return { type: 'static', page: 'about' };
  if (clean === '/contact') return { type: 'static', page: 'contact' };
  if (clean === '/privacy-policy') return { type: 'static', page: 'privacy' };
  if (clean === '/terms') return { type: 'static', page: 'terms' };
  if (clean.startsWith('/stock/')) {
    const slug = decodeURIComponent(clean.slice('/stock/'.length));
    if (slug) return { type: 'stock', slug };
  }
  return { type: 'home' };
}

function readInitialFilters() {
  if (typeof window === 'undefined') {
    return {
      query: '',
      category: 'All' as Category,
      source: 'All' as SourceFilter,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const rawQuery = params.get('q') ?? '';
  const rawCategory = params.get('category') ?? 'All';
  const rawSource = params.get('source') ?? 'All';

  const validCategory = (CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : 'All';

  const validSource: SourceFilter =
    rawSource === 'AI Generated' || rawSource === 'Licensed Stock'
      ? rawSource
      : 'All';

  return {
    query: rawQuery,
    category: validCategory,
    source: validSource,
  };
}

export default function App() {
  const [images, setImages] = useState<ImageItem[]>(() => getAllImages());
  const initialFilters = useMemo(() => readInitialFilters(), []);

  const [route, setRoute] = useState<PageRoute>(() =>
    typeof window !== 'undefined'
      ? parseRoute(window.location.pathname)
      : { type: 'home' }
  );
  const [searchQuery, setSearchQuery] = useState(initialFilters.query);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    initialFilters.category
  );
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>(
    initialFilters.source
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
      const updatedFilters = readInitialFilters();
      setSearchQuery(updatedFilters.query);
      setSelectedCategory(updatedFilters.category);
      setSourceFilter(updatedFilters.source);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync URL query params when on Home route
  useEffect(() => {
    if (route.type !== 'home') return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sourceFilter !== 'All') params.set('source', sourceFilter);

    const queryString = params.toString();
    const nextUrl = queryString ? `/?${queryString}` : '/';
    const currentFull = `${window.location.pathname}${window.location.search}`;
    if (currentFull !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [route.type, searchQuery, selectedCategory, sourceFilter]);

  const navigateTo = useCallback((path: string, scrollTop = true) => {
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute(parseRoute(path.split('?')[0]));
    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const categoryCounts = useMemo(() => getCategoryCounts(images), [images]);

  const isFiltering =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    sourceFilter !== 'All';

  const filteredImages = useMemo(
    () => filterImages(images, searchQuery, selectedCategory, sourceFilter),
    [images, searchQuery, selectedCategory, sourceFilter]
  );

  const featuredImages = useMemo(
    () => images.filter((item) => item.featured),
    [images]
  );

  const popularImages = useMemo(
    () => [...images].sort((a, b) => b.downloads - a.downloads).slice(0, 8),
    [images]
  );

  const latestImages = useMemo(
    () =>
      [...images]
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .slice(0, 8),
    [images]
  );

  const activeStockImage = useMemo(() => {
    if (route.type !== 'stock') return null;
    return (
      images.find(
        (item) => item.slug === route.slug || item.id === route.slug
      ) ?? null
    );
  }, [images, route]);

  // Update browser document title per active page
  useEffect(() => {
    if (route.type === 'stock' && activeStockImage) {
      document.title = `${activeStockImage.title} — Qyopic`;
    } else if (route.type === 'static') {
      const pageNames = {
        about: 'About',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms & Conditions',
      };
      document.title = `${pageNames[route.page]} — Qyopic`;
    } else {
      document.title = 'Qyopic — Discover Beautiful Images';
    }
  }, [route, activeStockImage]);

  const handleOpenStock = useCallback(
    (image: ImageItem) => {
      navigateTo(`/stock/${image.slug}`, true);
    },
    [navigateTo]
  );

  const handleDownloadImage = async (target: ImageItem) => {
    await downloadImageFile(target);
    setImages((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? { ...item, downloads: item.downloads + 1 }
          : item
      )
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSourceFilter('All');
  };

  const handleResetHome = () => {
    handleResetFilters();
    navigateTo('/', true);
  };

  const handleNavigateSection = (sectionId: string) => {
    if (route.type !== 'home') {
      handleResetFilters();
      navigateTo('/', false);
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    if (isFiltering && sectionId !== 'categories') {
      handleResetFilters();
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearchClick = () => {
    if (route.type !== 'home') {
      navigateTo('/', false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        searchInputRef.current?.focus();
      }, 120);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 220);
  };

  const handleSearchSubmit = () => {
    const targetId = isFiltering ? 'filtered-results' : 'featured';
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectCategoryFromStock = (category: ImageCategory) => {
    setSearchQuery('');
    setSourceFilter('All');
    setSelectedCategory(category);
    navigateTo(`/?category=${encodeURIComponent(category)}`, true);
  };

  const handleSearchTagFromStock = (tag: string) => {
    setSelectedCategory('All');
    setSourceFilter('All');
    setSearchQuery(tag);
    navigateTo(`/?q=${encodeURIComponent(tag)}`, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
      <Header
        onSearchClick={handleSearchClick}
        onNavigateSection={handleNavigateSection}
        onResetHome={handleResetHome}
      />

      <main className="flex-1">
        {route.type === 'stock' && activeStockImage ? (
          <StockPage
            image={activeStockImage}
            allImages={images}
            onBackHome={() => navigateTo('/', true)}
            onOpenStock={handleOpenStock}
            onDownload={handleDownloadImage}
            onSelectCategory={handleSelectCategoryFromStock}
            onSearchTag={handleSearchTagFromStock}
          />
        ) : route.type === 'stock' && !activeStockImage ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
              Image not found
            </h1>
            <p className="mt-2 text-sm text-[#52525B]">
              The requested stock image could not be located in the Qyopic archive.
            </p>
            <button
              type="button"
              onClick={handleResetHome}
              className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
            >
              Back to Gallery
            </button>
          </div>
        ) : route.type === 'static' ? (
          <StaticPage
            page={route.page}
            onBackHome={() => navigateTo('/', true)}
          />
        ) : (
          <>
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              searchInputRef={searchInputRef}
              totalImages={images.length}
            />

            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
              sourceFilter={sourceFilter}
              onSelectSourceFilter={setSourceFilter}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Active Search & Category Results */}
              {isFiltering && (
                <section
                  id="filtered-results"
                  aria-label="Filtered images"
                  className="pt-10 pb-14 border-b border-[#E4E4E7]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
                        {selectedCategory !== 'All'
                          ? `${selectedCategory} Images`
                          : 'Search Results'}
                      </h2>
                      <p className="mt-1 text-sm text-[#52525B]">
                        <span className="font-mono tabular-nums font-medium text-[#0A0A0A]">
                          {filteredImages.length}
                        </span>{' '}
                        {filteredImages.length === 1 ? 'image' : 'images'} matched
                        {searchQuery.trim()
                          ? ` for “${searchQuery.trim()}”`
                          : ''}
                        {sourceFilter !== 'All' ? ` · ${sourceFilter}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="self-start sm:self-auto inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[#E4E4E7] text-xs font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>

                  <MasonryGrid
                    images={filteredImages}
                    onOpenStock={handleOpenStock}
                    onResetFilters={handleResetFilters}
                  />
                </section>
              )}

              {/* Homepage Curated Sections */}
              {!isFiltering && (
                <>
                  <section
                    id="featured"
                    aria-labelledby="featured-heading"
                    className="pt-12 pb-14 border-b border-[#E4E4E7]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-7">
                      <div>
                        <h2
                          id="featured-heading"
                          className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]"
                        >
                          Featured Images
                        </h2>
                        <p className="mt-1 text-sm text-[#52525B]">
                          Editorially selected visuals across photography and generative art.
                        </p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#71717A]">
                        {featuredImages.length} curated works
                      </span>
                    </div>

                    <MasonryGrid
                      images={featuredImages}
                      onOpenStock={handleOpenStock}
                    />
                  </section>

                  <section
                    id="popular"
                    aria-labelledby="popular-heading"
                    className="pt-12 pb-14 border-b border-[#E4E4E7]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-7">
                      <div>
                        <h2
                          id="popular-heading"
                          className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]"
                        >
                          Popular Images
                        </h2>
                        <p className="mt-1 text-sm text-[#52525B]">
                          Most downloaded visuals by creators and design teams.
                        </p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#71717A]">
                        Top {popularImages.length} by downloads
                      </span>
                    </div>

                    <MasonryGrid
                      images={popularImages}
                      onOpenStock={handleOpenStock}
                    />
                  </section>

                  <section
                    id="latest"
                    aria-labelledby="latest-heading"
                    className="pt-12 pb-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-7">
                      <div>
                        <h2
                          id="latest-heading"
                          className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]"
                        >
                          Latest Images
                        </h2>
                        <p className="mt-1 text-sm text-[#52525B]">
                          Fresh additions to the Qyopic archive.
                        </p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#71717A]">
                        {latestImages.length} recent uploads
                      </span>
                    </div>

                    <MasonryGrid
                      images={latestImages}
                      onOpenStock={handleOpenStock}
                    />
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <Footer
        onNavigatePath={(path) => navigateTo(path, true)}
        onResetHome={handleResetHome}
      />
    </div>
  );
}
