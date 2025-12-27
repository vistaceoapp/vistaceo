import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Star, Trash2, Package } from 'lucide-react';
import { MenuItemData, SetupData } from '@/lib/setupSteps';
import { CountryCode, formatCurrency } from '@/lib/countryPacks';
import { cn } from '@/lib/utils';

interface SetupStepMenuProps {
  countryCode: CountryCode;
  data: Partial<SetupData>;
  onUpdate: (data: Partial<SetupData>, precision?: number) => void;
}

export const SetupStepMenu = ({ countryCode, data, onUpdate }: SetupStepMenuProps) => {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>(data.menuItems || []);
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '' });

  const starItems = menuItems.filter(i => i.isStarItem).length;
  const totalItems = menuItems.length;
  const isValid = totalItems >= 12 || starItems >= 8;

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    
    const item: MenuItemData = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      category: newItem.category || 'Sin categoría',
      price: parseFloat(newItem.price),
      isStarItem: false,
    };
    
    const updated = [...menuItems, item];
    setMenuItems(updated);
    onUpdate({ menuItems: updated }, 2);
    setNewItem({ name: '', category: '', price: '' });
  };

  const handleToggleStar = (id: string) => {
    const updated = menuItems.map(item => 
      item.id === id ? { ...item, isStarItem: !item.isStarItem } : item
    );
    setMenuItems(updated);
    onUpdate({ menuItems: updated });
  };

  const handleRemoveItem = (id: string) => {
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    onUpdate({ menuItems: updated });
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className={cn(
        "p-4 rounded-xl border",
        isValid 
          ? "bg-emerald-500/10 border-emerald-500/30" 
          : "bg-amber-500/10 border-amber-500/30"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="font-medium">{totalItems} items</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{starItems} estrella</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isValid 
            ? '✓ Menú mínimo viable completo' 
            : `Necesitás ${Math.max(0, 12 - totalItems)} items más o ${Math.max(0, 8 - starItems)} estrella más`}
        </p>
      </div>

      {/* Add new item */}
      <div className="p-4 bg-card rounded-xl border border-border space-y-3">
        <p className="text-sm font-medium">Agregar item</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Nombre del item"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Categoría"
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Precio"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
            className="flex-1"
          />
          <Button onClick={handleAddItem} disabled={!newItem.name || !newItem.price}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Items list */}
      <ScrollArea className="h-64">
        <div className="space-y-2 pr-4">
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleStar(item.id)}
                  className={cn(
                    "p-1 rounded transition-colors",
                    item.isStarItem ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                  )}
                >
                  <Star className={cn("w-4 h-4", item.isStarItem && "fill-current")} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {formatCurrency(item.price, countryCode)}
                </Badge>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {menuItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay items aún</p>
              <p className="text-xs">Agregá tu primer item arriba</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
