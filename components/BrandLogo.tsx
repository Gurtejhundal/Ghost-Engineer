import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function BrandLogo({ className = "h-10 w-10", showWordmark = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/ghost-engineer-logo.png"
        alt="Ghost Engineer logo"
        width={96}
        height={96}
        priority={showWordmark}
        className={`${className} shrink-0 object-contain drop-shadow-[0_0_18px_rgba(0,209,178,0.35)]`}
      />
      {showWordmark ? <span className="font-semibold tracking-wide">Ghost Engineer</span> : null}
    </div>
  );
}
