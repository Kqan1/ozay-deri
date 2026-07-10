"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AccountDeletedPage() {
  return (
    <div className="w-full max-w-md">
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden text-center space-y-6">
        {/* Header Section */}
        <div className="bg-destructive/10 border-b border-destructive/20 p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-4 border-destructive/20 text-destructive shadow-sm mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Yetkisiz Erişim
          </h1>
        </div>

        {/* Content Section */}
        <div className="p-8 pt-2 space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Yönetici panelinden hesabınız silinmiş veya admin yetkileriniz
            kaldırılmıştır. Güvenlik nedeniyle oturumunuz iptal edildi.
          </p>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="destructive"
              className="w-full font-medium h-11"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Oturumu Sonlandır
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
