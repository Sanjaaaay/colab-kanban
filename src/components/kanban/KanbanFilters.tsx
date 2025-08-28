import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterOptions, Priority } from '@/types/kanban';
import { Filter, X, ArrowUpDown } from 'lucide-react';

interface KanbanFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
}

export const KanbanFilters: React.FC<KanbanFiltersProps> = ({
  filters,
  onFiltersChange,
  categories
}) => {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Priority
            </label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => updateFilter('priority', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Sort by Date
            </label>
            <Select
              value={filters.dueDateOrder || 'none'}
              onValueChange={(value) => updateFilter('dueDateOrder', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="asc">
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    Earliest First
                  </div>
                </SelectItem>
                <SelectItem value="desc">
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3 rotate-180" />
                    Latest First
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Sort by Priority
            </label>
            <Select
              value={filters.priorityOrder || 'none'}
              onValueChange={(value) => updateFilter('priorityOrder', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="asc">
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    Low to High
                  </div>
                </SelectItem>
                <SelectItem value="desc">
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3 rotate-180" />
                    High to Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};