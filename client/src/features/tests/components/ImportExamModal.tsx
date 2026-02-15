import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RHFInput, RHFSelect } from '@/components/ui/form'
import { useCategories } from '@/features/categories'
import { testService } from '../services/testService'
import { parseExamFile, transformToQuestions, downloadTemplate } from '../utils/examImportUtils'
import type { ImportRow, ImportError } from '../utils/examImportUtils'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

// ============================================================
// Schema & Types
// ============================================================

const importExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  categoryId: z.string().min(1, 'Category is required'),
  duration: z.string().min(1, 'Duration is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  passingScore: z.string().min(1, 'Passing score is required'),
})

type ImportExamFormValues = z.infer<typeof importExamSchema>

interface ImportExamModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId?: string
}

// ============================================================
// Component
// ============================================================

export const ImportExamModal = ({ isOpen, onClose, categoryId }: ImportExamModalProps) => {
  const { data: categories } = useCategories()
  const queryClient = useQueryClient()

  // Steps: 1 = upload + exam info, 2 = preview
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ImportRow[]>([])
  const [parseErrors, setParseErrors] = useState<ImportError[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ImportExamFormValues>({
    resolver: zodResolver(importExamSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: categoryId || '',
      duration: '60',
      difficulty: 'Beginner',
      passingScore: '70',
    },
    mode: 'onChange',
  })

  // ----------------------------------------------------------
  // File handling
  // ----------------------------------------------------------

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      setFileError('Please upload an Excel (.xlsx, .xls) or CSV file')
      return
    }

    setFile(selectedFile)
    setFileError(null)
    setIsParsing(true)

    try {
      const result = await parseExamFile(selectedFile)
      setParsedRows(result.rows)
      setParseErrors(result.errors)
    } catch (err) {
      setFileError((err as Error).message)
      setParsedRows([])
      setParseErrors([])
    } finally {
      setIsParsing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) handleFileSelect(selectedFile)
    },
    [handleFileSelect]
  )

  const removeFile = useCallback(() => {
    setFile(null)
    setParsedRows([])
    setParseErrors([])
    setFileError(null)
  }, [])

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const canGoToStep2 = file && parsedRows.length > 0 && isValid

  const goToPreview = handleSubmit(() => {
    if (canGoToStep2) setStep(2)
  })

  // ----------------------------------------------------------
  // Import
  // ----------------------------------------------------------

  const onImport = handleSubmit(async (data) => {
    if (parseErrors.length > 0) {
      toast.error('Please fix all validation errors before importing')
      return
    }

    setIsImporting(true)
    try {
      const questions = transformToQuestions(parsedRows)

      await testService.importExam({
        categoryId: data.categoryId,
        title: data.title,
        description: data.description || '',
        duration: Number(data.duration),
        difficulty: data.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
        passingScore: Number(data.passingScore),
        questions,
      })

      toast.success(`Exam imported successfully with ${questions.length} questions!`)
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      handleClose()
    } catch (err) {
      toast.error(`Import failed: ${(err as Error).message}`)
    } finally {
      setIsImporting(false)
    }
  })

  // ----------------------------------------------------------
  // Close & reset
  // ----------------------------------------------------------

  const handleClose = useCallback(() => {
    setStep(1)
    setFile(null)
    setParsedRows([])
    setParseErrors([])
    setFileError(null)
    setIsParsing(false)
    setIsImporting(false)
    reset()
    onClose()
  }, [onClose, reset])

  // ----------------------------------------------------------
  // Error helpers
  // ----------------------------------------------------------

  const errorsForRow = (rowNum: number) => parseErrors.filter((e) => e.row === rowNum)
  const validCount = parsedRows.length - new Set(parseErrors.map((e) => e.row)).size
  const hasErrors = parseErrors.length > 0

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl p-0 bg-white overflow-hidden sm:max-w-3xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Import Exam from Excel
          </DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            <StepBadge num={1} label="Upload & Info" active={step === 1} done={step > 1} />
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <StepBadge num={2} label="Preview & Import" active={step === 2} done={false} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[min(80vh,650px)]">
          <div className="px-6 pb-2">
            {step === 1 ? (
              <div className="space-y-5 py-4">
                {/* Download template */}
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download the template to see the required format</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Template
                  </Button>
                </div>

                {/* Drag & drop file upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload Excel File <span className="text-red-500">*</span>
                  </label>
                  {!file ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                        ${isDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                      `}
                    >
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload
                        className={`w-10 h-10 mx-auto mb-3 ${isDragOver ? 'text-indigo-500' : 'text-gray-300'}`}
                      />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-indigo-600">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Excel (.xlsx, .xls) or CSV files</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FileSpreadsheet className="w-8 h-8 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {isParsing ? (
                            <span className="text-indigo-600 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Parsing...
                            </span>
                          ) : (
                            <>
                              {parsedRows.length} questions found
                              {hasErrors && (
                                <span className="text-red-500 ml-2">
                                  • {parseErrors.length} errors
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                      <button onClick={removeFile} className="p-1 hover:bg-gray-200 rounded">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                  {fileError && (
                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fileError}
                    </p>
                  )}
                </div>

                {/* Exam info form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <RHFInput
                      name="title"
                      control={control}
                      label="Exam Title"
                      maxLength={191}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>

                  <RHFSelect
                    name="categoryId"
                    control={control}
                    label="Category"
                    placeholder="Select a category"
                    options={
                      categories?.map((cat) => ({
                        label: `${cat.icon} ${cat.name}`,
                        value: cat.id,
                      })) || []
                    }
                  />

                  <RHFInput
                    name="duration"
                    control={control}
                    label="Duration (minutes)"
                    type="number"
                    placeholder="60"
                  />

                  <RHFSelect
                    name="difficulty"
                    control={control}
                    label="Difficulty"
                    options={[
                      { label: '🟢 Beginner', value: 'Beginner' },
                      { label: '🟡 Intermediate', value: 'Intermediate' },
                      { label: '🔴 Advanced', value: 'Advanced' },
                    ]}
                  />

                  <RHFInput
                    name="passingScore"
                    control={control}
                    label="Passing Score (%)"
                    type="number"
                    placeholder="70"
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...control.register('description')}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none text-sm"
                      placeholder="Provide a brief description of the exam..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Preview */
              <div className="space-y-4 py-4">
                {/* Summary */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border ${hasErrors ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                >
                  {hasErrors ? (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  )}
                  <div className="text-sm">
                    <p
                      className={
                        hasErrors ? 'text-red-700 font-medium' : 'text-green-700 font-medium'
                      }
                    >
                      {hasErrors
                        ? `${parseErrors.length} validation error(s) found`
                        : `All ${parsedRows.length} questions are valid`}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {validCount} valid / {parsedRows.length} total questions
                    </p>
                  </div>
                </div>

                {/* Preview table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-10">
                            #
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                            Question
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-20">
                            Type
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-20">
                            Options
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-20">
                            Answer
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-16">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((row, idx) => {
                          const rowNum = idx + 2
                          const rowErrors = errorsForRow(rowNum)
                          const isError = rowErrors.length > 0

                          const optionCount = [
                            row.option_a,
                            row.option_b,
                            row.option_c,
                            row.option_d,
                            row.option_e,
                            row.option_f,
                          ].filter(Boolean).length

                          return (
                            <tr
                              key={idx}
                              className={`border-b last:border-0 ${isError ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                            >
                              <td className="px-3 py-2 text-gray-500">
                                {row.question_number || idx + 1}
                              </td>
                              <td className="px-3 py-2">
                                <p className="text-gray-900 line-clamp-2">{row.question_content}</p>
                                {isError && (
                                  <div className="mt-1 space-y-0.5">
                                    {rowErrors.map((err, ei) => (
                                      <p
                                        key={ei}
                                        className="text-xs text-red-500 flex items-center gap-1"
                                      >
                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                        {err.message}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                                    row.question_type === 'single'
                                      ? 'bg-blue-100 text-blue-700'
                                      : row.question_type === 'multiple'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {row.question_type || '?'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-600">{optionCount}</td>
                              <td className="px-3 py-2">
                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  {row.correct_answer}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {isError ? (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 gap-2">
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={goToPreview}
                disabled={!canGoToStep2 || isParsing}
                className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              >
                Preview
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={onImport}
                disabled={isImporting || hasErrors}
                className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {parsedRows.length} Questions
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Sub-components
// ============================================================

function StepBadge({
  num,
  label,
  active,
  done,
}: {
  num: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-sm ${active ? 'text-indigo-600 font-medium' : done ? 'text-green-600' : 'text-gray-400'}`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          active
            ? 'bg-indigo-600 text-white'
            : done
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-400'
        }`}
      >
        {done ? '✓' : num}
      </span>
      {label}
    </div>
  )
}
