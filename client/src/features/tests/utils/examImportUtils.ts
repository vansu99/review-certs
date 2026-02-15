import * as XLSX from 'xlsx'
import type { ImportQuestion, ImportOption } from '@/types'

// ============================================================
// Types
// ============================================================

export interface ImportRow {
  question_number: number
  question_content: string
  question_type: string
  explanation?: string
  option_a: string
  option_b: string
  option_c?: string
  option_d?: string
  option_e?: string
  option_f?: string
  correct_answer: string
}

export interface ImportError {
  row: number
  field: string
  message: string
}

export interface ParseResult {
  rows: ImportRow[]
  errors: ImportError[]
}

// ============================================================
// Constants
// ============================================================

const EXPECTED_HEADERS = [
  'question_number',
  'question_content',
  'question_type',
  'explanation',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option_e',
  'option_f',
  'correct_answer',
]

const OPTION_KEYS = [
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option_e',
  'option_f',
] as const
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

// ============================================================
// Parse Excel/CSV file
// ============================================================

export async function parseExamFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Read first sheet
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          reject(new Error('File is empty or has no sheets'))
          return
        }

        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
        })

        if (jsonData.length === 0) {
          reject(new Error('No data rows found in the file'))
          return
        }

        // Validate headers
        const firstRow = jsonData[0]
        const actualHeaders = Object.keys(firstRow).map((h) => h.toLowerCase().trim())
        const REQUIRED_HEADERS = [
          'question_number',
          'question_content',
          'question_type',
          'option_a',
          'option_b',
          'correct_answer',
        ]
        const missingHeaders = REQUIRED_HEADERS.filter((h) => !actualHeaders.includes(h))

        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`))
          return
        }

        // Check for unrecognized columns
        const unrecognizedHeaders = actualHeaders.filter((h) => !EXPECTED_HEADERS.includes(h))
        if (unrecognizedHeaders.length > 0) {
          reject(
            new Error(
              `Unrecognized columns: ${unrecognizedHeaders.join(', ')}. Expected columns: ${EXPECTED_HEADERS.join(', ')}`
            )
          )
          return
        }

        // Map to ImportRow[]
        const rows: ImportRow[] = jsonData.map((row) => {
          const normalizedRow: Record<string, unknown> = {}
          Object.entries(row).forEach(([key, value]) => {
            normalizedRow[key.toLowerCase().trim()] = value
          })

          return {
            question_number: Number(normalizedRow['question_number']) || 0,
            question_content: String(normalizedRow['question_content'] || '').trim(),
            question_type: String(normalizedRow['question_type'] || '')
              .trim()
              .toLowerCase(),
            explanation: String(normalizedRow['explanation'] || '').trim(),
            option_a: String(normalizedRow['option_a'] || '').trim(),
            option_b: String(normalizedRow['option_b'] || '').trim(),
            option_c: String(normalizedRow['option_c'] || '').trim(),
            option_d: String(normalizedRow['option_d'] || '').trim(),
            option_e: String(normalizedRow['option_e'] || '').trim(),
            option_f: String(normalizedRow['option_f'] || '').trim(),
            correct_answer: String(normalizedRow['correct_answer'] || '')
              .trim()
              .toUpperCase(),
          }
        })

        // Validate
        const errors = validateImportData(rows)
        resolve({ rows, errors })
      } catch (err) {
        reject(new Error(`Failed to parse file: ${(err as Error).message}`))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// ============================================================
// Validate parsed data
// ============================================================

export function validateImportData(rows: ImportRow[]): ImportError[] {
  const errors: ImportError[] = []

  // Track question content for duplicate detection
  const seenQuestions = new Map<string, number>() // content -> first row number

  rows.forEach((row, index) => {
    const rowNum = index + 2 // +2 because row 1 is header, data starts at row 2

    // Validate question_number format
    if (row.question_number !== 0 && !Number.isInteger(row.question_number)) {
      errors.push({
        row: rowNum,
        field: 'question_number',
        message: `Question number must be an integer, got "${row.question_number}"`,
      })
    } else if (row.question_number < 0) {
      errors.push({
        row: rowNum,
        field: 'question_number',
        message: `Question number must be positive, got "${row.question_number}"`,
      })
    }

    // Required: question_content
    if (!row.question_content) {
      errors.push({
        row: rowNum,
        field: 'question_content',
        message: 'Question content is required',
      })
    } else {
      // Check for duplicate question content
      const normalizedContent = row.question_content.toLowerCase().trim()
      const firstOccurrence = seenQuestions.get(normalizedContent)
      if (firstOccurrence !== undefined) {
        errors.push({
          row: rowNum,
          field: 'question_content',
          message: `Duplicate question — same content as row ${firstOccurrence}`,
        })
      } else {
        seenQuestions.set(normalizedContent, rowNum)
      }
    }

    // Required: question_type must be 'single' or 'multiple'
    if (!row.question_type) {
      errors.push({
        row: rowNum,
        field: 'question_type',
        message: 'Question type is required',
      })
    } else if (!['single', 'multiple'].includes(row.question_type)) {
      errors.push({
        row: rowNum,
        field: 'question_type',
        message: `Question type must be "single" or "multiple", got "${row.question_type}"`,
      })
    }

    // Required: at least 2 options (A and B)
    if (!row.option_a) {
      errors.push({ row: rowNum, field: 'option_a', message: 'Option A is required' })
    }
    if (!row.option_b) {
      errors.push({ row: rowNum, field: 'option_b', message: 'Option B is required' })
    }

    // Validate correct_answer format and references
    if (!row.correct_answer) {
      errors.push({ row: rowNum, field: 'correct_answer', message: 'Correct answer is required' })
    } else {
      const rawAnswers = row.correct_answer.split(',').map((a) => a.trim())
      const availableOptions = getAvailableOptionLabels(row)

      // Check for empty entries (e.g., trailing commas like "A,B,")
      const emptyEntries = rawAnswers.filter((a) => a === '')
      if (emptyEntries.length > 0) {
        errors.push({
          row: rowNum,
          field: 'correct_answer',
          message: 'Correct answer has empty entries — check for trailing commas',
        })
      }

      const answers = rawAnswers.filter((a) => a !== '')

      // Check for duplicate answer labels (e.g., "A,A")
      const uniqueAnswers = new Set(answers)
      if (uniqueAnswers.size !== answers.length) {
        errors.push({
          row: rowNum,
          field: 'correct_answer',
          message: 'Correct answer contains duplicate labels',
        })
      }

      for (const answer of answers) {
        if (!OPTION_LABELS.includes(answer as (typeof OPTION_LABELS)[number])) {
          errors.push({
            row: rowNum,
            field: 'correct_answer',
            message: `Invalid answer "${answer}". Must be one of: A, B, C, D, E, F`,
          })
        } else if (!availableOptions.includes(answer)) {
          errors.push({
            row: rowNum,
            field: 'correct_answer',
            message: `Answer "${answer}" references an empty option`,
          })
        }
      }

      // Single type should have exactly 1 correct answer
      if (row.question_type === 'single' && answers.length > 1) {
        errors.push({
          row: rowNum,
          field: 'correct_answer',
          message: 'Single-choice question must have exactly 1 correct answer',
        })
      }

      // Multiple type should have at least 2 correct answers
      if (row.question_type === 'multiple' && answers.length < 2) {
        errors.push({
          row: rowNum,
          field: 'correct_answer',
          message: 'Multiple-choice question must have at least 2 correct answers',
        })
      }
    }
  })

  return errors
}

// ============================================================
// Transform to API payload
// ============================================================

export function transformToQuestions(rows: ImportRow[]): ImportQuestion[] {
  return rows.map((row) => {
    const correctAnswers = row.correct_answer.split(',').map((a) => a.trim().toUpperCase())

    const options: ImportOption[] = OPTION_KEYS.map((key, idx) => {
      const content = row[key]
      if (!content) return null
      return {
        content,
        isCorrect: correctAnswers.includes(OPTION_LABELS[idx]),
      }
    }).filter((opt): opt is ImportOption => opt !== null)

    return {
      content: row.question_content,
      type: row.question_type as 'single' | 'multiple',
      explanation: row.explanation || undefined,
      options,
    }
  })
}

// ============================================================
// Generate template file for download
// ============================================================

export function downloadTemplate() {
  const templateData = [
    {
      question_number: 1,
      question_content: 'What is JavaScript?',
      question_type: 'single',
      explanation: 'JavaScript is a programming language used for web development',
      option_a: 'A programming language',
      option_b: 'A markup language',
      option_c: 'A database',
      option_d: 'An operating system',
      option_e: '',
      option_f: '',
      correct_answer: 'A',
    },
    {
      question_number: 2,
      question_content: 'Which of the following are JavaScript data types? (Select all that apply)',
      question_type: 'multiple',
      explanation: 'String, Number, and Boolean are all primitive data types in JavaScript',
      option_a: 'String',
      option_b: 'Number',
      option_c: 'Boolean',
      option_d: 'Float',
      option_e: '',
      option_f: '',
      correct_answer: 'A,B,C',
    },
    {
      question_number: 3,
      question_content: 'What does DOM stand for?',
      question_type: 'single',
      explanation: 'DOM stands for Document Object Model',
      option_a: 'Document Object Model',
      option_b: 'Data Object Model',
      option_c: 'Document Oriented Model',
      option_d: 'Data Oriented Markup',
      option_e: '',
      option_f: '',
      correct_answer: 'A',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(templateData)

  // Set column widths
  ws['!cols'] = [
    { wch: 18 }, // question_number
    { wch: 60 }, // question_content
    { wch: 16 }, // question_type
    { wch: 60 }, // explanation
    { wch: 30 }, // option_a
    { wch: 30 }, // option_b
    { wch: 30 }, // option_c
    { wch: 30 }, // option_d
    { wch: 20 }, // option_e
    { wch: 20 }, // option_f
    { wch: 16 }, // correct_answer
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Questions')
  XLSX.writeFile(wb, 'exam_import_template.xlsx')
}

// ============================================================
// Helpers
// ============================================================

function getAvailableOptionLabels(row: ImportRow): string[] {
  const labels: string[] = []
  if (row.option_a) labels.push('A')
  if (row.option_b) labels.push('B')
  if (row.option_c) labels.push('C')
  if (row.option_d) labels.push('D')
  if (row.option_e) labels.push('E')
  if (row.option_f) labels.push('F')
  return labels
}
