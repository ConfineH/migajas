import { HomeBackgroundBlobs } from "@/components/home/HomeBackgroundBlobs";

interface AppPageLayoutProps {
  children: React.ReactNode;
  /** Content width: `narrow` (forms/lists) or `wide` (marketing-style) */
  width?: "narrow" | "wide";
  className?: string;
}

const widthClass = {
  narrow: "max-w-3xl",
  wide: "max-w-5xl",
};

export function AppPageLayout({
  children,
  width = "narrow",
  className = "",
}: AppPageLayoutProps) {
  return (
    <>
      <HomeBackgroundBlobs />
      <div
        className={`relative mx-auto w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 ${widthClass[width]} ${className}`}
      >
        {children}
      </div>
    </>
  );
}
