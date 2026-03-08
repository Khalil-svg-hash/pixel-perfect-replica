import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ImagePlus, Smile } from "lucide-react";
import { motion } from "framer-motion";

export function ComposePrompt() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-b border-border/40"
    >
      <div className="flex gap-3">
        <UserAvatar
          src={profile?.avatar_url}
          name={profile?.display_name || "You"}
          size="md"
        />
        <div className="flex-1">
          <button
            onClick={() => navigate("/compose")}
            className="w-full text-start text-muted-foreground/60 text-body-sm py-2.5 px-4 rounded-2xl bg-muted/50 hover:bg-muted/80 border border-border/30 hover:border-border/60 transition-all duration-200 cursor-text"
          >
            What's happening?
          </button>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/compose")}
                className="p-2 rounded-full text-accent/70 hover:text-accent hover:bg-accent/10 transition-colors"
              >
                <ImagePlus className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={() => navigate("/compose")}
                className="p-2 rounded-full text-accent/70 hover:text-accent hover:bg-accent/10 transition-colors"
              >
                <Smile className="h-[18px] w-[18px]" />
              </button>
            </div>
            <ShimmerButton
              className="h-8 px-5 text-xs rounded-full"
              onClick={() => navigate("/compose")}
            >
              Post
            </ShimmerButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
