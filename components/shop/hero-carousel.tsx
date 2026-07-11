"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

interface Slide {
    title: string;
    description: string;
    link: string;
    cta: string;
}

interface HeroCarouselProps {
    slides: Slide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
    const plugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {slides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className="relative w-full rounded-2xl overflow-hidden bg-muted border h-[400px] flex items-center justify-center text-center px-4">
                            <div className="relative z-10 space-y-6 max-w-2xl">
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                                    {slide.title}
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    {slide.description}
                                </p>
                                <div className="flex justify-center pt-4">
                                    <Button size="lg" className="font-semibold" asChild>
                                        <Link href={slide.link}>
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            {slide.cta}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden sm:block">
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </div>
        </Carousel>
    );
}
