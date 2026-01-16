import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface ResponsiveTabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  items: TabItem[];
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTabs({
  defaultValue,
  value,
  onValueChange,
  items,
  children,
  className,
}: ResponsiveTabsProps) {
  const isMobile = useIsMobile();
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || items[0]?.value);

  const currentValue = value || selectedValue;
  const currentLabel = items.find(item => item.value === currentValue)?.label || items[0]?.label;

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  };

  if (isMobile) {
    const currentItem = items.find(item => item.value === currentValue);
    const CurrentIcon = currentItem?.icon;
    
    return (
      <div className={cn("space-y-4", className)}>
        {/* Mobile: Select dropdown */}
        <Select value={currentValue} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full h-12 text-base font-medium border-2">
            <div className="flex items-center gap-2">
              {CurrentIcon && <CurrentIcon className="w-5 h-5 text-success" />}
              <SelectValue>{currentLabel}</SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <SelectItem key={item.value} value={item.value}>
                  <div className="flex items-center gap-2">
                    {ItemIcon && <ItemIcon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Content */}
        <div className="mt-4">
          {React.Children.map(children, (child: any) => {
            // Support both ResponsiveTabsContent and TabsContent
            const tabValue = child?.props?.value || child?.props?.['data-tab-value'];
            if (tabValue === currentValue) {
              return <div key={tabValue}>{child}</div>;
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // Desktop: Horizontal tabs with professional design
  return (
    <Tabs
      defaultValue={defaultValue}
      value={currentValue}
      onValueChange={handleValueChange}
      className={cn("w-full", className)}
    >
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = currentValue === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleValueChange(item.value)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200",
                  "min-w-fit whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2",
                  isActive
                    ? "text-success border-b-2 border-success bg-success/5 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent"
                )}
              >
                {ItemIcon && (
                  <ItemIcon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-success" : "text-muted-foreground"
                  )} />
                )}
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <span 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-success rounded-t-sm"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {children}
    </Tabs>
  );
}

// Wrapper pour TabsContent compatible avec ResponsiveTabs
export function ResponsiveTabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <div data-tab-value={value} className={className}>{children}</div>;
  }
  
  return <TabsContent value={value} className={className}>{children}</TabsContent>;
}
