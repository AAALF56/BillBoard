import { useStore } from "@/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useStore((state) => state.login);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      const success = login(username, password);
      
      if (success) {
        // Determine route based on user role
        const user = useStore.getState().currentUser;
        if (user?.role === "ADMIN") {
          setLocation("/admin");
        } else if (user?.role === "EMPLOYEE") {
          setLocation("/employee");
        } else {
           setLocation("/");
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3 text-3xl font-bold text-primary">
         <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
           <Layers size={24} strokeWidth={2.5} />
         </div>
         Bill Board
      </div>
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-muted-foreground">Workforce & Shift Management</h1>
      </div>
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="e.g. admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base rounded-lg" disabled={!username || !password}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}