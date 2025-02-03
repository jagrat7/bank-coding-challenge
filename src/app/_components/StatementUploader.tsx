"use client"

import React, { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { FilePond } from "react-filepond"
import { toast } from "sonner"
import { LoadingButton } from "./LoadingButton"
import { Input } from "./ui/input"

export const StatementUploader = () => {
  const pondRef = useRef<FilePond>(null)
  const [isFileUploading, setIsFileUploading] = useState(false)

  const handleFinishFileUpload = (error: any, file: any) => {
    setIsFileUploading(false)

    try {
      if (error) {
        const serverResponse = error.serverResponse || error.body
        const serverError = serverResponse ? JSON.parse(serverResponse) : null
        toast.error(serverError?.error || "File upload failed")
        return
      }

      if (!file?.serverId) {
        toast.error("Received empty response from server")
        return
      }

      const response = JSON.parse(file.serverId)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success("File uploaded successfully")
      }
    } catch (e) {
      console.error("Error processing response:", e)
      toast.error("Failed to process server response")
    }
  }
  
  const handleUploadClick = () => {
    pondRef.current?.browse()
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full gap-2">
        {/* <Input
          type="file"
          accept=".pdf"
          onClick={(e) => {
            e.preventDefault()
            pondRef.current?.browse()
          }}
          className="max-w-sm"
          id="file-upload"
        /> */}
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
          allowMultiple={true}
          maxParallelUploads={10}
          acceptedFileTypes={["application/pdf"]}
          server={{
            process: "/api/upload",
            fetch: null,
            revert: null,
          }}
          onprocessfile={handleFinishFileUpload}
          onprocessfileabort={() => setIsFileUploading(false)}
          onaddfilestart={() => setIsFileUploading(true)}
          className="hidden"
        />
      </div>
    </div>
  )
}
