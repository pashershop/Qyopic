import {
  CATEGORIES,
  type Category,
  type SourceFilter,
} from '@/src/types/image';

interface CategoryBarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  categoryCounts: Record<Category, number>;
  sourceFilter: SourceFilter;
  onSelectSourceFilter: (source: SourceFilter) => void;
}

const SOURCE_OPTIONS: SourceFilter[] = [
  'All',
  'AI Generated',
  'Licensed Stock',
];

export function CategoryBar({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  sourceFilter,
  onSelectSourceFilter,
}: CategoryBarProps) {
  return (
    <section
      id="categories"
      aria-label="Image categories"
      className="bg-white border-b border-[#E4E4E7] py-5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0"
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const count = categoryCounts[category] ?? 0;

            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-[#F4F4F5] text-[#3F3F46] hover:bg-[#E4E4E7] hover:text-[#0A0A0A]'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isActive ? 'text-white/70' : 'text-[#71717A]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Source Type Segmented Filter */}
        <div
          role="group"
          aria-label="Filter by image source"
          className="inline-flex items-center p-1 rounded-lg bg-[#F4F4F5] self-start lg:self-auto shrink-0"
        >
          {SOURCE_OPTIONS.map((option) => {
            const active = sourceFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelectSourceFilter(option)}
                className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-xs'
                    : 'text-[#52525B] hover:text-[#0A0A0A]'
                }`}
              >
                {option === 'All' ? 'All Sources' : option}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
