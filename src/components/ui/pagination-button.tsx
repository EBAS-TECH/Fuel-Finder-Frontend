import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { type ButtonProps } from "@/components/ui/button"

interface PaginationButtonProps {
  isActive?: boolean
  disabled?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

export function PaginationButton({
  isActive,
  disabled,
  size = "icon",
  className,
  onClick,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onClick && onClick()
      }}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export function PaginationNavButton({
  disabled,
  size = "icon",
  className,
  onClick,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <a
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onClick && onClick()
      }}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}
