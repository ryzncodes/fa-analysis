import { cn } from '@/lib/utils';
import { ElementType, ComponentPropsWithoutRef } from 'react';

interface StarBorderProps<T extends ElementType> {
  as?: T;
  color?: string;
  speed?: string;
  className?: string;
  children: React.ReactNode;
}

export function StarBorder<T extends ElementType = 'button'>({
  as,
  className,
  color,
  speed = '6s',
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || 'button';
  const defaultColor = color || 'hsl(var(--foreground))';

  return (
    <Component className={cn('relative inline-block py-[1px] overflow-hidden rounded-full', className)} {...props}>
      <div
        className={cn('absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0', 'opacity-20 dark:opacity-70')}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn('absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0', 'opacity-20 dark:opacity-70')}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          'relative z-1 border text-foreground text-base py-2 px-3 rounded-full',
          'bg-gradient-to-b from-background/75 to-muted/95 border-border/80 backdrop-blur-md',
          'dark:from-background/55 dark:to-muted/35 dark:border-border/70'
        )}
      >
        {children}
      </div>
    </Component>
  );
}
