import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'super_admin' | 'assistant' | null;

export interface User {
    id: string;
    name: string;
    role: Role;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    role: Role;
    isLoading: boolean;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Derived role for convenience
    const role = user?.role || null;

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('vf_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('vf_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (pin: string): Promise<boolean> => {
        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1. ADMIN - Juan Carlos
        if (pin === '002284') {
            const adminUser: User = {
                id: '1',
                name: 'Juan Carlos Zurita',
                role: 'admin',
                email: 'admin@vitafinance.com'
            };
            setUser(adminUser);
            localStorage.setItem('vf_user', JSON.stringify(adminUser));
            return true;
        }

        // 2. ASSISTANT - Modo Asistente
        if (pin === '111111') {
            const assistantUser: User = {
                id: '2',
                name: 'Modo Asistente',
                role: 'assistant',
                email: 'asistente@vitafinance.com'
            };
            setUser(assistantUser);
            localStorage.setItem('vf_user', JSON.stringify(assistantUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vf_user');
    };

    return (
        <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
