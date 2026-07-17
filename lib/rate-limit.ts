// Basit bir In-Memory Rate Limiter
// Uyarı: Edge runtime'da (middleware) değişkenler her zaman kalıcı olmayabilir
// ancak basit sunucu ortamlarında (VPS) brute-force saldırılarını yavaşlatmak için yeterlidir.

type RateLimitInfo = {
    count: number;
    lastReset: number;
};

// Global scope'ta tutmak için
const rateLimitStore = new Map<string, RateLimitInfo>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const info = rateLimitStore.get(ip);

    // Eğer IP için daha önce kayıt yoksa oluştur
    if (!info) {
        rateLimitStore.set(ip, { count: 1, lastReset: now });
        return true;
    }

    // Eğer belirlenen süre (windowMs) dolmuşsa sayacı sıfırla
    if (now - info.lastReset > windowMs) {
        rateLimitStore.set(ip, { count: 1, lastReset: now });
        return true;
    }

    // Süre dolmadıysa ve limite ulaşıldıysa engelle
    if (info.count >= limit) {
        return false;
    }

    // Limite ulaşılmadıysa sayacı artır
    info.count += 1;
    return true;
}

export function getIpFromRequest(req: Request | any): string {
    // Next.js request objelerinden IP'yi bulmaya çalışır
    let ip = req.ip ?? req.headers?.get?.("x-forwarded-for") ?? req.headers?.get?.("x-real-ip");
    
    if (ip && typeof ip === "string") {
        // x-forwarded-for birden fazla IP dönebilir (virgülle ayrılmış), ilkini al
        ip = ip.split(",")[0].trim();
    }
    
    return ip || "unknown-ip";
}
