import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FilterBar({ 
  search, 
  onSearchChange, 
  categoryId, 
  onCategoryChange, 
  eventId, 
  onEventChange,
  categories,
  events
}) {
  return (
    <div className="bg-white border border-border rounded-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-sm bg-surface-highlight border-transparent focus:border-primary"
            data-testid="search-input"
          />
        </div>
        
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="rounded-sm bg-surface-highlight border-transparent focus:border-primary" data-testid="category-filter">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={eventId} onValueChange={onEventChange}>
          <SelectTrigger className="rounded-sm bg-surface-highlight border-transparent focus:border-primary" data-testid="event-filter">
            <SelectValue placeholder="Todos os eventos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os eventos</SelectItem>
            {events.map((evt) => (
              <SelectItem key={evt.event_id} value={evt.event_id}>
                {evt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}