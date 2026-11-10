import { cn } from "@/lib/utils"
import { useRender } from "@base-ui/react/use-render"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"

const dialogContentVariants = cva(
  "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#1E3350] bg-[#13233C] p-6 shadow-[0_8px_30px_rgba(2,6,23,0.40)] duration-200",
  {
    variants: {
      size: {
        default: "max-w-lg",
        sm: "max-w-sm",
        lg: "max-w-2xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal

const DialogContent = ({ className, size, forwardedRef, ...props }: any) => {
  const render = useRender({props, ref:forwardedRef})
  
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#07111F]/80 backdrop-blur-sm" />
      <DialogPrimitive.Content
        {...render.props as any}
        className={cn(dialogContentVariants({ size }), className)}
      />
    </DialogPortal>
  )
}
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = ({ className, forwardedRef, ...props }: any) => {
  const render = useRender( {props, ref:forwardedRef})
  return (
    <DialogPrimitive.Title
      {...render.props as any}
      className={cn("font-[family-name:var(--font-space)] text-lg font-semibold leading-none tracking-tight text-[#F8FAFC]", className)}
    />
  )
}

const DialogDescription = ({ className, forwardedRef, ...props }: any) => {
  const render = useRender( {props, ref:forwardedRef})
  return (
    <DialogPrimitive.Description
      {...render.props as any}
      className={cn("text-sm text-[#94A3B8]", className)}
    />
  )
}

DialogTitle.displayName = "DialogTitle"
DialogDescription.displayName = "DialogDescription"

const DialogClose = DialogPrimitive.Close

export {
  Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogPortal,DialogTitle,DialogTrigger
}
