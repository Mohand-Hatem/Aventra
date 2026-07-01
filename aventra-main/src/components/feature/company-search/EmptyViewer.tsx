/**
 * Folder: src/components/feature/company-search
 * File: EmptyViewer.tsx
 * Purpose: Shown on the right when no candidate is selected yet.
 */

import { IconSearch } from "@tabler/icons-react";

export default function EmptyViewer() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10">
        <IconSearch size={24} className="text-primary dark:text-sky" />
      </div>
      <p className="text-base font-semibold text-foreground">
        Search for candidates
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Use the chat on the left to search by skills, experience, or role.
        Matching CVs will appear here.
      </p>
    </div>
  );
}
