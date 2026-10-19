import { Search } from "lucide-react";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = Omit<ComponentProps<typeof Input>, "type"> & {
  label: string;
};

export default function SearchField({ label, className, ...props }: SearchFieldProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input type="search" aria-label={label} className="bg-card pl-9" {...props} />
    </div>
  );
}
