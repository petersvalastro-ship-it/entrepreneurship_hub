import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hubIdentity: "text-hub-header-foreground hover:bg-hub-header-foreground/10 focus-visible:ring-hub-header-foreground",
        hubPrimary: "bg-hub-cta text-hub-cta-foreground hover:bg-hub-cta-hover focus-visible:ring-hub-cta-foreground",
        hubOutline: "border border-hub-nav-border bg-hub-nav text-hub-nav-foreground hover:bg-hub-nav-hover hover:border-hub-indicator/50 focus-visible:ring-hub-indicator",
        hubLink: "text-hub-nav-muted hover:text-hub-nav-foreground hover:bg-hub-nav-hover focus-visible:ring-hub-indicator",
        hubNav: "group rounded-none border-b-2 border-transparent bg-transparent text-hub-nav-muted hover:text-hub-nav-foreground data-[active=true]:border-hub-indicator data-[active=true]:font-bold data-[active=true]:text-hub-nav-foreground focus-visible:ring-hub-indicator",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
