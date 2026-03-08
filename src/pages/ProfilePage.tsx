import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Settings, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        action={
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        }
      />
      <div className="max-w-2xl mx-auto">
        {/* Cover */}
        <div className="h-36 bg-gradient-to-br from-accent/30 to-accent/10" />

        {/* Profile info */}
        <div className="px-4 -mt-10">
          <div className="flex items-end justify-between mb-3">
            <UserAvatar
              name={profile?.display_name || "You"}
              src={profile?.avatar_url}
              size="xl"
              className="border-4 border-background"
            />
            <Button variant="outline" size="sm" className="mb-1">
              Edit Profile
            </Button>
          </div>

          <h2 className="font-display text-display-md">{profile?.display_name || "Your Name"}</h2>
          <p className="text-body-sm text-muted-foreground">@{profile?.handle || "username"}</p>

          <p className="text-body-sm mt-3">
            {profile?.bio || "Welcome to your profile! Edit your bio to tell people about yourself."}
          </p>

          <div className="flex flex-wrap gap-4 mt-3 text-body-xs text-muted-foreground">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
            {profile?.website && (
              <span className="flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5" /> {profile.website}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Joined{" "}
              {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "recently"}
            </span>
          </div>

          <div className="flex gap-4 mt-4 text-body-sm">
            <span><strong className="font-semibold">0</strong> <span className="text-muted-foreground">Following</span></span>
            <span><strong className="font-semibold">0</strong> <span className="text-muted-foreground">Followers</span></span>
          </div>
        </div>

        {/* Posts tab placeholder */}
        <div className="border-t border-border mt-4">
          <div className="flex">
            <button className="flex-1 py-3 text-body-sm font-semibold text-center border-b-2 border-accent text-accent">
              Posts
            </button>
            <button className="flex-1 py-3 text-body-sm font-semibold text-center text-muted-foreground hover:bg-muted/50 transition-colors">
              Likes
            </button>
          </div>
          <div className="py-12 text-center text-body-sm text-muted-foreground">
            No posts yet
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
