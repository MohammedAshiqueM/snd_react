import { create } from 'zustand';

const useSearchStore = create((set) => ({
  searchQuery: '',
  selectedCategory: 'All',
  currentPage: 1,
  searchContext: 'blogs',
  
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setSelectedCategory: (category) => set({ selectedCategory: category, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchContext: (context) => set({ searchContext: context }),
  clearSearchQuery: () => set({ searchQuery: '' }),
  resetSearch: () => set({ 
    searchQuery: '', 
    selectedCategory: 'All', 
    currentPage: 1 
  })
}));

export default useSearchStore;