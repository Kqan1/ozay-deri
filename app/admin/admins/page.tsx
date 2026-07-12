"use client";

import { Plus, Shield, Trash2, Users, Loader2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdmin, deleteAdmin, getAdmins } from "../users/actions";
import Loading from "./loading";

export default function ManageAdminsPage() {
    const { data: session } = useSession();
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoading = true) {
        if (showLoading) setIsLoading(true);
        const data = await getAdmins();
        setAdmins(data);
        if (showLoading) setIsLoading(false);
    }

    if (isLoading) return <Loading />;

    async function handleCreateAdmin(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const res = await createAdmin(formData);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Yönetici başarıyla oluşturuldu.");
            setUsername("");
            setPassword("");
            await loadData(false);
        }
        setIsSubmitting(false);
    }

    async function handleDeleteAdmin(id: string) {
        if (!session?.user) return;

        toast("Emin misiniz?", {
            description: "Bu yöneticiyi kalıcı olarak silmek üzeresiniz.",
            action: {
                label: "Evet, Sil",
                onClick: async () => {
                    setDeletingId(id);
                    try {
                        const res = await deleteAdmin(id, session.user.id);
                        if (res.error) {
                            toast.error(res.error);
                        } else {
                            toast.success("Yönetici başarıyla silindi.");
                            if (session.user.id === id) {
                                signOut({ callbackUrl: "/" });
                            } else {
                                await loadData(false);
                            }
                        }
                    } catch (error) {
                        toast.error("Bir hata oluştu.");
                    } finally {
                        setDeletingId(null);
                    }
                },
            },
            cancel: { label: "İptal", onClick: () => {} },
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" /> Yöneticiler
                </h1>
                <p className="text-muted-foreground mt-1">
                    Sisteme erişimi olan tüm yöneticileri buradan yönetebilirsiniz.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Yeni Yönetici Ekle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Geçici Şifre</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Kullanıcı giriş yaptıktan sonra şifresini değiştirebilir.
                                </p>
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full cursor-pointer mt-4">
                                {isSubmitting ? "Oluşturuluyor..." : "Yönetici Oluştur"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> Kayıtlı Yöneticiler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-t">
                                    <tr>
                                        <th className="px-6 py-4">Kullanıcı Adı</th>
                                        <th className="px-6 py-4">Kayıt Tarihi</th>
                                        <th className="px-6 py-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => {
                                        const isMe = session?.user && session.user.id === admin.id;
                                        return (
                                            <tr
                                                key={admin.id}
                                                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {admin.username?.charAt(0).toUpperCase() || "A"}
                                                    </div>
                                                    {admin.username}
                                                    {isMe && (
                                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] rounded-full uppercase tracking-wide font-bold">
                                                            Siz
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(admin.createdAt).toLocaleDateString("tr-TR")}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin.id)}
                                                        disabled={deletingId === admin.id}
                                                        className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors cursor-pointer inline-flex items-center disabled:opacity-50"
                                                        title="Yöneticiyi Sil"
                                                    >
                                                        {deletingId === admin.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                Kayıtlı yönetici bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
