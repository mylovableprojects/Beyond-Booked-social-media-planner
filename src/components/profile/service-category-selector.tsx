"use client";

import { DEFAULT_SERVICE_CATEGORIES } from "@/lib/constants/default-libraries";
import { LibraryChipEditor } from "./library-chip-editor";

type ServiceCategorySelectorProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function ServiceCategorySelector({
  selected,
  onChange,
}: ServiceCategorySelectorProps) {
  return (
    <LibraryChipEditor
      label="Service categories"
      selected={selected}
      defaultOptions={DEFAULT_SERVICE_CATEGORIES}
      customAddPlaceholder="Add custom service category"
      onChange={onChange}
    />
  );
}
