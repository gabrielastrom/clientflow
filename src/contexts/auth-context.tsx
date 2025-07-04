"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

const protectedRoutes = [
    "/home",
    "/dashboard",
    "/calendar",
    "/clients",
    "/team",
    "/finance",
    "/content",
    "/tracking",
    "/settings",
];

const publicRoutes = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (isLoading) return;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && isProtectedRoute) {
      router.push("/login");
    } else if (user && isPublicRoute) {
      router.push("/home");
    }
  }, [user, isLoading, pathname, router]);


  if (isLoading && protectedRoutes.some(route => pathname.startsWith(route))) {
    return (
      <div className="flex items-center justify-center h-screen">
         <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
         </div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
