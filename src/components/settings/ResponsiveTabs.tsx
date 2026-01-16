import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
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
    return (
      <div className={cn("space-y-4", className)}>
        {/* Mobile: Select dropdown */}
        <Select value={currentValue} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full h-11 text-base font-medium">
            <SelectValue>{currentLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
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

  // Desktop: Horizontal tabs
  return (
    <Tabs
      defaultValue={defaultValue}
      value={currentValue}
      onValueChange={handleValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
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
