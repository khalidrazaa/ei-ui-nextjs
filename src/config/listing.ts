/** Articles list page settings. */
export const ARTICLES_PAGE_SIZE = 9;

export type SortOrder = "newest" | "oldest";

export const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export const DEFAULT_SORT: SortOrder = "newest";
