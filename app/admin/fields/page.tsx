"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCategories, getFieldDefinitions } from "../actions";
import { createFieldDefinition, deleteFieldDefinition } from "./actions";
import Loading from "./loading";

export default function FieldsAdminPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editFieldId, setEditFieldId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("STRING");
  const [isGlobal, setIsGlobal] = useState("true");
  const [categoryId, setCategoryId] = useState("");
  const [isFilterable, setIsFilterable] = useState(false);
  const [isSortable, setIsSortable] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(showLoading = true) {
    if (showLoading) setIsLoading(true);
    const [fData, cData] = await Promise.all([
      getFieldDefinitions(),
      getCategories(),
    ]);
    setFields(fData);
    setCategories(cData);
    if (showLoading) setIsLoading(false);
  }

  if (isLoading) return <Loading />;

  async function handleSaveField(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    if (editFieldId) formData.append("id", editFieldId);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("isGlobal", isGlobal);
    if (categoryId) formData.append("categoryId", categoryId);
    if (isFilterable) formData.append("isFilterable", "on");
    if (isSortable) formData.append("isSortable", "on");
    if (isSearchable) formData.append("isSearchable", "on");

    await createFieldDefinition(formData);
    toast.success(
      editFieldId ? "Alan başarıyla güncellendi." : "Yeni alan oluşturuldu.",
    );

    resetForm();
    await loadData(false);
    setIsSubmitting(false);
  }

  function handleEditField(field: any) {
    setEditFieldId(field.id);
    setName(field.name);
    setType(field.type);
    setIsGlobal(field.isGlobal ? "true" : "false");
    setCategoryId(field.categoryId || "");
    setIsFilterable(field.isFilterable);
    setIsSortable(field.isSortable);
    setIsSearchable(field.isSearchable);
  }

  function resetForm() {
    setEditFieldId(null);
    setName("");
    setType("STRING");
    setIsGlobal("true");
    setCategoryId("");
    setIsFilterable(false);
    setIsSortable(false);
    setIsSearchable(false);
  }

  async function handleDeleteField(id: string) {
    toast("Emin misiniz?", {
      description: "Bu alanı kalıcı olarak silmek üzeresiniz.",
      action: {
        label: "Evet, Sil",
        onClick: async () => {
          await deleteFieldDefinition(id);
          toast.success("Alan başarıyla silindi.");
          await loadData(false);
        },
      },
      cancel: { label: "İptal", onClick: () => {} },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-primary" /> Özel Alan Yönetimi
        </h1>
        <p className="text-muted-foreground mt-1">
          Ürünler için global ve kategoriye özel alanları (renk, beden, kumaş
          vb.) tanımlayın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">
            {editFieldId ? "Alanı Düzenle" : "Yeni Alan Ekle"}
          </h2>
          <form onSubmit={handleSaveField} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Alan Adı (Örn: Renk, Kumaş, Fiyat, Açıklama)
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Veri Tipi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
              >
                <option value="STRING">Metin (Yazı)</option>
                <option value="NUMBER_UNIT">Sayı + Birim</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kapsam (Nerede Geçerli?)
              </label>
              <select
                value={isGlobal}
                onChange={(e) => setIsGlobal(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
              >
                <option value="true">Global (Tüm Kategorilerde)</option>
                <option value="false">Sadece Belirli Kategoride</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kategori Seçimi (Eğer Belirli İse)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
              >
                <option value="">-- Kategori Seç --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFilterable}
                  onChange={(e) => setIsFilterable(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm font-medium">
                  Filtrelenebilir (Menüde birebir eşleşme)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSortable}
                  onChange={(e) => setIsSortable(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm font-medium">Sıralanabilir</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSearchable}
                  onChange={(e) => setIsSearchable(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm font-medium">
                  Aranabilir (Kelime aramasında geçerli)
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="w-full cursor-pointer">
                {isSubmitting ? "Kaydediliyor..." : editFieldId ? "Güncelle" : "Alanı Oluştur"}
              </Button>
              {editFieldId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="w-full cursor-pointer"
                >
                  İptal
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-2 border rounded-lg p-0 overflow-hidden bg-card">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3">Alan Adı</th>
                  <th className="px-6 py-3">Tip</th>
                  <th className="px-6 py-3">Kapsam</th>
                  <th className="px-6 py-3">Özellikler</th>
                  <th className="px-6 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 font-medium">{f.name}</td>
                    <td className="px-6 py-4">
                      {f.type === "STRING" ? "Metin" : "Sayı+Birim"}
                    </td>
                    <td className="px-6 py-4">
                      {f.isGlobal ? "Global" : f.category?.name || "Bilinmeyen"}
                    </td>
                    <td className="px-6 py-4 space-x-2 flex flex-wrap gap-2">
                      {f.isFilterable && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                          Filtrelenebilir
                        </span>
                      )}
                      {f.isSortable && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded text-xs">
                          Sıralanabilir
                        </span>
                      )}
                      {f.isSearchable && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs">
                          Aranabilir
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditField(f)}
                          className="text-primary hover:underline font-medium cursor-pointer"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteField(f.id)}
                          className="text-destructive hover:underline font-medium cursor-pointer"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      Henüz tanımlanmış bir alan bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
