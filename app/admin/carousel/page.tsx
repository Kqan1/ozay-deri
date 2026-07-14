"use client";

import {
    ArrowDown,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Eye,
    EyeOff,
    Gift,
    Heart,
    Image as ImageIcon,
    Info,
    Loader2,
    Mail,
    Pencil,
    Percent,
    Phone,
    Play,
    Plus,
    Search,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type CarouselSlideData, HeroCarousel } from "@/components/shop/hero-carousel";
import { CustomUploadDropzone } from "@/components/ui/custom-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    createCarouselSlide,
    deleteCarouselSlide,
    deleteUploadThingImage,
    getCarouselSlides,
    updateCarouselSlide,
    updateCarouselSlideOrder,
} from "../actions";

const PRESET_COLORS = [
    "#ffffff",
    "#000000",
    "#f8fafc",
    "#f1f5f9",
    "#e2e8f0",
    "#cbd5e1",
    "#94a3b8",
    "#64748b",
    "#475569",
    "#334155",
    "#1e293b",
    "#0f172a",
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
];

const ICON_OPTIONS = [
    { value: "none", label: "İkonsuz", Icon: null },
    { value: "ShoppingBag", label: "Çanta", Icon: ShoppingBag },
    { value: "ShoppingCart", label: "Sepet", Icon: ShoppingCart },
    { value: "ArrowRight", label: "Sağ Ok", Icon: ArrowRight },
    { value: "ArrowDown", label: "Aşağı Ok", Icon: ArrowDown },
    { value: "Star", label: "Yıldız", Icon: Star },
    { value: "Tag", label: "Etiket", Icon: Tag },
    { value: "Search", label: "Arama", Icon: Search },
    { value: "Phone", label: "Telefon", Icon: Phone },
    { value: "Mail", label: "E-Posta", Icon: Mail },
    { value: "Info", label: "Bilgi", Icon: Info },
    { value: "Play", label: "Oynat", Icon: Play },
    { value: "ExternalLink", label: "Dış Bağlantı", Icon: ExternalLink },
    { value: "Heart", label: "Kalp", Icon: Heart },
    { value: "Gift", label: "Hediye", Icon: Gift },
    { value: "Percent", label: "Yüzde", Icon: Percent },
];

