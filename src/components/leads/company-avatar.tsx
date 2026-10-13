"use client";

import Image from "next/image";
import { useState } from "react";

interface CompanyAvatarProps {
  domain: string;
  name: string;
}

export function CompanyAvatar({ domain, name }: CompanyAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-500 shadow-sm">
      {failed ? (
        name.charAt(0).toUpperCase()
      ) : (
        <Image
          src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
          alt=""
          width={20}
          height={20}
          unoptimized
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
