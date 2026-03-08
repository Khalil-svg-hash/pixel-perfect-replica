import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-1 gradient-accent relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(340_72%_58%/0.4),transparent_60%)]" />
        <div className="absolute top-8 left-8 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">C</span>
          </div>
          <span className="font-display font-bold text-display-sm text-white">Cluster</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-display-xl text-white mb-4">
            Where ideas<br />find their people.
          </h2>
          <p className="text-white/70 text-body-lg">
            Join the community. Share what matters. Connect with those who care.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute top-1/3 right-1/3 h-48 w-48 rounded-full border border-white/5" />
        <div className="absolute bottom-1/4 right-12 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex items-center gap-2 justify-center mb-10 lg:hidden">
            <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-lg">C</span>
            </div>
            <span className="font-display font-bold text-display-md">Cluster</span>
          </div>

          <h1 className="font-display text-display-md mb-1">Welcome back</h1>
          <p className="text-body-sm text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-body-xs font-medium">Password</Label>
                <Link to="/forgot-password" className="text-body-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-accent text-white border-0 hover:opacity-90 shadow-accent transition-all duration-200 gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="text-body-sm text-muted-foreground text-center mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
