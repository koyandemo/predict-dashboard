import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EmojiPicker } from "@/components/EmojiPicker";
import { generateAIComment } from "@/lib/aiHelper";
import { cn } from "@/lib/utils";
import { UserT } from "@/types/user.type";

const MAX_LENGTH = 1000;


interface CommentFormProps {
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
  users: UserT[];
  selectedUserId: number | null;
  onUserChange: (userId: number) => void;
  match: {
    home_team: { name: string };
    away_team: { name: string };
    leagues?: { name: string };
    match_date: string;
  };
}

export function CommentForm({
  onSubmit,
  isSubmitting,
  users,
  selectedUserId,
  onUserChange,
  match,
}: CommentFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  const handleGenerateAI = async () => {
    try {
      const aiComment = await generateAIComment({
        homeTeam: match.home_team?.name || "",
        awayTeam: match.away_team?.name || "",
        league: match.leagues?.name || "",
        matchDate: new Date(match.match_date).toLocaleDateString(),
      });
      setText(aiComment);
      toast.success("AI comment generated!");
    } catch {
      toast.error("Failed to generate AI comment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* User selector row */}
      <div className="flex gap-2">
        <Select
          value={selectedUserId?.toString() ?? ""}
          onValueChange={(val) => onUserChange(Number(val))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGenerateAI}
          title="Generate AI comment"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      {/* Textarea */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your prediction or thoughts..."
        className="min-h-[96px] text-sm"
        maxLength={MAX_LENGTH}
      />

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EmojiPicker onEmojiSelect={(emoji) => setText((p) => p + emoji)} />
          <span
            className={cn(
              "text-xs transition-colors",
              text.length > 900 ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {text.length}/{MAX_LENGTH}
          </span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !text.trim() || !selectedUserId}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Comment"
          )}
        </Button>
      </div>
    </form>
  );
}