"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { createCategory, getCategories, createProduct, getProducts, CreateProductInput } from "./actions";
import { UploadButton } from "@/utils/uploadthing";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    
    const [categoryName, setCategoryName] = useState("");
    
    const [productName, setProductName] = useState("");
    const [productCategoryId, setProductCategoryId] = useState("");
    const [fields, setFields] = useState<CreateProductInput["fields"]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const cats = await getCategories();
        const prods = await getProducts();
        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0) setProductCategoryId(cats[0].id);
    }

    async function handleAddCategory() {
        if (!categoryName) return;
        await createCategory({ name: categoryName });
        setCategoryName("");
        await loadData();
    }

    async function handleAddProduct() {
        if (!productName || !productCategoryId) return;
        await createProduct({
            name: productName,
            categoryId: productCategoryId,
            fields,
        });
        setProductName("");
        setFields([]);
        await loadData();
    }

    function addField(type: "STRING" | "NUMBER_UNIT" | "PHOTO") {
        setFields([...fields, { name: "", type }]);
    }

    function updateField(index: number, key: string, value: any) {
        const newFields = [...fields];
        (newFields[index] as any)[key] = value;
        setFields(newFields);
    }

    return (
        <div className="p-8 space-y-12 text-zinc-900 dark:text-zinc-100">
            <h1 className="text-2xl font-bold">Admin Paneli</h1>

            {/* Kategori Yönetimi */}
            <section className="space-y-4 border border-zinc-200 dark:border-zinc-700 p-4 rounded-md bg-white dark:bg-zinc-800">
                <h2 className="text-xl font-semibold">Kategori Ekle</h2>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Kategori Adı" 
                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                    <button onClick={handleAddCategory} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded">
                        Ekle
                    </button>
                </div>
                <div>
                    <h3 className="font-semibold mt-4">Kategoriler:</h3>
                    <ul className="list-disc pl-5">
                        {categories.map(c => <li key={c.id} className="text-zinc-700 dark:text-zinc-300">{c.name}</li>)}
                    </ul>
                </div>
            </section>

            {/* Ürün Yönetimi */}
            <section className="space-y-4 border border-zinc-200 dark:border-zinc-700 p-4 rounded-md bg-white dark:bg-zinc-800">
                <h2 className="text-xl font-semibold">Ürün Ekle</h2>
                <div className="space-y-2">
                    <select 
                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded block bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                        value={productCategoryId}
                        onChange={(e) => setProductCategoryId(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    
                    <input 
                        type="text" 
                        placeholder="Ürün Adı" 
                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded block bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Özel Alanlar (Custom Fields)</h3>
                    <div className="flex gap-2">
                        <button onClick={() => addField("STRING")} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded text-sm font-medium">Metin Ekle</button>
                        <button onClick={() => addField("NUMBER_UNIT")} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded text-sm font-medium">Sayı+Birim Ekle</button>
                        <button onClick={() => addField("PHOTO")} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded text-sm font-medium">Fotoğraf Ekle</button>
                    </div>

                    {fields.map((f, i) => (
                        <div key={i} className="border border-zinc-200 dark:border-zinc-700 p-3 flex flex-col gap-2 rounded bg-zinc-50 dark:bg-zinc-900">
                            <input 
                                type="text" 
                                placeholder="Alan Adı (Örn: Ağırlık, Renk)" 
                                className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                                value={f.name}
                                onChange={(e) => updateField(i, "name", e.target.value)}
                            />

                            {f.type === "STRING" && (
                                <input 
                                    type="text" 
                                    placeholder="Metin Değeri" 
                                    className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                                    value={f.stringValue || ""}
                                    onChange={(e) => updateField(i, "stringValue", e.target.value)}
                                />
                            )}

                            {f.type === "NUMBER_UNIT" && (
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Değer" 
                                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded w-24 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                                        value={f.numberValue || ""}
                                        onChange={(e) => updateField(i, "numberValue", parseFloat(e.target.value))}
                                    />
                                    <select 
                                        className="border border-zinc-300 dark:border-zinc-600 p-2 rounded bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
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
                                <div>
                                    {f.stringValue ? (
                                        <p className="text-green-600 dark:text-green-400 text-sm">Fotoğraf yüklendi: {f.stringValue}</p>
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

                <button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-4">
                    Ürünü Kaydet
                </button>
                
                <div>
                    <h3 className="font-semibold mt-4">Ürünler:</h3>
                    <ul className="space-y-4 mt-2">
                        {products.map(p => (
                            <li key={p.id} className="border border-zinc-200 dark:border-zinc-700 p-4 rounded bg-zinc-50 dark:bg-zinc-900/50">
                                <span className="font-bold text-zinc-900 dark:text-white text-lg">{p.name}</span> (Kategori: {p.category?.name})
                                <ul className="pl-4 mt-2 list-disc space-y-1">
                                    {p.fields.map((f: any) => (
                                        <li key={f.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{f.name}:</span> 
                                            {f.type === 'STRING' && ` ${f.stringValue}`}
                                            {f.type === 'NUMBER_UNIT' && ` ${f.numberValue} ${f.unit}`}
                                            {f.type === 'PHOTO' && (
                                                <a href={f.stringValue} target="_blank" className="text-blue-500 hover:underline ml-1">Görüntüle</a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}

