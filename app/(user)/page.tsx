import Link from "next/link";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";

interface CategoryTree {
    id: string;
    name: string;
    parentId: string | null;
    products: any[];
    children: CategoryTree[];
}

function buildCategoryTree(categories: any[]): CategoryTree[] {
    const tree: CategoryTree[] = [];
    const map: Record<string, CategoryTree> = {};

    categories.forEach(c => {
        map[c.id] = { ...c, children: [] };
    });

    categories.forEach(c => {
        if (c.parentId && map[c.parentId]) {
            map[c.parentId].children.push(map[c.id]);
        } else {
            tree.push(map[c.id]);
        }
    });

    return tree;
}

function CategoryNode({ node, depth = 0 }: { node: CategoryTree, depth?: number }) {
    return (
        <section className={`space-y-6 ${depth > 0 ? 'mt-8 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 sm:pl-6' : ''}`}>
            <h2 className={`${depth === 0 ? 'text-2xl' : depth === 1 ? 'text-xl' : 'text-lg'} font-bold border-b pb-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between`}>
                <span className="flex items-center gap-2">
                    {depth > 0 && <span className="text-zinc-400">↳</span>}
                    {node.name}
                </span>
                <span className="text-sm font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    {node.products.length} Ürün
                </span>
            </h2>
            
            {node.products.length === 0 ? (
                <p className="text-zinc-500 italic text-sm">Bu kategoride henüz ürün bulunmuyor.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {node.products.map(product => {
                        const photoField = product.fields.find((f: any) => f.type === 'PHOTO');
                        
                        return (
                            <div key={product.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                                {photoField?.stringValue ? (
                                    <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={photoField.stringValue} 
                                            alt={product.name}
                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 text-sm">
                                        Görsel Yok
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                                </div>

                                <div className="space-y-2 mt-auto text-sm">
                                    {product.fields.filter((f: any) => f.type !== 'PHOTO').map((field: any) => (
                                        <div key={field.id} className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                                            <span className="text-zinc-500">{field.name}</span>
                                            <span className="font-medium text-right max-w-[60%] truncate" title={field.type === 'STRING' ? field.stringValue || '' : `${field.numberValue} ${field.unit}`}>
                                                {field.type === 'STRING' ? field.stringValue : `${field.numberValue} ${field.unit}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {node.children.length > 0 && (
                <div className="space-y-8 mt-8">
                    {node.children.map(child => (
                        <CategoryNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default async function Home() {
    const categories = await db.category.findMany({
        where: {
            isHidden: false,
        },
        include: {
            products: {
                where: {
                    isHidden: false,
                },
                include: {
                    fields: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const categoryTree = buildCategoryTree(categories);

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950">
            <main className="flex flex-col items-center gap-8 max-w-5xl w-full">
                <div className="space-y-4 text-center w-full mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Özay Deri - Ürün Vitrini
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Sistemde bulunan tüm kategori ve ürünlerin listesi
                    </p>
                </div>

                <div className="w-full space-y-16">
                    {categoryTree.length === 0 ? (
                        <div className="text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <p className="text-zinc-500 mb-4">Henüz hiç kategori veya ürün eklenmemiş.</p>
                            <Button asChild>
                                <Link href="/admin">Ürün Eklemeye Başla</Link>
                            </Button>
                        </div>
                    ) : (
                        categoryTree.map(node => (
                            <CategoryNode key={node.id} node={node} />
                        ))
                    )}
                </div>

                <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 w-full flex justify-center">
                    <Button asChild variant="outline">
                        <Link href="/admin">
                            Admin Paneline Dön
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}