import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className, hover, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        paddingMap[padding],
        hover && 'card-hover',
        className,
      )}
    >
      {children}
    </div>
  );
}
