"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
    createCategory, getCategories, 
    createProduct, getProducts, CreateProductInput, 
    updateCategory, deleteCategory,
    updateProduct, deleteProduct,
    getFieldDefinitions
} from "./actions";
import { UploadButton } from "@/utils/uploadthing";
import Link from "next/link";

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
    const [fieldDefinitions, setFieldDefinitions] = useState<any[]>([]);

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

        const applicableFieldDefs = fieldDefinitions.filter(
            (fd) => fd.isGlobal || fd.categoryId === productCategoryId
        );
        const applicableNames = applicableFieldDefs.map(fd => fd.name);

        const legacyFields = fields.filter(f => !applicableNames.includes(f.name));
        
        if (legacyFields.length > 0 && editProductId) {
            const proceed = window.confirm(`Bu ürün için bazı özel alanlar (Custom Fields) artık bu kategoride tanımlı değil: ${legacyFields.map(f => f.name).join(", ")}. Devam ederseniz bu eski alanlar silinecek. Onaylıyor musunuz?`);
            if (!proceed) return;
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
        } else {
            await createProduct({
                name: productName,
                categoryId: productCategoryId || null,
                isHidden: productIsHidden,
                fields: fieldsToSave,
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
                        <Link href="/admin/fields" className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded font-medium">
                            Alanları Yönet (Yeni Ekle / Düzenle)
                        </Link>
                    </div>

                    {fieldDefinitions.filter((fd) => fd.isGlobal || fd.categoryId === productCategoryId).map((fd, i) => {
                        const currentVal = fields.find(f => f.name === fd.name) || { name: fd.name, type: fd.type, stringValue: "", numberValue: null, unit: "" };
                        return (
                        <div key={i} className="border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 relative group">
                            <h4 className="font-medium">{fd.name} <span className="text-xs text-zinc-500 font-normal ml-2">({fd.type === 'STRING' ? 'Metin' : fd.type === 'NUMBER_UNIT' ? 'Sayı+Birim' : 'Fotoğraf'})</span></h4>

                            {fd.type === "STRING" && (
                                <input 
                                    type="text" 
                                    placeholder="Metin Değeri" 
                                    className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 w-full"
                                    value={currentVal.stringValue || ""}
                                    onChange={(e) => updateFieldByName(fd.name, fd.type, "stringValue", e.target.value)}
                                />
                            )}

                            {fd.type === "NUMBER_UNIT" && (
                                <div className="flex gap-2 w-full sm:w-1/2">
                                    <input 
                                        type="number" 
                                        placeholder="Değer" 
                                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded flex-1 min-w-0 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                                        value={currentVal.numberValue === null || currentVal.numberValue === undefined ? "" : currentVal.numberValue}
                                        onChange={(e) => updateFieldByName(fd.name, fd.type, "numberValue", parseFloat(e.target.value))}
                                    />
                                    <select 
                                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 w-24 shrink-0"
                                        value={currentVal.unit || ""}
                                        onChange={(e) => updateFieldByName(fd.name, fd.type, "unit", e.target.value)}
                                    >
                                        <option value="">Birim Seç</option>
                                        <option value="kg">kg</option>
                                        <option value="gr">gr</option>
                                        <option value="cm">cm</option>
                                        <option value="m">m</option>
                                    </select>
                                </div>
                            )}

                            {fd.type === "PHOTO" && (
                                <div className="mt-2">
                                    {currentVal.stringValue ? (
                                        <div className="flex items-center gap-4">
                                            <p className="text-green-600 dark:text-green-400 text-sm font-medium">✅ Fotoğraf yüklendi</p>
                                            <button onClick={() => updateFieldByName(fd.name, fd.type, "stringValue", "")} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                                                Fotoğrafı Değiştir
                                            </button>
                                        </div>
                                    ) : (
                                        <UploadButton
                                            endpoint="productImage"
                                            onClientUploadComplete={(res) => {
                                                if(res && res[0]) {
                                                    updateFieldByName(fd.name, fd.type, "stringValue", res[0].url);
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
                    )})}
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
