import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingRequests, acceptFollowRequest, rejectFollowRequest } from "@/lib/social";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

export function FollowRequestsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["follow-requests", user?.id],
    queryFn: () => getPendingRequests(user!.id),
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFollowRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts"] });
      toast({ title: "Request accepted" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectFollowRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      toast({ title: "Request declined" });
    },
  });

  if (isLoading || requests.length === 0) return null;

  return (
    <div className="border-b border-border">
      <p className="px-4 py-2 text-body-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Follow Requests ({requests.length})
      </p>
      {requests.map((req: any) => {
        const profile = req.profiles;
        return (
          <div key={req.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
            <UserAvatar name={profile?.display_name || "User"} src={profile?.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold truncate">{profile?.display_name}</p>
              <p className="text-body-xs text-muted-foreground truncate">@{profile?.handle}</p>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="icon"
                className="h-8 w-8 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => acceptMutation.mutate(req.id)}
                disabled={acceptMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => rejectMutation.mutate(req.id)}
                disabled={rejectMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
