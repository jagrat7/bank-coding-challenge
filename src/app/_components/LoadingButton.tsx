import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"

interface LoadingButtonProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline"
  type?: "submit" | "button"
  className?: string
  onClick?: () => void
}

export function LoadingButton({ 
  isLoading, 
  loadingText = "Sending...",
  children,
  variant = "secondary",
  type = "submit",
  onClick,
  className
  
}: LoadingButtonProps) {
  return (
    <Button className={className} variant={variant} type={type} disabled={isLoading} onClick={onClick}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : children}
    </Button>
  )
}
