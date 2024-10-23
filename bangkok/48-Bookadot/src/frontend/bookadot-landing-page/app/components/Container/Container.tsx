import React, { ReactNode } from "react";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`container lg:max-w-[1280px!important] ${className ?? ""}`}>
      {children}
    </div>
  );
}
