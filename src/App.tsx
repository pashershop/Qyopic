import { useMemo, useRef, useState } from 'react';
import { CategoryBar } from '@/src/components/CategoryBar';
import { Footer } from '@/src/components/Footer';
import { Header } from '@/src/components/Header';
import { Hero } from '@/src/components/Hero';
import { ImageModal } from '@/src/components/ImageModal';
import { InfoModal } from '@/src/components/InfoModal';
import { MasonryGrid } from '@/src/components/MasonryGrid';
import {
  downloadImageFile,
  filterImages,
  getAllImages,
  getCategoryCounts,
} from '@/src/services/imageService';
import type {
  Category,
  ImageItem,
  InfoModalType,
  SourceFilter,
} from '@/src/types/image';

export default function App() {
  const [images, setImages] = useState<ImageItem[]>(() => getAllImages());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('All');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<InfoModalType>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const selectedImage = useMemo(
    () => images.find((item) => item.id === selectedImageId) ?? null,
    [images, selectedImageId]
  );

  const activeGalleryList = isFiltering ? filteredImages : images;

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

  const handleNavigateSection = (sectionId: string) => {
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

  const handleResetHome = () => {
    handleResetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
      <Header
        onSearchClick={handleSearchClick}
        onNavigateSection={handleNavigateSection}
        onResetHome={handleResetHome}
      />

      <main className="flex-1">
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
                    {searchQuery.trim() ? ` for “${searchQuery.trim()}”` : ''}
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
                onSelectImage={(img) => setSelectedImageId(img.id)}
                onDownloadImage={handleDownloadImage}
                onResetFilters={handleResetFilters}
              />
            </section>
          )}

          {/* Featured Images Section */}
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
                  onSelectImage={(img) => setSelectedImageId(img.id)}
                  onDownloadImage={handleDownloadImage}
                />
              </section>

              {/* Popular Images Section */}
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
                  onSelectImage={(img) => setSelectedImageId(img.id)}
                  onDownloadImage={handleDownloadImage}
                />
              </section>

              {/* Latest Images Section */}
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
                  onSelectImage={(img) => setSelectedImageId(img.id)}
                  onDownloadImage={handleDownloadImage}
                />
              </section>
            </>
          )}
        </div>
      </main>

      <Footer
        onOpenInfo={(type) => setInfoModal(type)}
        onResetHome={handleResetHome}
      />

      <ImageModal
        image={selectedImage}
        allImages={activeGalleryList}
        onClose={() => setSelectedImageId(null)}
        onSelectImage={(img) => setSelectedImageId(img.id)}
        onDownload={handleDownloadImage}
        onSelectCategory={(category) => setSelectedCategory(category)}
        onSearchTag={(tag) => setSearchQuery(tag)}
      />

      <InfoModal type={infoModal} onClose={() => setInfoModal(null)} />
    </div>
  );
}
