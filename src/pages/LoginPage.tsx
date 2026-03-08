import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedInput } from "@/components/ui/animated-input";
import { DotPattern } from "@/components/ui/dot-pattern";
import { motion } from "framer-motion";

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
        <DotPattern dotColor="rgba(255,255,255,0.08)" gap={32} dotSize={1.5} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(340_72%_58%/0.4),transparent_60%)]" />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full border border-white/10"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 h-48 w-48 rounded-full border border-white/5"
          animate={{ scale: [1, 0.95, 1], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-12 h-32 w-32 rounded-full bg-white/5"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute top-8 left-8 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">C</span>
          </div>
          <span className="font-display font-bold text-display-sm text-white">Cluster</span>
        </div>
        <div className="relative z-10 max-w-md">
          <motion.h2
            className="font-display text-display-xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Where ideas<br />find their people.
          </motion.h2>
          <motion.p
            className="text-white/70 text-body-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join the community. Share what matters. Connect with those who care.
          </motion.p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center bg-background px-6 relative">
        <DotPattern className="opacity-30" />
        <motion.div
          className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 justify-center mb-10 lg:hidden">
            <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-lg">C</span>
            </div>
            <span className="font-display font-bold text-display-md">Cluster</span>
          </div>

          <h1 className="font-display text-display-md mb-1">Welcome back</h1>
          <p className="text-body-sm text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatedInput
              id="email"
              type="email"
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="relative">
              <AnimatedInput
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors z-10"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-body-xs text-accent hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <ShimmerButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </ShimmerButton>
          </form>

          <p className="text-body-sm text-muted-foreground text-center mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
