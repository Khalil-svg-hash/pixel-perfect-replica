import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const PLACEHOLDER_STORIES = [
  { id: "you", name: "You", isAdd: true },
  { id: "1", name: "Alex", color: "from-accent to-accent-glow" },
  { id: "2", name: "Sarah", color: "from-info to-accent" },
  { id: "3", name: "Mike", color: "from-success to-info" },
  { id: "4", name: "Luna", color: "from-warning to-accent" },
  { id: "5", name: "Jay", color: "from-accent-glow to-accent" },
];

export function StoriesRow() {
  return (
    <div className="border-b border-border/40 py-4 px-4 overflow-x-auto scrollbar-none">
      <div className="flex gap-4">
        {PLACEHOLDER_STORIES.map((story, i) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-full p-[2.5px]",
                story.isAdd
                  ? "border-2 border-dashed border-border"
                  : "bg-gradient-to-br",
                !story.isAdd && story.color
              )}
            >
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                {story.isAdd ? (
                  <Plus className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-body-sm font-semibold text-muted-foreground">
                      {story.name[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-14 text-center">
              {story.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
