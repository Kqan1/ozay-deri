"use client";

import { Lock, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updatePassword, updateProfile } from "../users/actions";

export default function ProfilePage() {
  const { data: session, update } = useSession();

  // Profile State
  const [username, setUsername] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.username || ""); // mapped to username
    }
  }, [session]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsProfileLoading(true);
    const formData = new FormData();
    formData.append("id", session.user.id);
    formData.append("username", username);

    const res = await updateProfile(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Profil başarıyla güncellendi.");
      // Update session data
      await update({ username });
    }
    setIsProfileLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }

    setIsPasswordLoading(true);

    const formData = new FormData();
    formData.append("id", session.user.id);
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);

    const res = await updatePassword(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Şifre başarıyla güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsPasswordLoading(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-primary" /> Profilim
        </h1>
        <p className="text-muted-foreground mt-1">
          Kişisel bilgilerinizi ve hesap güvenliğinizi yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Kişisel Bilgiler
            </CardTitle>
            <CardDescription>
              Adınızı ve kullanıcı adınızı buradan güncelleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
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

              <Button
                type="submit"
                disabled={isProfileLoading}
                className="w-full cursor-pointer mt-4"
              >
                {isProfileLoading ? "Güncelleniyor..." : "Bilgileri Kaydet"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Şifre Değiştir
            </CardTitle>
            <CardDescription>
              Hesap güvenliğiniz için şifrenizi güçlü tutun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mevcut Şifre</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Yeni Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isPasswordLoading}
                className="w-full cursor-pointer mt-4"
              >
                {isPasswordLoading ? "Güncelleniyor..." : "Şifreyi Değiştir"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
