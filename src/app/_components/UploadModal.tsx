"use client"

import React from "react"
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Progress } from "./ui/progress"
import { CheckCircle2, Loader2, Upload } from "lucide-react"
import { cn } from "~/lib/utils"

export type Stage = "uploading" | "processing" | "completed"

interface UploadModalProps {
  isOpen: boolean
  stage: Stage
  onClose: () => void
}

const stages: { key: Stage; label: string; getIcon: (isActive: boolean) => React.ReactNode }[] = [
  {
    key: "uploading",
    label: "Uploading Statement",
    getIcon: (isActive) => {
      if (isActive) {
        return <Loader2 className={cn("h-5 w-5", isActive && "animate-spin")} />
      } else {
        return <Upload className={cn("h-5 w-5 text-green-500", isActive && "animate-spin")} />
      }
    },
  },
  {
    key: "processing",
    label: "Processing Statement",
    getIcon: (isActive) => {
      if (isActive) {
        return <Loader2 className={cn("h-5 w-5", isActive && "animate-spin")} />
      } else {
        return <CheckCircle2 className={cn("h-5 w-5 text-green-500", isActive && "animate-spin")} />
      }
    },
  },
]

export function UploadModal({ isOpen, stage, onClose }: UploadModalProps) {
  const currentStageIndex = stages.findIndex((s) => s.key === stage)
  const progress = Math.round(((currentStageIndex + 1) / stages.length) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-medium">Statement Upload Progress</DialogTitle>
        <div className="space-y-6 py-6">

          <div className="space-y-4">
            {stages.map((s, index) => {
              const isActive = index === currentStageIndex
              const isCompleted = index < currentStageIndex

              return (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4",
                    isActive && "border-black bg-gray-50",
                    isCompleted && "border-green-500 bg-green-50"
                  )}
                >
                  {s.getIcon(isActive)}
                  <span
                    className={cn(
                      "font-medium",
                      isActive && "text-black",
                      isCompleted && "text-green-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
