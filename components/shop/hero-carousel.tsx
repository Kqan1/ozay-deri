"use client";

import Autoplay from "embla-carousel-autoplay";
import {
    ArrowDown,
    ArrowRight,
    ExternalLink,
    Gift,
    Heart,
    Info,
    Mail,
    Percent,
    Phone,
    Play,
    Search,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tag,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";

export interface CarouselSlideData {
    id: string;
    image: string;
    title: string;
    titleColor?: string | null;
    titleSize?: string | null;
    titleWeight?: string | null;
    description?: string | null;
    descColor?: string | null;
    descSize?: string | null;
    descWeight?: string | null;
    buttons?: any; // JSON array of {text, link, variant}
    isActive: boolean;
    order: number;
}

interface HeroCarouselProps {
    slides: CarouselSlideData[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
    const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

    const displaySlides = slides && slides.length > 0 ? slides : [{
        id: "default-slide",
        image: "default",
        title: "Özay Aksesuar'a Hoşgeldiniz",
        titleSize: "text-4xl sm:text-5xl md:text-6xl",
        titleWeight: "font-extrabold",
        titleColor: "currentColor",
        description: "Yönetim panelinden carousel slaytlarınızı eklemeye başlayabilirsiniz.",
        descColor: "currentColor",
        descSize: "text-lg sm:text-xl",
        isActive: true,
        order: 0,
        buttons: [{ text: "Ürünleri İncele", link: "/search", variant: "default", icon: "ShoppingBag" }]
    }];

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
                {displaySlides.map((slide, index) => (
                    <CarouselItem key={slide.id || index}>
                        <div className={`relative w-full rounded-2xl overflow-hidden border h-[400px] sm:h-[500px] flex items-center justify-center text-center px-4 ${slide.image === 'default' ? 'bg-primary/10 border-primary/20 text-foreground' : 'bg-black/90'}`}>
                            {/* Arkaplan Görseli veya Düz Renk */}
                            {slide.image === 'default' ? null : slide.image && slide.image.startsWith('#') ? (
                                <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundColor: slide.image }}></div>
                            ) : slide.image ? (
                                <div className="absolute inset-0 z-0 opacity-70">
                                    <ImageWithSpinner src={slide.image} alt={slide.title} className="object-cover w-full h-full" />
                                </div>
                            ) : null}
                            
                            {/* Degrade Katmanı (Yazı okunaklılığı için, default değilse) */}
                            {slide.image !== 'default' && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-0 pointer-events-none"></div>
                            )}

                            <div className="relative z-10 space-y-6 max-w-3xl px-4">
                                <h1
                                    className={`${slide.titleSize || "text-4xl sm:text-5xl md:text-6xl"} ${slide.titleWeight || "font-extrabold"} tracking-tight drop-shadow-lg`}
                                    style={{ color: slide.titleColor || "#ffffff" }}
                                >
                                    {slide.title}
                                </h1>

                                {slide.description && (
                                    <p
                                        className={`${slide.descSize || "text-lg sm:text-xl"} drop-shadow-md max-w-2xl mx-auto`}
                                        style={{
                                            color: slide.descColor || "#f3f4f6",
                                            fontWeight: slide.descWeight || "normal",
                                        }}
                                    >
                                        {slide.description}
                                    </p>
                                )}

                                {slide.buttons && Array.isArray(slide.buttons) && slide.buttons.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-4 pt-6">
                                        {slide.buttons.map((btn: any, i: number) => {
                                            const iconMap: Record<string, any> = {
                                                ShoppingBag,
                                                ShoppingCart,
                                                ArrowRight,
                                                ArrowDown,
                                                Star,
                                                Tag,
                                                Search,
                                                Phone,
                                                Mail,
                                                Info,
                                                Play,
                                                ExternalLink,
                                                Heart,
                                                Gift,
                                                Percent,
                                            };
                                            const Icon = iconMap[btn.icon] || null;
                                            return (
                                                <Button
                                                    key={i}
                                                    size="lg"
                                                    className="font-semibold text-base px-8 h-12"
                                                    variant={(btn.variant as any) || "default"}
                                                    asChild
                                                >
                                                    <Link href={btn.link || "#"}>
                                                        {Icon && <Icon className="mr-2 h-5 w-5" />}
                                                        {btn.text}
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden sm:block">
                <CarouselPrevious className="left-4 bg-background/50 backdrop-blur-md border-0 hover:bg-background/80 text-foreground" />
                <CarouselNext className="right-4 bg-background/50 backdrop-blur-md border-0 hover:bg-background/80 text-foreground" />
            </div>
        </Carousel>
    );
}
