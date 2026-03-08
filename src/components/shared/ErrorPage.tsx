import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export function ErrorPage({ code = 500, message = "Something went wrong" }: { code?: number; message?: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center animate-fade-in">
      <span className="font-display text-[8rem] leading-none font-bold text-accent/20">{code}</span>
      <h1 className="font-display text-display-md mt-2">{message}</h1>
      <p className="text-body-sm text-muted-foreground mt-2 max-w-sm">
        {code === 404
          ? "The page you're looking for doesn't exist or has been moved."
          : "Please try again later or contact support if the problem persists."}
      </p>
      <Button onClick={() => navigate("/")} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
        <Home className="h-4 w-4 me-2" />
        Back to Home
      </Button>
    </div>
  );
}
