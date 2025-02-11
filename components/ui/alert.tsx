import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        {
          "bg-destructive/15 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive":
            variant === "destructive",
        },
        className
      )}
      {...props}
    />
  )
}

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>

Alert.Title = function AlertTitle({
  className,
  ...props
}: AlertTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

Alert.Description = function AlertDescription({
  className,
  ...props
}: AlertDescriptionProps) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export function ErrorAlert({
  title,
  description,
  className,
  ...props
}: {
  title: string
  description: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Alert variant="destructive" className={cn("flex items-start gap-4", className)} {...props}>
      <AlertCircle className="h-5 w-5" />
      <div>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{description}</Alert.Description>
      </div>
    </Alert>
  )
}