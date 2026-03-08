import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe, ChevronRight, Shield, Bell, UserCircle, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useDirection } from "@/contexts/DirectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function SettingRow({ icon: Icon, label, value, onClick }: { icon: any; label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-start"
    >
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
      <span className="flex-1 text-body-sm">{label}</span>
      {value && <span className="text-body-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

const SettingsPage = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { lang, setLanguage } = useDirection();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  const toggleLang = () => {
    setLanguage(lang === "en" ? "ar" : "en");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="max-w-2xl mx-auto">
        {user && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-body-xs text-muted-foreground">Signed in as</p>
            <p className="text-body-sm font-medium">{user.email}</p>
          </div>
        )}
        <div className="py-2">
          <p className="px-4 py-2 text-body-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
          <SettingRow icon={UserCircle} label="Edit Profile" />
          <SettingRow icon={Shield} label="Privacy & Security" />
          <SettingRow icon={Bell} label="Notifications" />
        </div>
        <div className="border-t border-border py-2">
          <p className="px-4 py-2 text-body-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferences</p>
          <SettingRow
            icon={resolvedTheme === "dark" ? Moon : Sun}
            label="Theme"
            value={theme.charAt(0).toUpperCase() + theme.slice(1)}
            onClick={cycleTheme}
          />
          <SettingRow
            icon={Globe}
            label="Language"
            value={lang === "en" ? "English" : "العربية"}
            onClick={toggleLang}
          />
        </div>
        <div className="border-t border-border py-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-destructive/10 transition-colors text-start text-destructive"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-body-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
