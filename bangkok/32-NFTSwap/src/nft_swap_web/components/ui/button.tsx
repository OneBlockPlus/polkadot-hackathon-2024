/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-10 00:11:53
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-17 21:20:40
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "px-6 py-2 bg-transparent border rounded-lg transform hover:scale-105 transition-transform duration-300 ",
  {
    variants: {
      variant: {
        default:
          "flex items-center px-4 py-2 px-6 py-2 bg-transparent border uppercase border-black dark:border-white dark:text-white text-black rounded-lg transform hover:-translate-y-1 transition duration-400",
        // default: "flex items-center px-4 py-2 rounded-md border border-3 border-white uppercase bg-purple-200 text-black-100  hover:-translate-y-1 transform transition duration-200 hover:shadow-md",
        dark:
          "flex items-center px-4 py-2 px-6 py-2 bg-transparent border uppercase border-black dark:border-black dark:text-black text-black rounded-lg transform hover:-translate-y-1 transition duration-400",

        destructive:
          "bg-red-400 text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input text-purple dark:text-black border-black dark:border-fuchsia",
        secondary: "bg-secondary text-secondary-foreground ",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
