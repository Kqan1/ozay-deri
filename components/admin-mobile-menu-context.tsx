"use client";
import type React from "react";
import { createContext, useContext, useState } from "react";

interface AdminMenuContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const AdminMenuContext = createContext<AdminMenuContextType>({
    isOpen: false,
    setIsOpen: () => {},
});

export function AdminMenuProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return <AdminMenuContext.Provider value={{ isOpen, setIsOpen }}>{children}</AdminMenuContext.Provider>;
}

export const useAdminMenu = () => useContext(AdminMenuContext);
