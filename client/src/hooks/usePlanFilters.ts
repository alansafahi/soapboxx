import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ReadingPlanFilters } from '@/components/reading-plans/FilterBar';

const initialFilters: ReadingPlanFilters = {
  testament: [],
  orderType: [],
  books: [],
  themes: [],
  seasons: [],
  translation: '',
  difficulty: [],
  formatTypes: [],
  audienceTypes: [],
  duration: [],
  dailyTime: [],
  tier: [],
  search: ''
};

export function usePlanFilters() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<ReadingPlanFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<ReadingPlanFilters>(initialFilters);

  // Parse URL params on mount
  useEffect(() => {
    const urlFilters = { ...initialFilters };
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    
    // Parse arrays from URL
    const parseArray = (param: string | null): string[] => 
      param ? param.split(',').filter(Boolean) : [];
    
    urlFilters.testament = parseArray(searchParams.get('testament'));
    urlFilters.orderType = parseArray(searchParams.get('orderType'));
    urlFilters.books = parseArray(searchParams.get('books'));
    urlFilters.themes = parseArray(searchParams.get('themes'));
    urlFilters.seasons = parseArray(searchParams.get('seasons'));
    urlFilters.difficulty = parseArray(searchParams.get('difficulty'));
    urlFilters.formatTypes = parseArray(searchParams.get('formatTypes'));
    urlFilters.audienceTypes = parseArray(searchParams.get('audienceTypes'));
    urlFilters.duration = parseArray(searchParams.get('duration'));
    urlFilters.dailyTime = parseArray(searchParams.get('dailyTime'));
    urlFilters.tier = parseArray(searchParams.get('tier'));
    
    // Parse strings
    urlFilters.translation = searchParams.get('translation') || '';
    urlFilters.search = searchParams.get('search') || '';
    
    setFilters(urlFilters);
    setDebouncedFilters(urlFilters);
  }, [location]);

  // Debounce filter changes for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Helper to add array params
    const addArrayParam = (key: string, values: string[]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    };
    
    addArrayParam('testament', filters.testament);
    addArrayParam('orderType', filters.orderType);
    addArrayParam('books', filters.books);
    addArrayParam('themes', filters.themes);
    addArrayParam('seasons', filters.seasons);
    addArrayParam('difficulty', filters.difficulty);
    addArrayParam('formatTypes', filters.formatTypes);
    addArrayParam('audienceTypes', filters.audienceTypes);
    addArrayParam('duration', filters.duration);
    addArrayParam('dailyTime', filters.dailyTime);
    addArrayParam('tier', filters.tier);
    
    if (filters.translation) params.set('translation', filters.translation);
    if (filters.search) params.set('search', filters.search);
    
    // Update URL without causing a re-render
    const newUrl = params.toString();
    const currentSearch = location.split('?')[1] || '';
    if (newUrl !== currentSearch) {
      const basePath = location.split('?')[0];
      setLocation(newUrl ? `${basePath}?${newUrl}` : basePath, { replace: true });
    }
  }, [filters, setLocation, location]);

  const updateFilters = useCallback((newFilters: ReadingPlanFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    filters,
    debouncedFilters,
    updateFilters,
    clearFilters
  };
}