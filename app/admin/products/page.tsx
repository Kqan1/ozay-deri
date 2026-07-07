"use client";

import { useState, useEffect } from "react";
import { 
    getCategories, 
    createProduct, getProducts, CreateProductInput, 
    updateProduct, deleteProduct,
    getFieldDefinitions
} from "../actions";
import { UploadButton } from "@/utils/uploadthing";
import Link from "next/link";
import Loading from "./loading";
import { Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductsAdminPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [fieldDefinitions, setFieldDefinitions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Product Form State
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [productName, setProductName] = useState("");
    const [productCategoryId, setProductCategoryId] = useState("");
    const [productIsHidden, setProductIsHidden] = useState(false);
    const [fields, setFields] = useState<CreateProductInput["fields"]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        const cats = await getCategories();
        const prods = await getProducts();
        const fdefs = await getFieldDefinitions();
        setCategories(cats);
        setProducts(prods);
        setFieldDefinitions(fdefs);
        if (cats.length > 0 && !editProductId) setProductCategoryId(cats[0].id);
        setIsLoading(false);
    }

    if (isLoading) return <Loading />;

    function buildCategoryPath(category: any, allCategories: any[]): string {
        if (!category) return "";
        if (!category.parentId) return category.name;
        const parent = allCategories.find(c => c.id === category.parentId);
        if (parent) {
            return `${buildCategoryPath(parent, allCategories)} > ${category.name}`;
        }
        return category.name;
    }

    async function handleSaveProduct(e?: React.FormEvent, ignoreWarning: boolean = false) {
        if (e) e.preventDefault();
        if (!productName) return;

        const applicableFieldDefs = fieldDefinitions.filter(
            (fd) => fd.isGlobal || fd.categoryId === productCategoryId
        );
        const applicableNames = applicableFieldDefs.map(fd => fd.name);

        const legacyFields = fields.filter(f => !applicableNames.includes(f.name));
        
        if (!ignoreWarning && legacyFields.length > 0 && editProductId) {
            toast.custom((t) => (
                <div className="bg-card border p-4 rounded-lg shadow-lg w-[350px] space-y-3">
                    <h3 className="font-semibold text-foreground text-destructive">Dikkat</h3>
                    <p className="text-sm text-muted-foreground">
                        Bu ürün için bazı özel alanlar artık bu kategoride tanımlı değil:<br/>
                        <strong className="text-foreground">{legacyFields.map(f => f.name).join(", ")}</strong><br/><br/>
                        Devam ederseniz bu eski alanlar kalıcı olarak silinecek.
                    </p>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => { toast.dismiss(t); handleSaveProduct(undefined, true); }} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">Evet, Eski Alanları Sil ve Kaydet</button>
                        <button onClick={() => toast.dismiss(t)} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">İptal, Kaydetme</button>
                    </div>
                </div>
            ), { duration: Infinity });
            return;
        }

        const fieldsToSave = applicableFieldDefs.map(fd => {
            const existing = fields.find(f => f.name === fd.name);
            return {
                name: fd.name,
                type: fd.type,
                stringValue: existing?.stringValue || "",
                numberValue: existing?.numberValue || null,
                unit: existing?.unit || ""
            };
        }).filter(f => {
            if (f.type === 'STRING' || f.type === 'PHOTO') return !!f.stringValue;
            if (f.type === 'NUMBER_UNIT') return f.numberValue !== null && !isNaN(f.numberValue);
            return false;
        });

        if (editProductId) {
            await updateProduct(editProductId, {
                name: productName,
                categoryId: productCategoryId || null,
                isHidden: productIsHidden,
                fields: fieldsToSave,
            });
            toast.success("Ürün başarıyla güncellendi.");
        } else {
            await createProduct({
                name: productName,
                categoryId: productCategoryId || null,
                isHidden: productIsHidden,
                fields: fieldsToSave,
            });
            toast.success("Yeni ürün eklendi.");
        }
        resetProductForm();
        await loadData();
    }

    function handleEditProduct(prod: any) {
        setEditProductId(prod.id);
        setProductName(prod.name);
        setProductCategoryId(prod.categoryId || "");
        setProductIsHidden(prod.isHidden || false);
        setFields(prod.fields.map((f: any) => ({
            name: f.name,
            type: f.type,
            stringValue: f.stringValue,
            numberValue: f.numberValue,
            unit: f.unit
        })));
    }

    async function handleDeleteProduct(id: string) {
        toast("Emin misiniz?", {
            description: "Bu ürünü kalıcı olarak silmek üzeresiniz.",
            action: {
                label: "Evet, Sil",
                onClick: async () => {
                    await deleteProduct(id);
                    toast.success("Ürün silindi.");
                    await loadData();
                }
            },
            cancel: { label: "İptal", onClick: () => {} }
        });
    }

    async function handleToggleProductVisibility(prod: any) {
        await updateProduct(prod.id, {
            name: prod.name,
            categoryId: prod.categoryId,
            isHidden: !prod.isHidden,
            fields: prod.fields.map((f: any) => ({
                name: f.name,
                type: f.type,
                stringValue: f.stringValue,
                numberValue: f.numberValue,
                unit: f.unit
            }))
        });
        await loadData();
    }

    function resetProductForm() {
        setEditProductId(null);
        setProductName("");
        setFields([]);
        setProductIsHidden(false);
        if (categories.length > 0) setProductCategoryId(categories[0].id);
    }

    function updateFieldByName(name: string, type: string, key: string, value: any) {
        const newFields = [...fields];
        const existingIndex = newFields.findIndex(f => f.name === name);
        if (existingIndex >= 0) {
            (newFields[existingIndex] as any)[key] = value;
        } else {
            const newField: any = { name, type };
            newField[key] = value;
            newFields.push(newField);
        }
        setFields(newFields);
    }

    const categorizedProducts = products.filter(p => p.categoryId !== null);
    const uncategorizedProducts = products.filter(p => p.categoryId === null);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" /> Ürünler
                    </h1>
                    <p className="text-muted-foreground mt-1">Sitenizdeki ürün kataloğunu yönetin.</p>
                </div>
                <Link href="/admin/fields" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 shrink-0">
                    Özel Alanları (Fields) Yönet
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Sol Taraf: Form */}
                <div className="xl:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b">
                        {editProductId ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
                    </h2>
                    
                    <form onSubmit={handleSaveProduct} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Ürün Adı</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Örn: Siyah Deri Ceket" 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Kategori Seçin</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={productCategoryId}
                                    onChange={(e) => setProductCategoryId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Kategori Seçin --</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{buildCategoryPath(c, categories)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="productIsHidden"
                                    checked={productIsHidden}
                                    onChange={(e) => setProductIsHidden(e.target.checked)}
                                    className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <label htmlFor="productIsHidden" className="text-sm font-medium leading-none">
                                    Gizli Mod (Ürünü Kullanıcılardan Gizle)
                                </label>
                            </div>
                        </div>

                        {productCategoryId && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Kategori Özellikleri</h3>
                                
                                {fieldDefinitions.filter((fd) => fd.isGlobal || fd.categoryId === productCategoryId).length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">Bu kategori için tanımlı alan yok.</p>
                                ) : fieldDefinitions.filter((fd) => fd.isGlobal || fd.categoryId === productCategoryId).map((fd, i) => {
                                    const currentVal = fields.find(f => f.name === fd.name) || { name: fd.name, type: fd.type, stringValue: "", numberValue: null, unit: "" };
                                    
                                    return (
                                        <div key={i} className="space-y-2 p-3 border rounded bg-muted/20">
                                            <label className="text-sm font-medium flex items-center justify-between">
                                                {fd.name}
                                                <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">{fd.type === 'STRING' ? 'Metin' : fd.type === 'NUMBER_UNIT' ? 'Sayı+Birim' : 'Fotoğraf'}</span>
                                            </label>

                                            {fd.type === "STRING" && (
                                                <input 
                                                    type="text" 
                                                    placeholder={`${fd.name} değeri...`}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                                                    value={currentVal.stringValue || ""}
                                                    onChange={(e) => updateFieldByName(fd.name, fd.type, "stringValue", e.target.value)}
                                                />
                                            )}

                                            {fd.type === "NUMBER_UNIT" && (
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Değer" 
                                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                                                        value={currentVal.numberValue === null || currentVal.numberValue === undefined ? "" : currentVal.numberValue}
                                                        onChange={(e) => updateFieldByName(fd.name, fd.type, "numberValue", parseFloat(e.target.value))}
                                                    />
                                                    <select 
                                                        className="flex h-9 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                                                        value={currentVal.unit || ""}
                                                        onChange={(e) => updateFieldByName(fd.name, fd.type, "unit", e.target.value)}
                                                    >
                                                        <option value="">Birim</option>
                                                        <option value="kg">kg</option>
                                                        <option value="gr">gr</option>
                                                        <option value="cm">cm</option>
                                                        <option value="m">m</option>
                                                    </select>
                                                </div>
                                            )}

                                            {fd.type === "PHOTO" && (
                                                <div className="mt-1">
                                                    {currentVal.stringValue ? (
                                                        <div className="flex items-center justify-between border rounded p-2 bg-background">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 relative rounded overflow-hidden bg-muted">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={currentVal.stringValue} alt="Preview" className="object-cover w-full h-full" />
                                                                </div>
                                                                <span className="text-xs text-green-600 font-medium">Yüklendi</span>
                                                            </div>
                                                            <button type="button" onClick={() => updateFieldByName(fd.name, fd.type, "stringValue", "")} className="text-xs text-destructive hover:underline px-2 py-1">
                                                                Kaldır
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="border border-dashed rounded-lg p-4 flex justify-center bg-background">
                                                            <UploadButton
                                                                endpoint="productImage"
                                                                onClientUploadComplete={(res) => {
                                                                    if(res && res[0]) {
                                                                        updateFieldByName(fd.name, fd.type, "stringValue", res[0].url);
                                                                    }
                                                                }}
                                                                onUploadError={(error: Error) => {
                                                                    toast.error(`Hata: ${error.message}`);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                {editProductId ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
                            </button>
                            {editProductId && (
                                <button type="button" onClick={resetProductForm} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                    İptal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Sağ Taraf: Ürünler Listesi */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                            <h3 className="font-semibold">Aktif Ürünler ({categorizedProducts.length})</h3>
                        </div>
                        
                        <div className="divide-y divide-border">
                            {categorizedProducts.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">Kayıtlı ürün bulunmuyor.</div>
                            ) : categorizedProducts.map(p => (
                                <div key={p.id} className={`p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-muted/50 transition-colors ${p.isHidden ? 'opacity-70 bg-muted/20' : ''}`}>
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-foreground truncate">{p.name}</h4>
                                            {p.isHidden && (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold border-transparent bg-secondary text-secondary-foreground">
                                                    Gizli
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            Kategori: {buildCategoryPath(p.category, categories)}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {p.fields.slice(0, 3).map((f: any) => (
                                                <span key={f.id} className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium bg-background text-muted-foreground">
                                                    <span className="font-semibold mr-1">{f.name}:</span>
                                                    {f.type === 'STRING' && f.stringValue}
                                                    {f.type === 'NUMBER_UNIT' && `${f.numberValue} ${f.unit}`}
                                                    {f.type === 'PHOTO' && 'Fotoğraf var'}
                                                </span>
                                            ))}
                                            {p.fields.length > 3 && (
                                                <span className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium bg-background text-muted-foreground">
                                                    +{p.fields.length - 3} daha
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                                        <button onClick={() => handleToggleProductVisibility(p)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                                            {p.isHidden ? "Göster" : "Gizle"}
                                        </button>
                                        <button onClick={() => handleEditProduct(p)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3">
                                            Düzenle
                                        </button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3">
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kategorisiz Ürünler (Admin Uyarı) */}
                    {uncategorizedProducts.length > 0 && (
                        <div className="border border-destructive/50 rounded-lg overflow-hidden bg-destructive/5 shadow-sm">
                            <div className="p-4 border-b border-destructive/20 bg-destructive/10 flex flex-wrap gap-2 justify-between items-center">
                                <h3 className="font-semibold text-destructive flex items-center gap-2">
                                    ⚠️ Kategorisi Silinmiş Ürünler ({uncategorizedProducts.length})
                                </h3>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-destructive text-destructive-foreground">
                                    Sadece Admin Görebilir
                                </span>
                            </div>
                            
                            <div className="divide-y divide-destructive/20">
                                {uncategorizedProducts.map(p => (
                                    <div key={p.id} className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <h4 className="font-semibold text-foreground">{p.name}</h4>
                                            <p className="text-xs text-destructive/80 font-medium">
                                                Lütfen düzenleyerek bir kategori atayın. Aksi halde ürün sitede görüntülenemez.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => handleEditProduct(p)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3">
                                                Düzenle / Kategori Ata
                                            </button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3">
                                                Kalıcı Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
