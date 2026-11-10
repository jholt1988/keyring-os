import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: any;
  className?: string;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-[14px] border border-white/10 bg-[#13233C]/95 text-[#F8FAFC]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return <div className={cn('flex flex-col gap-1.5 p-5 pb-3', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: any; className?: string }) {
  return <h3 className={cn('font-semibold text-lg text-[#F8FAFC]', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement> & { children?: any; className?: string }) {
  return <p className={cn('text-sm text-[#94A3B8]', className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }: CardProps) {
  return <div className={cn('p-5 pt-0', className)} {...props}>{children}</div>;
}