"use client";

import { Activity, ArrowUpRight, Folders, Package, Settings2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "./actions";

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        productsCount: 0,
        categoriesCount: 0,
        fieldsCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [animateGraph, setAnimateGraph] = useState(false);
    const [systemStatus, setSystemStatus] = useState<"loading" | "active" | "error">("loading");

    console.log(session?.user);

    useEffect(() => {
        getAdminStats()
            .then((data) => {
                setStats(data);
                setIsLoading(false);
                setSystemStatus("active");
                setTimeout(() => setAnimateGraph(true), 100);
            })
            .catch(() => {
                setIsLoading(false);
                setSystemStatus("error");
            });
    }, []);

    const total = stats.productsCount + stats.categoriesCount + stats.fieldsCount || 1;
    const prodHeight = animateGraph ? `${Math.max((stats.productsCount / total) * 100, 5)}%` : "0%";
    const catHeight = animateGraph ? `${Math.max((stats.categoriesCount / total) * 100, 5)}%` : "0%";
    const fieldsHeight = animateGraph ? `${Math.max((stats.fieldsCount / total) * 100, 5)}%` : "0%";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" /> Admin Paneli
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Hoş geldiniz,{" "}
                        <span className="font-semibold text-foreground">{session?.user?.username || "Yönetici"}</span>.
                        Sisteminizin güncel durumu aşağıdadır.
                    </p>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Ürün</CardTitle>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Package className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isLoading ? "..." : stats.productsCount}</div>
                        <p className="text-xs text-green-500 mt-2 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> Sistemde aktif
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Kategoriler</CardTitle>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                            <Folders className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isLoading ? "..." : stats.categoriesCount}</div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center">Katalog hiyerarşisi</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Özel Alanlar</CardTitle>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Settings2 className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{isLoading ? "..." : stats.fieldsCount}</div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center">Dinamik özellikler</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grafikler ve Aktiviteler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Sistem Veri Dağılımı
                        </CardTitle>
                        <CardDescription>Veritabanınızdaki temel nesnelerin oransal dağılım grafiği</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-end gap-3 sm:gap-12 justify-center pb-4 px-4 sm:px-6 relative overflow-x-auto">
                        {/* Background lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-12 px-6 opacity-10 pointer-events-none">
                            <div className="border-t w-full border-dashed"></div>
                            <div className="border-t w-full border-dashed"></div>
                            <div className="border-t w-full border-dashed"></div>
                            <div className="border-t w-full border-dashed"></div>
                        </div>

                        {/* Bars */}
                        <div className="w-[50px] sm:w-full sm:max-w-[80px] shrink-0 flex flex-col items-center gap-2 sm:gap-3 relative z-10 h-full justify-end">
                            <div className="w-full bg-muted rounded-t-md relative flex items-end group h-full">
                                <div
                                    className="w-full bg-blue-500 rounded-t-md transition-all duration-1000 ease-out"
                                    style={{ height: prodHeight }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-100 transition-opacity whitespace-nowrap">
                                    {stats.productsCount}
                                </div>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Ürünler</span>
                        </div>

                        <div className="w-[50px] sm:w-full sm:max-w-[80px] shrink-0 flex flex-col items-center gap-2 sm:gap-3 relative z-10 h-full justify-end">
                            <div className="w-full bg-muted rounded-t-md relative flex items-end group h-full">
                                <div
                                    className="w-full bg-green-500 rounded-t-md transition-all duration-1000 ease-out delay-150"
                                    style={{ height: catHeight }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-100 transition-opacity whitespace-nowrap">
                                    {stats.categoriesCount}
                                </div>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Kategoriler</span>
                        </div>

                        <div className="w-[50px] sm:w-full sm:max-w-[80px] shrink-0 flex flex-col items-center gap-2 sm:gap-3 relative z-10 h-full justify-end">
                            <div className="w-full bg-muted rounded-t-md relative flex items-end group h-full">
                                <div
                                    className="w-full bg-purple-500 rounded-t-md transition-all duration-1000 ease-out delay-300"
                                    style={{ height: fieldsHeight }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-100 transition-opacity whitespace-nowrap">
                                    {stats.fieldsCount}
                                </div>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Alanlar</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Hızlı Yönetim</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                        <Link
                            href="/admin/products"
                            className="group flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-500" />
                                <div className="font-medium text-sm">Ürünleri Yönet</div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>

                        <Link
                            href="/admin/categories"
                            className="group flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Folders className="w-5 h-5 text-green-500" />
                                <div className="font-medium text-sm">Kategorileri Düzenle</div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>

                        <Link
                            href="/admin/fields"
                            className="group flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Settings2 className="w-5 h-5 text-purple-500" />
                                <div className="font-medium text-sm">Özel Alan Tanımla</div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>

                        <div className="mt-auto pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                {systemStatus === "active" && (
                                    <>
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                        <span className="text-muted-foreground">Tüm sistemler aktif.</span>
                                    </>
                                )}
                                {systemStatus === "loading" && (
                                    <>
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                        </span>
                                        <span className="text-muted-foreground">Sistem durumu kontrol ediliyor...</span>
                                    </>
                                )}
                                {systemStatus === "error" && (
                                    <>
                                        <span className="relative flex h-3 w-3">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        <span className="text-destructive font-medium">Sistem hatası.</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