export default function CarouselAdminPage() {
    const [slides, setSlides] = useState<CarouselSlideData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [editSlideId, setEditSlideId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [image, setImage] = useState("default");
    const [title, setTitle] = useState("Özay Aksesuar'a Hoşgeldiniz");
    const [titleColor, setTitleColor] = useState("currentColor");
    const [titleSize, setTitleSize] = useState("text-4xl sm:text-5xl md:text-6xl");
    const [titleWeight, setTitleWeight] = useState("font-extrabold");

    const [description, setDescription] = useState("Yönetim panelinden carousel slaytlarınızı eklemeye başlayabilirsiniz.");
    const [descColor, setDescColor] = useState("currentColor");
    const [descSize, setDescSize] = useState("text-lg sm:text-xl");
    const [descWeight, setDescWeight] = useState("font-normal");

    const [buttons, setButtons] = useState<{ text: string; link: string; variant: string; icon?: string }[]>([
        { text: "Ürünleri İncele", link: "/search", variant: "default", icon: "ShoppingBag" }
    ]);

    const [isActive, setIsActive] = useState(true);
    const [previewSlideId, setPreviewSlideId] = useState<string | null>(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoading = true) {
        if (showLoading) setIsLoading(true);
        const data = await getCarouselSlides();
        setSlides(data as any);
        if (showLoading) setIsLoading(false);
    }

    function resetForm() {
        setEditSlideId(null);
        setImage("default");
        setTitle("Özay Aksesuar'a Hoşgeldiniz");
        setTitleColor("currentColor");
        setTitleSize("text-4xl sm:text-5xl md:text-6xl");
        setTitleWeight("font-extrabold");
        setDescription("Yönetim panelinden carousel slaytlarınızı eklemeye başlayabilirsiniz.");
        setDescColor("currentColor");
        setDescSize("text-lg sm:text-xl");
        setDescWeight("font-normal");
        setButtons([{ text: "Ürünleri İncele", link: "/search", variant: "default", icon: "ShoppingBag" }]);
        setIsActive(true);
    }

    function handleEditSlide(slide: CarouselSlideData) {
        setEditSlideId(slide.id);
        setImage(slide.image);
        setTitle(slide.title);
        setTitleColor(slide.titleColor || "#ffffff");
        setTitleSize(slide.titleSize || "text-4xl sm:text-5xl md:text-6xl");
        setTitleWeight(slide.titleWeight || "font-extrabold");
        setDescription(slide.description || "");
        setDescColor(slide.descColor || "#f3f4f6");
        setDescSize(slide.descSize || "text-lg sm:text-xl");
        setDescWeight(slide.descWeight || "font-normal");

        let parsedButtons = [];
        if (slide.buttons) {
            try {
                parsedButtons = Array.isArray(slide.buttons) ? slide.buttons : JSON.parse(slide.buttons as any);
            } catch (_e) {
                parsedButtons = [];
            }
        }
        setButtons(parsedButtons);
        setIsActive(slide.isActive);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!title || isSubmitting) {
            toast.error("Lütfen başlık alanını doldurun.");
            return;
        }

        setIsSubmitting(true);
        const data = {
            image,
            title,
            titleColor,
            titleSize,
            titleWeight,
            description: description || null,
            descColor,
            descSize,
            descWeight,
            buttons: buttons.length > 0 ? buttons : [],
            isActive,
        };

        try {
            if (editSlideId) {
                await updateCarouselSlide(editSlideId, data);
                toast.success("Slayt güncellendi.");
            } else {
                await createCarouselSlide(data);
                toast.success("Yeni slayt eklendi.");
            }
            resetForm();
            await loadData(false);
        } catch (_error) {
            toast.error("Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        toast("Emin misiniz?", {
            description: "Bu slayt kalıcı olarak silinecektir.",
            action: {
                label: "Evet, Sil",
                onClick: async () => {
                    setDeletingId(id);
                    try {
                        await deleteCarouselSlide(id);
                        toast.success("Slayt silindi.");
                        if (editSlideId === id) resetForm();
                        await loadData(false); // Re-fetch to sync
                    } catch (_error) {
                        toast.error("Silme işlemi başarısız oldu.");
                    } finally {
                        setDeletingId(null);
                    }
                },
            },
            cancel: { label: "İptal", onClick: () => {} },
        });
    }

    async function handleToggleActive(slide: CarouselSlideData) {
        setTogglingId(slide.id);
        try {
            await updateCarouselSlide(slide.id, {
                image: slide.image,
                title: slide.title,
                isActive: !slide.isActive,
            });
            // Re-fetch quietly to sync
            await loadData(false);
        } catch (_error) {
            toast.error("Durum güncellenirken hata oluştu.");
        } finally {
            setTogglingId(null);
        }
    }

    async function handleRemoveImage() {
        if (image && image !== "default" && !image.startsWith('#')) {
            await deleteUploadThingImage(image);
        }
        setImage("default");
    }

    // Move slide up or down
    async function moveSlide(index: number, direction: "up" | "down") {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === slides.length - 1) return;

        const newSlides = [...slides];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        // Swap elements
        const temp = newSlides[index];
        newSlides[index] = newSlides[targetIndex];
        newSlides[targetIndex] = temp;

        // Update orders to match array index
        const updates = newSlides.map((s, i) => ({ id: s.id, order: i }));
        const originalSlides = [...slides];
        setSlides(newSlides); // optimistic update

        try {
            await updateCarouselSlideOrder(updates);
        } catch (_error) {
            setSlides(originalSlides);
            toast.error("Sıralama güncellenirken hata oluştu.");
        }
    }

    const addButton = () => {
        setButtons([...buttons, { text: "", link: "", variant: "default", icon: "ShoppingBag" }]);
    };

    const updateButton = (index: number, field: string, value: string) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], [field]: value };
        setButtons(newButtons);
    };

    const removeButton = (index: number) => {
        setButtons(buttons.filter((_, i) => i !== index));
    };

    const previewSlide: CarouselSlideData = {
        id: "preview",
        image: image || "default",
        title: title || "Örnek Başlık",
        titleColor,
        titleSize,
        titleWeight,
        description: description || "Örnek açıklama metni burada görünecek.",
        descColor,
        descSize,
        descWeight,
        buttons:
            buttons.length > 0
                ? buttons
                : [{ text: "Örnek Buton", link: "#", variant: "default", icon: "ShoppingBag" }],
        isActive: true,
        order: 0,
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-primary" /> Carousel Yönetimi
                    </h1>
                    <p className="text-muted-foreground mt-1">Ana sayfadaki kayan görsel (banner) alanını yönetin.</p>
                </div>
                {editSlideId && (
                    <button
                        onClick={resetForm}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Yeni Ekle
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Form Paneli */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="border rounded-lg p-6 bg-card shadow-sm">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-2">
                            {editSlideId ? "Slayt Düzenle" : "Yeni Slayt"}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Görsel */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Arkaplan Görseli VEYA Düz Renk (İsteğe Bağlı)</label>
                                {image && image !== "default" ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border group">
                                        {image.startsWith('#') ? (
                                            <div className="w-full h-full" style={{ backgroundColor: image }}></div>
                                        ) : (
                                            <ImageWithSpinner src={image} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 transition-opacity flex items-center justify-center sm:bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-medium"
                                            >
                                                Kaldır
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <CustomUploadDropzone
                                            onUploadBegin={() => setIsUploading(true)}
                                            onUploadComplete={(urls) => {
                                                setIsUploading(false);
                                                if (urls.length > 0) setImage(urls[0]);
                                            }}
                                        />
                                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                                            <span className="text-sm font-medium text-muted-foreground">veya Düz Renk Kullan:</span>
                                            <input 
                                                type="color" 
                                                value="#000000" 
                                                onChange={(e) => setImage(e.target.value)} 
                                                className="h-8 w-16 cursor-pointer border-0 p-0 rounded-md overflow-hidden" 
                                                title="Renk Seç"
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Not: Boş bırakırsanız sistem temasındaki kart görünümü varsayılan arkaplan olacaktır.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Başlık (Zorunlu)</label>
                                    <input
                                        type="text"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Slayt Başlığı"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium flex items-center justify-between">
                                        Başlık Rengi
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-12 rounded-md border cursor-pointer p-1"
                                                value={titleColor}
                                                onChange={(e) => setTitleColor(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                                value={titleColor}
                                                onChange={(e) => setTitleColor(e.target.value)}
                                            />
                                        </div>
                                        {/* Hazır Renkler */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {PRESET_COLORS.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setTitleColor(c)}
                                                    className="w-5 h-5 rounded-full border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Başlık Kalınlığı</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={titleWeight}
                                        onChange={(e) => setTitleWeight(e.target.value)}
                                    >
                                        <option value="font-normal">Normal</option>
                                        <option value="font-medium">Orta (Medium)</option>
                                        <option value="font-semibold">Kalınça (Semibold)</option>
                                        <option value="font-bold">Kalın (Bold)</option>
                                        <option value="font-extrabold">Ekstra Kalın</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Başlık Boyutu</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={titleSize}
                                        onChange={(e) => setTitleSize(e.target.value)}
                                    >
                                        <option value="text-xl sm:text-2xl md:text-3xl">sm (Küçük)</option>
                                        <option value="text-2xl sm:text-3xl md:text-4xl">base (Normal)</option>
                                        <option value="text-3xl sm:text-4xl md:text-5xl">lg (Büyük)</option>
                                        <option value="text-4xl sm:text-5xl md:text-6xl">xl (Çok Büyük)</option>
                                        <option value="text-5xl sm:text-6xl md:text-7xl">2xl</option>
                                        <option value="text-6xl sm:text-7xl md:text-8xl">3xl</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Açıklama</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Alt metin..."
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Açıklama Rengi</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-12 rounded-md border cursor-pointer p-1"
                                                value={descColor}
                                                onChange={(e) => setDescColor(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                                value={descColor}
                                                onChange={(e) => setDescColor(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {PRESET_COLORS.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setDescColor(c)}
                                                    className="w-5 h-5 rounded-full border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Açıklama Boyutu</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={descSize}
                                        onChange={(e) => setDescSize(e.target.value)}
                                    >
                                        <option value="text-xs sm:text-sm">sm (Küçük)</option>
                                        <option value="text-sm sm:text-base">base (Normal)</option>
                                        <option value="text-base sm:text-lg">lg (Büyük)</option>
                                        <option value="text-lg sm:text-xl">xl (Çok Büyük)</option>
                                        <option value="text-xl sm:text-2xl">2xl</option>
                                        <option value="text-2xl sm:text-3xl">3xl</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Slayt Butonları</label>
                                    <button
                                        type="button"
                                        onClick={addButton}
                                        className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Buton Ekle
                                    </button>
                                </div>

                                {buttons.map((btn, index) => (
                                    <div key={index} className="space-y-3 p-3 border rounded-md bg-muted/30 relative">
                                        <button
                                            type="button"
                                            onClick={() => removeButton(index)}
                                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="space-y-1.5 pr-6">
                                            <label className="text-xs text-muted-foreground">Buton Metni</label>
                                            <input
                                                type="text"
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                value={btn.text}
                                                onChange={(e) => updateButton(index, "text", e.target.value)}
                                                placeholder="Örn: Alışverişe Başla"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-muted-foreground">Buton Linki</label>
                                            <input
                                                type="text"
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                value={btn.link}
                                                onChange={(e) => updateButton(index, "link", e.target.value)}
                                                placeholder="Örn: /search?q=canta"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                * Site içi linkler için <b>/kategori-adi</b>, dış siteler için{" "}
                                                <b>https://...</b> kullanın. <br />* Arama sayfasına gitmesi için{" "}
                                                <b>/search?q=aranacak-kelime</b> kullanın.
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-muted-foreground">Buton Stili</label>
                                            <select
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                value={btn.variant}
                                                onChange={(e) => updateButton(index, "variant", e.target.value)}
                                            >
                                                <option value="default">Varsayılan (Ana Renk)</option>
                                                <option value="secondary">İkincil (Açık Renk)</option>
                                                <option value="outline">Dış Çizgili (Saydam)</option>
                                                <option value="destructive">Kırmızı</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-muted-foreground">İkon Seçimi</label>
                                            <Select
                                                value={btn.icon || "ShoppingBag"}
                                                onValueChange={(val) => updateButton(index, "icon", val)}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="İkon seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ICON_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            <div className="flex items-center gap-2">
                                                                {opt.Icon && <opt.Icon className="w-4 h-4" />}
                                                                <span>{opt.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 shrink-0 rounded-sm border border-primary text-primary"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium leading-none">
                                    Slayt Aktif (Kullanıcılara Göster)
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading || isSubmitting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
                            >
                                {isSubmitting
                                    ? "Kaydediliyor..."
                                    : editSlideId
                                      ? "Değişiklikleri Kaydet"
                                      : "Slayt Ekle"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sağ Panel: Önizleme ve Liste */}
                <div className="xl:col-span-8 space-y-6 min-w-0">
                    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-muted/30">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Eye className="w-4 h-4 text-muted-foreground" /> Canlı Önizleme
                            </h3>
                        </div>
                        <div className="p-4 bg-muted/10">
                            {/* Yalnızca şu an formda olan slaytı göstererek anında önizleme sunuyoruz */}
                            <HeroCarousel slides={[previewSlide]} />
                        </div>
                    </div>

                    <div className="border rounded-lg bg-card shadow-sm">
                        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                            <h3 className="font-semibold">Mevcut Slaytlar ({slides.length})</h3>
                        </div>
                        {slides.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Kayıtlı slayt bulunmuyor.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {slides.map((slide, index) => (
                                    <div
                                        key={slide.id}
                                        className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${!slide.isActive ? "opacity-60 bg-muted/20" : ""} ${editSlideId === slide.id ? "bg-accent/30" : ""}`}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => moveSlide(index, "up")}
                                                disabled={index === 0}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                                title="Yukarı Taşı"
                                            >
                                                <ChevronUp className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => moveSlide(index, "down")}
                                                disabled={index === slides.length - 1}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                                title="Aşağı Taşı"
                                            >
                                                <ChevronDown className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div
                                            className="w-24 h-16 shrink-0 rounded overflow-hidden bg-muted border cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setPreviewSlideId(slide.id)}
                                            title="Slaytı Önizle"
                                        >
                                            <ImageWithSpinner
                                                src={slide.image}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-foreground truncate">{slide.title}</h4>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {slide.description || "Açıklama yok"}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                                            <button
                                                onClick={() => handleToggleActive(slide)}
                                                disabled={togglingId === slide.id}
                                                className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2 gap-1.5 min-w-[85px] disabled:opacity-50"
                                                title={slide.isActive ? "Gizle" : "Göster"}
                                            >
                                                {togglingId === slide.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : slide.isActive ? (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5" /> Görünür
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> Gizli
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleEditSlide(slide)}
                                                className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 gap-1.5"
                                            >
                                                <Pencil className="w-3.5 h-3.5" /> Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slide.id)}
                                                disabled={deletingId === slide.id}
                                                className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 h-8 px-3 gap-1.5 disabled:opacity-50"
                                            >
                                                {deletingId === slide.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={!!previewSlideId} onOpenChange={(open) => !open && setPreviewSlideId(null)}>
                <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden border-0 bg-transparent h-[400px] sm:h-[500px]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Slayt Önizleme</DialogTitle>
                    </DialogHeader>
                    {(() => {
                        const slide = slides.find((s) => s.id === previewSlideId);
                        if (!slide) return null;
                        return (
                            <div className="w-full h-full relative">
                                <HeroCarousel slides={[slide]} />
                                <button
                                    onClick={() => setPreviewSlideId(null)}
                                    className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
