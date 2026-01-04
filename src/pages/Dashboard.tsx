import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import WorkerDashboard from "@/components/dashboard/WorkerDashboard";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const initializeUser = useMutation(api.users.initializeUser);

  useEffect(() => {
    if (user && !user.role) {
      initializeUser();
    }
  }, [user, initializeUser]);

  if (authLoading) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!user.role) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    );
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return <WorkerDashboard />;
}