import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchPage = () => {
  return (
    <AppShell>
      <PageHeader title="Search" />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people, hashtags..."
            className="ps-10 bg-muted border-0 focus-visible:ring-accent"
          />
        </div>
        <EmptyState
          icon={Search}
          title="Discover"
          description="Search for people, hashtags, and trending topics."
          className="mt-8"
        />
      </div>
    </AppShell>
  );
};

export default SearchPage;
