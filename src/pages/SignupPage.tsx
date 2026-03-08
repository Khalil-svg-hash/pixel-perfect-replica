import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedInput } from "@/components/ui/animated-input";
import { DotPattern } from "@/components/ui/dot-pattern";
import { motion } from "framer-motion";

const SignupPage = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, displayName);
    setIsLoading(false);

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a confirmation link." });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-1 gradient-accent relative overflow-hidden items-center justify-center p-12">
        <DotPattern dotColor="rgba(255,255,255,0.08)" gap={32} dotSize={1.5} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(340_72%_58%/0.4),transparent_60%)]" />

        <motion.div
          className="absolute top-20 left-20 h-72 w-72 rounded-full border border-white/10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-white/5"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute top-8 left-8 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">C</span>
          </div>
          <span className="font-display font-bold text-display-sm text-white">Cluster</span>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <motion.h2
            className="font-display text-display-xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Start your<br />journey today.
          </motion.h2>
          <motion.p
            className="text-white/70 text-body-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Create, connect, and build your network in a space designed for authentic conversations.
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

          <h1 className="font-display text-display-md mb-1">Create account</h1>
          <p className="text-body-sm text-muted-foreground mb-8">Join the community today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatedInput
              id="name"
              type="text"
              label="Display name"
              icon={<User className="h-4 w-4" />}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
            />

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
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors z-10"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <ShimmerButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </ShimmerButton>
          </form>

          <p className="text-body-sm text-muted-foreground text-center mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
