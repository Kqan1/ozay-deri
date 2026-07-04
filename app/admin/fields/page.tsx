import db from "@/lib/db";
import { createFieldDefinition, deleteFieldDefinition } from "./actions";
import { Button } from "@/components/ui/button";

export default async function FieldsAdminPage() {
  const fields = await db.fieldDefinition.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Field Definitions</h1>
        <p className="text-muted-foreground">Manage global and category-specific fields for products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Add New Field</h2>
          <form action={createFieldDefinition} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (e.g. Renk, Kumaş, Fiyat, Açıklama)</label>
              <input name="name" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select name="type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="STRING">String (Text)</option>
                <option value="NUMBER_UNIT">Number + Unit</option>
                <option value="PHOTO">Photo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scope</label>
              <select name="isGlobal" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="true">Global (All Categories)</option>
                <option value="false">Category Specific</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category (If specific)</label>
              <select name="categoryId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="isFilterable" className="rounded border-gray-300" />
                <span className="text-sm font-medium">Filterable (Sidebar exact match)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="isSortable" className="rounded border-gray-300" />
                <span className="text-sm font-medium">Sortable</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="isSearchable" className="rounded border-gray-300" />
                <span className="text-sm font-medium">Searchable (Fuzzy Search pg_trgm)</span>
              </label>
            </div>

            <Button type="submit" className="w-full">Create Field</Button>
          </form>
        </div>

        <div className="md:col-span-2 border rounded-lg p-0 overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Scope</th>
                <th className="px-6 py-3">Features</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{f.name}</td>
                  <td className="px-6 py-4">{f.type}</td>
                  <td className="px-6 py-4">{f.isGlobal ? "Global" : f.category?.name || "Unknown"}</td>
                  <td className="px-6 py-4 space-x-2 flex flex-wrap gap-2">
                    {f.isFilterable && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Filterable</span>}
                    {f.isSortable && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Sortable</span>}
                    {f.isSearchable && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Searchable</span>}
                  </td>
                  <td className="px-6 py-4">
                    <form action={deleteFieldDefinition.bind(null, f.id)}>
                      <button type="submit" className="text-red-600 hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No fields defined yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
