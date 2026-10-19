import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
};

export default function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
