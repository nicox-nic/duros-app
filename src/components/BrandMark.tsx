import Image from 'next/image';
import { BRAND_ALT, LOGO_HEADER, LOGO_HEADER_HEIGHT, LOGO_HEADER_WIDTH, PRODUCT_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function BrandMark({ size = 'md', showText = true, className }: BrandMarkProps) {
  const sizeMap = {
    sm: { logo: 'h-[28px] w-auto', subtitle: 'text-[10px] mt-1' },
    md: { logo: 'h-[47px] w-auto', subtitle: 'text-[10px] mt-1' },
    lg: { logo: 'h-[44px] w-auto', subtitle: 'text-[10px] mt-1' },
    xl: { logo: 'h-[56px] w-auto', subtitle: 'text-[20px] mt-2' },
  };
  const { logo, subtitle } = sizeMap[size];

  return (
    <div className={cn('flex w-full flex-col items-start leading-none', className)}>
      <Image
        src={LOGO_HEADER}
        alt={BRAND_ALT}
        width={LOGO_HEADER_WIDTH}
        height={LOGO_HEADER_HEIGHT}
        className={cn('object-contain object-left', logo)}
      />
      {showText && (
        <span className={cn('w-full text-champagne-deep tracking-[0.06em] font-medium text-center', subtitle)}>
          {PRODUCT_NAME}
        </span>
      )}
    </div>
  );
}
