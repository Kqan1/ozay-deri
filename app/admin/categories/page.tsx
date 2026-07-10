"use client";

import { Eye, EyeOff, Folders, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../actions";
import Loading from "./loading";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [categoryIsHidden, setCategoryIsHidden] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(showLoading = true) {
    if (showLoading) setIsLoading(true);
    const cats = await getCategories();

    // Ağaç yapısına göre sıralama
    const sortedCats: any[] = [];
    const roots = cats
      .filter((c) => !c.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
    function traverse(parentId: string, depth: number) {
      const children = cats
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const child of children) {
        (child as any)._depth = depth;
        sortedCats.push(child);
        traverse(child.id, depth + 1);
      }
    }
    for (const root of roots) {
      (root as any)._depth = 0;
      sortedCats.push(root);
      traverse(root.id, 1);
    }

    setCategories(sortedCats);
    if (showLoading) setIsLoading(false);
  }

  if (isLoading) return <Loading />;

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName) return;
    if (editCategoryId) {
      await updateCategory(editCategoryId, {
        name: categoryName,
        parentId: parentCategoryId || null,
        isHidden: categoryIsHidden,
      });
    } else {
      await createCategory({
        name: categoryName,
        parentId: parentCategoryId || null,
        isHidden: categoryIsHidden,
      });
    }
    resetForm();
    await loadData(false);
  }

  function handleEditCategory(cat: any) {
    setEditCategoryId(cat.id);
    setCategoryName(cat.name);
    setParentCategoryId(cat.parentId || "");
    setCategoryIsHidden(cat.isHidden || false);
  }

  async function handleDeleteCategory(id: string) {
    toast.custom(
      (t) => (
        <div className="bg-card border p-4 rounded-lg shadow-lg w-[350px] space-y-3">
          <h3 className="font-semibold text-foreground">Kategoriyi Sil</h3>
          <p className="text-sm text-muted-foreground">
            Bu kategori silinmek üzere. İçindeki ürünlere ne yapılmasını
            istersiniz?
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t);
                await deleteCategory(id, true);
                toast.success("Kategori ve içindeki tüm ürünler silindi.");
                await loadData(false);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Kategoriyi ve Ürünleri Sil
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                await deleteCategory(id, false);
                toast.success(
                  "Kategori silindi. Ürünler 'Kategorisiz' olarak korundu.",
                );
                await loadData(false);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sadece Kategoriyi Sil
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  }

  async function handleToggleCategoryVisibility(cat: any) {
    await updateCategory(cat.id, {
      name: cat.name,
      parentId: cat.parentId,
      isHidden: !cat.isHidden,
    });
    await loadData(false);
  }

  function resetForm() {
    setEditCategoryId(null);
    setCategoryName("");
    setParentCategoryId("");
    setCategoryIsHidden(false);
  }

  function buildCategoryPath(category: any): string {
    if (!category) return "";
    const depth = category._depth || 0;
    const indent = "\u00A0\u00A0\u00A0\u00A0".repeat(depth);
    return `${indent}${depth > 0 ? "— " : ""}${category.name}`;
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Folders className="w-8 h-8 text-primary" /> Kategoriler
          </h1>
          <p className="text-muted-foreground mt-1">
            Sitenizdeki ürün kategorilerini yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Alanı */}
        <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6">
            {editCategoryId ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
          </h2>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori Adı</label>
              <input
                type="text"
                required
                placeholder="Örn: Deri Ceketler"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Üst Kategori (Opsiyonel)
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
              >
                <option value="">-- Üst Kategori Yok --</option>
                {categories
                  .filter((c) => c.id !== editCategoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {buildCategoryPath(c)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-4 border-b">
              <input
                type="checkbox"
                id="isHidden"
                checked={categoryIsHidden}
                onChange={(e) => setCategoryIsHidden(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor="isHidden"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Gizli Mod (Sitede görünmez)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                {editCategoryId ? "Güncelle" : "Ekle"}
              </button>
              {editCategoryId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste Alanı */}
        <div className="md:col-span-2 border rounded-lg p-0 overflow-hidden bg-card shadow-sm">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold">Mevcut Kategoriler</h3>
          </div>
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Henüz kategori bulunmuyor.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((c) => (
                <div
                  key={c.id}
                  style={{ paddingLeft: `${(c._depth || 0) * 1.5 + 1}rem` }}
                  className={`flex items-center justify-between p-4 pr-4 py-4 hover:bg-muted/50 transition-colors ${c.isHidden ? "opacity-70 bg-muted/20" : ""}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                      {c.name}
                    </span>
                    {c.isHidden && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 w-fit">
                        Gizli
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCategoryVisibility(c)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1.5 w-[90px]"
                    >
                      {!c.isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Görünür
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Gizli
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditCategory(c)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
