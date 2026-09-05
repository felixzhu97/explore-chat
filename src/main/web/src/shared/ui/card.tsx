import * as React from "react";

import { styled } from "@/src/shared/utils/emotion";

const CardRoot = styled.div`
  border-radius: var(--radius);
  border-width: 1px;
  border-style: solid;
  border-color: hsl(var(--border));
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  box-shadow: 0 1px 2px 0 rgb(15 23 42 / 0.05);
`;

const CardHeaderRoot = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.375rem;
  padding: 1.5rem;
`;

const CardTitleRoot = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const CardDescriptionRoot = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const CardContentRoot = styled.div`
  padding: 1.5rem;
  padding-top: 0;
`;

const CardFooterRoot = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  padding-top: 0;
`;

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardRoot ref={ref} className={className} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeaderRoot ref={ref} className={className} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardTitleRoot ref={ref} className={className} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardDescriptionRoot ref={ref} className={className} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContentRoot ref={ref} className={className} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooterRoot ref={ref} className={className} {...props} />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
