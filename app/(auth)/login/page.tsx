"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

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
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-3xl p-8 sm:p-10 w-full relative overflow-hidden group">
            {/* Ambient decorative border highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="flex flex-col space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                        ÖZAY Deri
                    </h1>
                    <p className="text-sm text-neutral-400">
                        Hesabınıza giriş yapın
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div className="space-y-1">
                        <label htmlFor="username" className="text-xs font-semibold text-neutral-300 ml-1">
                            Kullanıcı Adı
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                <UserIcon size={18} />
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
                                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                            <label htmlFor="password" className="text-xs font-semibold text-neutral-300">
                                Şifre
                            </label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                <Lock size={18} />
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
                                className="w-full pl-10 pr-10 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                Giriş Yap <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Switcher */}
                <div className="text-center pt-2 text-sm text-neutral-400">
                    Hesabınız yok mu?{" "}
                    <Link
                        href="/register"
                        className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors ml-1"
                    >
                        Yeni Hesap Oluşturun
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
