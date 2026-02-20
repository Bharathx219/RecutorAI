import { forwardRef, type ImgHTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import "./image.css";

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/640x480?text=Image";

type ImageCompatProps = {
  fittingType?: "fill" | "fit";
  originWidth?: number;
  originHeight?: number;
  focalPointX?: number;
  focalPointY?: number;
};

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & ImageCompatProps;

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, fittingType = "fill", className, onError, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);

    useEffect(() => {
      setImgSrc(src);
    }, [src]);

    if (!src) {
      return <div data-empty-image className={className} />;
    }

    return (
      <img
        ref={ref}
        src={imgSrc}
        className={cn("w-full h-full", fittingType === "fit" ? "object-contain" : "object-cover", className)}
        onError={(e) => {
          if (imgSrc !== FALLBACK_IMAGE_URL) {
            setImgSrc(FALLBACK_IMAGE_URL);
          }
          onError?.(e);
        }}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";
