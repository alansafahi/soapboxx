import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { SavedSearches } from './SavedSearches';

export interface ReadingPlanFilters {
  testament: string[];
  orderType: string[];
  books: string[];
  themes: string[];
  seasons: string[];
  translation: string;
  difficulty: string[];
  formatTypes: string[];
  audienceTypes: string[];
  duration: string[];
  dailyTime: string[];
  tier: string[];
  search: string;
}

interface FilterBarProps {
  filters: ReadingPlanFilters;
  onChange: (filters: ReadingPlanFilters) => void;
  planCount: number;
}

const TESTAMENT_OPTIONS = [
  { id: 'OT', label: 'Old Testament' },
  { id: 'NT', label: 'New Testament' },
  { id: 'Both', label: 'Both Testaments' }
];
const ORDER_OPTIONS = ['Chronological', 'Historical', 'Canonical'];
const DIFFICULTY_OPTIONS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];
const FORMAT_OPTIONS = ['Reading', 'Reflection', 'Prayer', 'Audio', 'Video'];
const AUDIENCE_OPTIONS = ['Solo', 'Group', 'Family', 'Church'];
const TRANSLATION_OPTIONS = ['All', 'NIV', 'KJV', 'ESV', 'NASB', 'NLT', 'CSB', 'NKJV'];
const TIER_OPTIONS = ['free', 'standard', 'premium'];

const DURATION_OPTIONS = [
  { id: 'lt30', label: 'Less than 30 days' },
  { id: '1to3m', label: '1-3 months' },
  { id: '4to6m', label: '4-6 months' },
  { id: '7to12m', label: '7-12 months' },
  { id: 'gt12m', label: 'Over 1 year' }
];

const DAILY_TIME_OPTIONS = [
  { id: 'lt10', label: '5-10 min/day' },
  { id: '10to20', label: '10-20 min/day' },
  { id: 'gt20', label: '20+ min/day' }
];

const THEME_OPTIONS = [
  'peace-in-anxiety', 'joy-gratitude', 'forgiveness-grace', 'discipleship',
  'leadership-service', 'family-relationships', 'spiritual-warfare'
];

const SEASON_OPTIONS = [
  'advent', 'christmas', 'lent', 'easter', 'new-year', 'back-to-school'
];

const BOOK_OPTIONS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

export default function FilterBar({ filters, onChange, planCount }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const updateFilter = <K extends keyof ReadingPlanFilters>(
    key: K,
    value: ReadingPlanFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: keyof ReadingPlanFilters, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    onChange({
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
    });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(val => 
    Array.isArray(val) ? val.length > 0 : val
  );

  const getFilterChips = () => {
    const chips: { key: string; value: string; onRemove: () => void }[] = [];
    
    filters.testament.forEach(val => 
      chips.push({ key: 'testament', value: val, onRemove: () => updateFilter('testament', []) })
    );
    filters.orderType.forEach(val => 
      chips.push({ key: 'order', value: val, onRemove: () => toggleArrayValue('orderType', val) })
    );
    filters.difficulty.forEach(val => 
      chips.push({ key: 'difficulty', value: val, onRemove: () => toggleArrayValue('difficulty', val) })
    );
    if (filters.translation) {
      chips.push({ 
        key: 'translation', 
        value: filters.translation, 
        onRemove: () => updateFilter('translation', '') 
      });
    }
    
    return chips;
  };

  const MultiSelectDropdown = ({ 
    label, 
    options, 
    values, 
    onToggle,
    searchable = false 
  }: {
    label: string;
    options: string[] | Array<{id: string, label: string}>;
    values: string[];
    onToggle: (value: string) => void;
    searchable?: boolean;
  }) => {
    const [search, setSearch] = useState('');
    
    // Normalize options to a consistent format
    const normalizedOptions = options.map(opt => 
      typeof opt === 'string' ? { id: opt, label: opt } : opt
    );
    
    const filteredOptions = searchable 
      ? normalizedOptions.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
      : normalizedOptions;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9">
            {label}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
          {searchable && (
            <>
              <div className="p-2">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <div className="p-1">
            {filteredOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                <Checkbox
                  checked={values.includes(option.id)}
                  onCheckedChange={() => onToggle(option.id)}
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm border">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search reading plans..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateFilter('search', e.target.value);
            }}
            className="h-10"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9">
              Testament {filters.testament.length > 0 && `(${filters.testament[0]})`}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="p-1">
              {TESTAMENT_OPTIONS.map(option => (
                <div 
                  key={option.id} 
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => updateFilter('testament', filters.testament.includes(option.id) ? [] : [option.id])}
                >
                  <span className="text-sm">{option.label}</span>
                  {filters.testament.includes(option.id) && <span className="ml-auto">✓</span>}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <MultiSelectDropdown
          label="Order"
          options={ORDER_OPTIONS}
          values={filters.orderType}
          onToggle={(val) => toggleArrayValue('orderType', val)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9">
              Translation {filters.translation && `(${filters.translation})`}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="p-1">
              {TRANSLATION_OPTIONS.map(option => (
                <div 
                  key={option} 
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => updateFilter('translation', option)}
                >
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <MultiSelectDropdown
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          values={filters.difficulty}
          onToggle={(val) => toggleArrayValue('difficulty', val)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9">
              More Filters
              <Filter className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Duration</DropdownMenuLabel>
            <div className="p-1">
              {DURATION_OPTIONS.map(option => (
                <div key={option.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                  <Checkbox
                    checked={filters.duration.includes(option.id)}
                    onCheckedChange={() => toggleArrayValue('duration', option.id)}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Daily Time</DropdownMenuLabel>
            <div className="p-1">
              {DAILY_TIME_OPTIONS.map(option => (
                <div key={option.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                  <Checkbox
                    checked={filters.dailyTime.includes(option.id)}
                    onCheckedChange={() => toggleArrayValue('dailyTime', option.id)}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <SavedSearches
          currentFilters={filters}
          onApplySearch={(searchCriteria) => onChange({...filters, ...searchCriteria})}
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {getFilterChips().length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {getFilterChips().map((chip, index) => (
            <Badge key={index} variant="secondary" className="h-6">
              {chip.value}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={chip.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {planCount} reading plans available
      </div>
    </div>
  );
}