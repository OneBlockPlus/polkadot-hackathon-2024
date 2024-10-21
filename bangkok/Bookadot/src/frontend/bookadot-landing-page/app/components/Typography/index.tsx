import React, { ReactHTML, useMemo } from "react";
import { twMerge } from "tailwind-merge";

type TypographyProps<T extends keyof ReactHTML> = {
  component?: T;
  className?: string;
} & JSX.IntrinsicElements[T];

const Typography = <T extends keyof ReactHTML>({
  children,
  className,
  component,
  ...rest
}: React.PropsWithChildren<TypographyProps<T>>) => {
  return (
    <>
      {React.createElement(
        component || "p",
        {
          className: twMerge("font-normal text-white", className),
          ...rest,
        },
        children,
      )}
    </>
  );
};

export default Typography;
