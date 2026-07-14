"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function SafeImage({ src, alt, unoptimized, onError, ...props }: ImageProps) {
    const [failed, setFailed] = useState(false);

    return (
        <Image
            src={src}
            alt={alt}
            unoptimized={unoptimized || failed}
            onError={(e) => {
                if (!failed) setFailed(true);
                if (onError) onError(e);
            }}
            {...props}
        />
    );
}
