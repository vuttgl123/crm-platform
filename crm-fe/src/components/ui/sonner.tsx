import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group font-sans"
      icons={{
        success: <CircleCheck className="h-5 w-5 text-emerald-600 shrink-0" />,
        info: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
        warning: <TriangleAlert className="h-5 w-5 text-amber-600 shrink-0" />,
        error: <OctagonX className="h-5 w-5 text-rose-600 shrink-0" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin text-slate-600 shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border group-[.toaster]:shadow-lg rounded-[8px] p-4 text-sm font-sans",
          success:
            "!bg-[#ECFDF5] !border-[#A7F3D0] !text-[#065F46] [&_[data-title]]:!text-[#065F46] [&_[data-title]]:!font-bold [&_[data-description]]:!text-[#047857]",
          error:
            "!bg-[#FEF2F2] !border-[#FECACA] !text-[#991B1B] [&_[data-title]]:!text-[#991B1B] [&_[data-title]]:!font-bold [&_[data-description]]:!text-[#B91C1C]",
          warning:
            "!bg-[#FFFBEB] !border-[#FDE68A] !text-[#92400E] [&_[data-title]]:!text-[#92400E] [&_[data-title]]:!font-bold [&_[data-description]]:!text-[#B45309]",
          info:
            "!bg-[#EFF6FF] !border-[#BFDBFE] !text-[#1E40AF] [&_[data-title]]:!text-[#1E40AF] [&_[data-title]]:!font-bold [&_[data-description]]:!text-[#1D4ED8]",
          description: "text-xs font-normal mt-0.5",
          title: "text-sm font-bold",
          actionButton:
            "group-[.toast]:bg-emerald-700 group-[.toast]:text-white rounded-[4px] text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 rounded-[4px] text-xs font-medium",
          closeButton:
            "!bg-white/80 !border !border-emerald-200 !text-emerald-800 hover:!bg-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
