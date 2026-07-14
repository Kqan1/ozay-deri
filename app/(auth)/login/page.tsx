"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If redirected with an error query param from next-auth
    const errorParam = searchParams.get("error");
    React.useEffect(() => {
        if (errorParam) {
            if (errorParam === "CredentialsSignin") {
                toast.error("Geçersiz kullanıcı adı veya şifre.");
            } else {
                toast.error("Giriş yaparken bir hata oluştu.");
            }
        }
    }, [errorParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }

        setIsLoading(true);
        const loginToastId = toast.loading("Giriş yapılıyor...");

        try {
            const result = await signIn("credentials", {
                username: username.trim(),
                password: password,
                redirect: false,
            });

            if (result?.error) {
                toast.dismiss(loginToastId);
                toast.error(result.error || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
            } else {
                toast.dismiss(loginToastId);
                toast.success("Başarıyla giriş yapıldı!");

                // Get redirect url or default to home page
                const callbackUrl = searchParams.get("callbackUrl") || "/";
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error: any) {
            toast.dismiss(loginToastId);
            toast.error("Beklenmeyen bir hata oluştu.");
            console.error("Giriş Hatası:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Hesabınıza giriş yapın</CardTitle>
                <CardDescription>Devam etmek için bilgilerinizi giriniz</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Kullanıcı Adı
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <UserIcon size={16} />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="kullanici_adi"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Şifre
                            </label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Lock size={16} />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                        Giriş Yap
                        {!isLoading ? <ArrowRight size={16} className="ml-2" /> : null}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                    Hesabınız yok mu?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Yeni Hesap Oluşturun
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center p-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
