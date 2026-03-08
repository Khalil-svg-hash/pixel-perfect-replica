import { Link } from "react-router-dom";

interface RichTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with clickable #hashtags and highlighted @mentions.
 */
export function RichText({ text, className }: RichTextProps) {
  // Match @mentions and #hashtags
  const parts = text.split(/([@#]\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          return (
            <Link
              key={i}
              to={`/search?q=${encodeURIComponent(part)}&tab=posts`}
              className="text-accent font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          return (
            <span key={i} className="text-accent font-medium">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
