import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Camera, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EditProfilePage = () => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setWebsite(profile.website || "");
      setIsPrivate(profile.is_private);
      setAvatarPreview(profile.avatar_url);
      setCoverPreview(profile.cover_url);
    }
  }, [profile]);

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed.", variant: "destructive" });
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${user!.id}/${path}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    // Add cache-busting param
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);

    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;

      if (avatarFile) {
        const url = await uploadImage(avatarFile, "avatar");
        if (url) avatarUrl = url;
      }

      if (coverFile) {
        const url = await uploadImage(coverFile, "cover");
        if (url) coverUrl = url;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          location: location.trim() || null,
          website: website.trim() || null,
          is_private: isPrivate,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast({ title: "Profile updated" });
      navigate("/profile");
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Edit Profile"
        action={
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        {/* Cover photo */}
        <div className="relative group">
          <div
            className={cn(
              "h-36 bg-gradient-to-br from-accent/30 to-accent/10 overflow-hidden",
              coverPreview && "bg-none"
            )}
          >
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/20 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-background" />
            </div>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageSelect(e, setCoverFile, setCoverPreview)}
          />
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-10 mb-6">
          <div className="relative group inline-block">
            <UserAvatar
              name={displayName || "You"}
              src={avatarPreview}
              size="xl"
              className="border-4 border-background"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/0 group-hover:bg-foreground/20 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-background" />
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e, setAvatarFile, setAvatarPreview)}
            />
          </div>
        </div>

        {/* Form fields */}
        <div className="px-4 space-y-5 pb-8">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself"
              maxLength={160}
              className="resize-none min-h-[80px]"
            />
            <p className="text-body-xs text-muted-foreground text-end">{bio.length}/160</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you based?"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              maxLength={100}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <div>
              <p className="text-body-sm font-medium">Private account</p>
              <p className="text-body-xs text-muted-foreground">
                Only approved followers can see your posts
              </p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EditProfilePage;
