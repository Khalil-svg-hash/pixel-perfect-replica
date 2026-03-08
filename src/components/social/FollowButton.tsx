import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { followUser, unfollowUser, FollowStatus } from "@/lib/social";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  targetIsPrivate: boolean;
  initialStatus: FollowStatus;
  onStatusChange?: (status: FollowStatus) => void;
  className?: string;
}

export function FollowButton({
  targetUserId,
  targetIsPrivate,
  initialStatus,
  onStatusChange,
  className,
}: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<FollowStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!user || user.id === targetUserId) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (status === "none") {
        const newStatus = await followUser(user.id, targetUserId, targetIsPrivate);
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        if (newStatus === "pending") {
          toast({ title: "Follow request sent" });
        }
      } else {
        await unfollowUser(user.id, targetUserId);
        setStatus("none");
        onStatusChange?.("none");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;

    switch (status) {
      case "accepted":
        return isHovered ? (
          <><span className="text-destructive">Unfollow</span></>
        ) : (
          <><UserCheck className="h-4 w-4" /> Following</>
        );
      case "pending":
        return <><Clock className="h-4 w-4" /> Requested</>;
      default:
        return <><UserPlus className="h-4 w-4" /> Follow</>;
    }
  };

  return (
    <Button
      size="sm"
      variant={status === "none" ? "default" : "outline"}
      className={cn(
        status === "none" && "bg-accent text-accent-foreground hover:bg-accent/90",
        status === "accepted" && isHovered && "border-destructive/50",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
    >
      {getButtonContent()}
    </Button>
  );
}
