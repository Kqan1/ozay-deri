"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Front-end validations
        if (!username.trim() || !password || !confirmPassword) {
            toast.error("Lütfen tüm zorunlu alanları doldurun.");
            return;
        }

        if (password.length < 6) {
            toast.error("Şifreniz en az 6 karakter olmalıdır.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Şifreler uyuşmuyor.");
            return;
        }

        setIsLoading(true);
        const registerToastId = toast.loading("Hesap oluşturuluyor...");

        try {
            const formData = new FormData();
            formData.append("username", username.trim());
            formData.append("password", password);

            const result = await registerUser(null, formData);

            if (result && result.success) {
                toast.dismiss(registerToastId);
                toast.success(result.message || "Hesabınız başarıyla oluşturuldu!");
                // Redirect to login page
                router.push("/login");
            } else {
                toast.dismiss(registerToastId);
                toast.error(result?.error || "Hesap oluşturulurken bir hata oluştu.");
            }
        } catch (error: any) {
            toast.dismiss(registerToastId);
            toast.error("Beklenmeyen bir hata oluştu.");
            console.error("Kayıt Hatası:", error);
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
                        Yeni bir hesap oluşturun
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
                                <User size={18} />
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
                        <label htmlFor="password" className="text-xs font-semibold text-neutral-300 ml-1">
                            Şifre
                        </label>
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

                    {/* Confirm Password Input */}
                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="text-xs font-semibold text-neutral-300 ml-1">
                            Şifre Tekrarı
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
                            />
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
                                Kayıt Ol <UserPlus size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Switcher */}
                <div className="text-center pt-2 text-sm text-neutral-400">
                    Zaten bir hesabınız var mı?{" "}
                    <Link
                        href="/login"
                        className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors ml-1"
                    >
                        Giriş Yapın
                    </Link>
                </div>
            </div>
        </div>
    );
}
