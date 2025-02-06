"use client"

import React, { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { FilePond } from "react-filepond"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LoadingButton } from "./LoadingButton"
import { Input } from "./ui/input"
import { processStatement } from "../dashboard/_actions/process-statement"
import { UploadModal, type Stage } from "./UploadModal"

export const StatementUploader = () => {
  const router = useRouter()
  const pondRef = useRef<FilePond>(null)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState<Stage | null>(null)

  const handleFinishFileUpload = async (error: any, file: any) => {
    try {
      if (error) {
        const serverResponse = error.serverResponse || error.body
        const serverError = serverResponse ? JSON.parse(serverResponse) : null
        toast.error(serverError?.error || "File upload failed")
        setUploadStage(null)
        setIsFileUploading(false)
        return
      }

      if (!file?.serverId) {
        toast.error("Received empty response from server")
        setUploadStage(null)
        setIsFileUploading(false)
        return
      }

      const response = JSON.parse(file.serverId)
      console.log("Response:", response);
      
      if (response.error) {
        toast.error(response.error)
        setUploadStage(null)
      } else if (response.id === -1) {
        toast.error("Failed to create statement")
        setUploadStage(null)
      } else {
        setUploadStage("processing")
        const processResponse = await processStatement(response.id)
        setUploadStage("completed")
        
        // Redirect to details page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/${processResponse.data.id}`)
        }, 1000)
      }
    } catch (e) {
      console.error("Error processing response:", e)
      toast.error("Failed to process server response")
      setUploadStage(null)
    } finally {
      setIsFileUploading(false)
    }
  }
  
  const handleUploadClick = () => {
    pondRef.current?.browse()
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full gap-2">
        <LoadingButton
          type="button"
          isLoading={isFileUploading}
          loadingText="Uploading..."
          onClick={handleUploadClick}
          className="bg-black text-white hover:bg-black/80"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Statement
        </LoadingButton>
        <FilePond
          ref={pondRef}
          allowMultiple={false}
          maxParallelUploads={1}
          acceptedFileTypes={["application/pdf"]}
          server={{
            process: "/api/upload",
            fetch: null,
            revert: null,
          }}
          onprocessfile={handleFinishFileUpload}
          onprocessfileabort={() => {
            setIsFileUploading(false)
            setUploadStage(null)
          }}
          onaddfilestart={() => {
            setIsFileUploading(true)
            setUploadStage("uploading")
          }}
          className="hidden"
        />
      </div>

      <UploadModal 
        isOpen={uploadStage !== null}
        stage={uploadStage || "uploading"}
        onClose={() => {
          if (uploadStage === "completed") {
            setUploadStage(null)
          }
        }}
      />
    </div>
  )
}
