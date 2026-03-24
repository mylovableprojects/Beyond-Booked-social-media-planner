"use client";

import { DEFAULT_EVENT_TYPES } from "@/lib/constants/default-libraries";
import { LibraryChipEditor } from "./library-chip-editor";

type EventTypeSelectorProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function EventTypeSelector({ selected, onChange }: EventTypeSelectorProps) {
  return (
    <LibraryChipEditor
      label="Event types"
      selected={selected}
      defaultOptions={DEFAULT_EVENT_TYPES}
      customAddPlaceholder="Add custom event type"
      onChange={onChange}
    />
  );
}
