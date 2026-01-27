import { useRef, useState } from 'react'
import { useController, type Control, type FieldValues, type FieldPath } from 'react-hook-form'
import { Upload, X, FileVideo, ImageIcon, File as FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RHFFileUploadProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  accept?: string
  maxSize?: number // in MB
  type?: 'image' | 'video' | 'any'
  helperText?: string
  className?: string
}

export function RHFFileUpload<T extends FieldValues>({
  name,
  control,
  label,
  accept,
  maxSize = 10,
  type = 'any',
  helperText,
  className,
}: RHFFileUploadProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size too large. Max is ${maxSize}MB`)
        return
      }

      setFileName(file.name)
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file))
      } else {
        setPreview(null)
      }
      onChange(file)
    }
  }

  const removeFile = () => {
    setPreview(null)
    setFileName(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 group',
          value
            ? 'border-indigo-300 bg-indigo-50/30'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50',
          error && 'border-red-300 bg-red-50/30'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center gap-4">
            {preview ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-indigo-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-indigo-100 text-indigo-500">
                {type === 'video' ? (
                  <FileVideo className="w-8 h-8" />
                ) : (
                  <FileIcon className="w-8 h-8" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName || (value as File).name}
              </p>
              <p className="text-xs text-gray-500">
                {((value as File).size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2"
          >
            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-indigo-100 text-gray-400 group-hover:text-indigo-500 transition-colors">
              {type === 'image' ? (
                <ImageIcon className="w-5 h-5" />
              ) : type === 'video' ? (
                <FileVideo className="w-5 h-5" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Click to upload {type !== 'any' ? type : 'file'}
              </p>
              <p className="text-xs text-gray-400">Max size: {maxSize}MB</p>
            </div>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  )
}
