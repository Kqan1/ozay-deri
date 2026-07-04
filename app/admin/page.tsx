"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
    createCategory, getCategories, 
    createProduct, getProducts, CreateProductInput, 
    updateCategory, deleteCategory,
    updateProduct, deleteProduct
} from "./actions";
import { UploadButton } from "@/utils/uploadthing";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Category Form State
    const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [parentCategoryId, setParentCategoryId] = useState("");
    const [categoryIsHidden, setCategoryIsHidden] = useState(false);
    
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
        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0 && !editProductId) setProductCategoryId(cats[0].id);
        setIsLoading(false);
    }

    // --- CATEGORY HANDLERS ---
    async function handleSaveCategory() {
        if (!categoryName) return;
        if (editCategoryId) {
            await updateCategory(editCategoryId, { 
                name: categoryName, 
                parentId: parentCategoryId || null,
                isHidden: categoryIsHidden
            });
        } else {
            await createCategory({ 
                name: categoryName, 
                parentId: parentCategoryId || null,
                isHidden: categoryIsHidden
            });
        }
        resetCategoryForm();
        await loadData();
    }

    function handleEditCategory(cat: any) {
        setEditCategoryId(cat.id);
        setCategoryName(cat.name);
        setParentCategoryId(cat.parentId || "");
        setCategoryIsHidden(cat.isHidden || false);
    }

    async function handleDeleteCategory(id: string) {
        if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
            const deleteProds = window.confirm(
                "Kategori ile birlikte içindeki ürünleri de silmek ister misiniz?\n\n" +
                "- Tamam: Ürünler TAMAMEN SİLİNECEK.\n" +
                "- İptal: Ürünler SİLİNMEYECEK, (Kategorisiz bölümüne taşınacak)."
            );
            await deleteCategory(id, deleteProds);
            await loadData();
        }
    }

    async function handleToggleCategoryVisibility(cat: any) {
        await updateCategory(cat.id, {
            name: cat.name,
            parentId: cat.parentId,
            isHidden: !cat.isHidden
        });
        await loadData();
    }

    function resetCategoryForm() {
        setEditCategoryId(null);
        setCategoryName("");
        setParentCategoryId("");
        setCategoryIsHidden(false);
    }

    // --- CATEGORY HELPERS ---
    function buildCategoryPath(category: any, allCategories: any[]): string {
        if (!category) return "";
        if (!category.parentId) return category.name;
        const parent = allCategories.find(c => c.id === category.parentId);
        if (parent) {
            return `${buildCategoryPath(parent, allCategories)} > ${category.name}`;
        }
        return category.name;
    }

    // --- PRODUCT HANDLERS ---
    async function handleSaveProduct() {
        if (!productName) return;
        if (editProductId) {
            await updateProduct(editProductId, {
                name: productName,
                categoryId: productCategoryId || null,
                isHidden: productIsHidden,
                fields,
            });
        } else {
            await createProduct({
                name: productName,
                categoryId: productCategoryId || null,
                isHidden: productIsHidden,
                fields,
            });
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
        if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
            await deleteProduct(id);
            await loadData();
        }
    }

    async function handleToggleProductVisibility(prod: any) {
        // Hızlıca state'den de gönderilebilir ama server action yeterli.
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

    function addField(type: "STRING" | "NUMBER_UNIT" | "PHOTO") {
        setFields([...fields, { name: "", type }]);
    }

    function updateField(index: number, key: string, value: any) {
        const newFields = [...fields];
        (newFields[index] as any)[key] = value;
        setFields(newFields);
    }

    const categorizedProducts = products.filter(p => p.categoryId !== null);
    const uncategorizedProducts = products.filter(p => p.categoryId === null);

    if (isLoading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="p-8 space-y-12 text-zinc-900 dark:text-zinc-100">
            <h1 className="text-3xl font-bold">Admin Paneli</h1>

            {/* Kategori Yönetimi */}
            <section className="space-y-4 border border-zinc-200 dark:border-zinc-700 p-6 rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    {editCategoryId ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
                </h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <input 
                        type="text" 
                        placeholder="Kategori Adı" 
                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 flex-1 min-w-[200px]"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                    <select
                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 flex-1 min-w-[200px]"
                        value={parentCategoryId}
                        onChange={(e) => setParentCategoryId(e.target.value)}
                    >
                        <option value="">-- Üst Kategori (Opsiyonel) --</option>
                        {categories.filter(c => c.id !== editCategoryId).map(c => (
                            <option key={c.id} value={c.id}>{buildCategoryPath(c, categories)}</option>
                        ))}
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={categoryIsHidden}
                            onChange={(e) => setCategoryIsHidden(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm">Gizli Mod</span>
                    </label>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={handleSaveCategory} className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded flex-1">
                            {editCategoryId ? "Güncelle" : "Ekle"}
                        </button>
                        {editCategoryId && (
                            <button onClick={resetCategoryForm} className="bg-zinc-500 text-white hover:bg-zinc-600 px-4 py-2 rounded">
                                İptal
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-3">Mevcut Kategoriler:</h3>
                    {categories.length === 0 ? (
                        <p className="text-zinc-500 italic text-sm">Henüz kategori bulunmuyor.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categories.map(c => (
                                <div key={c.id} className={`flex items-center justify-between p-3 rounded border ${c.isHidden ? 'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 opacity-60' : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-700'}`}>
                                    <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate pr-4">
                                        {c.isHidden ? '👁️‍🗨️ (Gizli) ' : ''} 
                                        {buildCategoryPath(c, categories)}
                                    </span>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleToggleCategoryVisibility(c)} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded">
                                            {c.isHidden ? "Göster" : "Gizle"}
                                        </button>
                                        <button onClick={() => handleEditCategory(c)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                            Düzenle
                                        </button>
                                        <button onClick={() => handleDeleteCategory(c.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded">
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Ürün Yönetimi */}
            <section className="space-y-4 border border-zinc-200 dark:border-zinc-700 p-6 rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
                <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    {editProductId ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Kategori Seçin</label>
                        <select 
                            className="w-full border border-zinc-300 dark:border-zinc-600 p-2 rounded block bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                            value={productCategoryId}
                            onChange={(e) => setProductCategoryId(e.target.value)}
                        >
                            <option value="">-- Kategorisiz --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{buildCategoryPath(c, categories)}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Ürün Adı</label>
                        <input 
                            type="text" 
                            placeholder="Ürün Adı" 
                            className="w-full border border-zinc-300 dark:border-zinc-600 p-2 rounded block bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={productIsHidden}
                            onChange={(e) => setProductIsHidden(e.target.checked)}
                            className="w-4 h-4 rounded text-green-600"
                        />
                        <span className="text-sm">Bu Ürünü Gizle</span>
                    </label>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 mt-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <h3 className="font-semibold text-lg">Özel Alanlar (Custom Fields)</h3>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => addField("STRING")} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-3 py-1.5 rounded text-sm font-medium">Metin Ekle</button>
                            <button onClick={() => addField("NUMBER_UNIT")} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-3 py-1.5 rounded text-sm font-medium">Sayı+Birim Ekle</button>
                            <button onClick={() => addField("PHOTO")} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-3 py-1.5 rounded text-sm font-medium">Fotoğraf Ekle</button>
                        </div>
                    </div>

                    {fields.map((f, i) => (
                        <div key={i} className="border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 relative group">
                            <button 
                                onClick={() => setFields(fields.filter((_, idx) => idx !== i))}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Bu alanı kaldır"
                            >
                                ✕
                            </button>
                            <input 
                                type="text" 
                                placeholder="Alan Adı (Örn: Ağırlık, Renk)" 
                                className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 w-full sm:w-1/2"
                                value={f.name}
                                onChange={(e) => updateField(i, "name", e.target.value)}
                            />

                            {f.type === "STRING" && (
                                <input 
                                    type="text" 
                                    placeholder="Metin Değeri" 
                                    className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 w-full"
                                    value={f.stringValue || ""}
                                    onChange={(e) => updateField(i, "stringValue", e.target.value)}
                                />
                            )}

                            {f.type === "NUMBER_UNIT" && (
                                <div className="flex gap-2 w-full sm:w-1/2">
                                    <input 
                                        type="number" 
                                        placeholder="Değer" 
                                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded flex-1 min-w-0 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                                        value={f.numberValue || ""}
                                        onChange={(e) => updateField(i, "numberValue", parseFloat(e.target.value))}
                                    />
                                    <select 
                                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 w-24 shrink-0"
                                        value={f.unit || ""}
                                        onChange={(e) => updateField(i, "unit", e.target.value)}
                                    >
                                        <option value="">Birim Seç</option>
                                        <option value="kg">kg</option>
                                        <option value="gr">gr</option>
                                        <option value="cm">cm</option>
                                        <option value="m">m</option>
                                    </select>
                                </div>
                            )}

                            {f.type === "PHOTO" && (
                                <div className="mt-2">
                                    {f.stringValue ? (
                                        <div className="flex items-center gap-4">
                                            <p className="text-green-600 dark:text-green-400 text-sm font-medium">✅ Fotoğraf yüklendi</p>
                                            <button onClick={() => updateField(i, "stringValue", "")} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                                                Fotoğrafı Değiştir
                                            </button>
                                        </div>
                                    ) : (
                                        <UploadButton
                                            endpoint="productImage"
                                            onClientUploadComplete={(res) => {
                                                if(res && res[0]) {
                                                    updateField(i, "stringValue", res[0].url);
                                                }
                                            }}
                                            onUploadError={(error: Error) => {
                                                alert(`Hata: ${error.message}`);
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-6">
                    <button onClick={handleSaveProduct} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium">
                        {editProductId ? "Ürünü Güncelle" : "Ürünü Kaydet"}
                    </button>
                    {editProductId && (
                        <button onClick={resetProductForm} className="bg-zinc-500 text-white hover:bg-zinc-600 px-4 py-2 rounded">
                            İptal
                        </button>
                    )}
                </div>
            </section>

            {/* Kategorili Ürünler Listesi */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold">Kategorili Ürünler ({categorizedProducts.length})</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {categorizedProducts.map(p => (
                        <div key={p.id} className={`flex flex-col border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg relative ${p.isHidden ? 'bg-zinc-100 dark:bg-zinc-900 opacity-60' : 'bg-white dark:bg-zinc-800'}`}>
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{p.isHidden ? '👁️‍🗨️ ' : ''}{p.name}</h3>
                                    <p className="text-sm text-zinc-500">Kategori: {buildCategoryPath(p.category, categories)}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => handleToggleProductVisibility(p)} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded">
                                        {p.isHidden ? "Göster" : "Gizle"}
                                    </button>
                                    <button onClick={() => handleEditProduct(p)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                        Düzenle
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded">
                                        Sil
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {p.fields.map((f: any) => (
                                    <span key={f.id} className="inline-flex items-center px-2 py-1 bg-zinc-100 dark:bg-zinc-900/50 rounded text-xs border border-zinc-200 dark:border-zinc-700">
                                        <span className="font-semibold mr-1">{f.name}:</span>
                                        {f.type === 'STRING' && f.stringValue}
                                        {f.type === 'NUMBER_UNIT' && `${f.numberValue} ${f.unit}`}
                                        {f.type === 'PHOTO' && <a href={f.stringValue} target="_blank" className="text-blue-500 hover:underline">Fotoğraf</a>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Kategorisiz Ürünler Listesi (ADMİNE ÖZEL) */}
            {uncategorizedProducts.length > 0 && (
                <section className="space-y-4 border-t-2 border-red-500 pt-8 mt-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Kategorisiz Ürünler ({uncategorizedProducts.length})</h2>
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Sadece Admin Görebilir</span>
                    </div>
                    <p className="text-sm text-zinc-500">Bu ürünlerin kategorisi silinmiş veya atanmamış. Kullanıcı tarafında görünmezler.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {uncategorizedProducts.map(p => (
                            <div key={p.id} className="flex flex-col border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg relative">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{p.isHidden ? '👁️‍🗨️ ' : ''}{p.name}</h3>
                                        <p className="text-sm text-red-500 font-medium">Kategorisiz</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleEditProduct(p)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                            Kategori Ata / Düzenle
                                        </button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded">
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
