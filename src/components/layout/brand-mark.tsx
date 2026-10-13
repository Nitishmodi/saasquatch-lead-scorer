import { Radar } from "lucide-react";
import { APP_NAME } from "@/lib/site";

export function BrandMark() {
  return (
    <div className="group flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/40 transition group-hover:rotate-12 group-hover:shadow-emerald-600/50">
        <Radar className="size-4.5" />
      </span>
      <span className="font-semibold tracking-tight">{APP_NAME}</span>
    </div>
  );
}
