import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-body-xs",
  md: "h-10 w-10 text-body-sm",
  lg: "h-14 w-14 text-body-md",
  xl: "h-20 w-20 text-display-sm",
};

export function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], "ring-2 ring-background", className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="gradient-accent text-white font-display font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
