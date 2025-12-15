"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import Picker, { EmojiClickData, Theme } from "emoji-picker-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Smile className="h-4 w-4" />
        <span className="sr-only">Insert emoji</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 rounded-md shadow-lg z-50">
          <Picker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            width={280}
            height={400}
            searchPlaceHolder="Search emoji..."
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}
    </div>
  );
}
