import { useMemo, useState, useRef } from 'react'
import type { HeatmapEntry } from '@/features/dashboard'

/** Color intensity levels */
const COLORS = {
  empty: '#ebedf0',
  level1: '#9be9a8',
  level2: '#40c463',
  level3: '#30a14e',
  level4: '#216e39',
} as const

function getColor(count: number): string {
  if (count === 0) return COLORS.empty
  if (count <= 5) return COLORS.level1
  if (count <= 15) return COLORS.level2
  if (count <= 30) return COLORS.level3
  return COLORS.level4
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHOW_DAY_INDEXES = [1, 3, 5] // Mon, Wed, Fri

const CELL_SIZE = 14
const CELL_GAP = 3
const CELL_STEP = CELL_SIZE + CELL_GAP
const LABEL_WIDTH = 40
const TOP_PADDING = 24

interface HeatmapCalendarProps {
  data: HeatmapEntry[]
  isLoading?: boolean
}

interface CellData {
  date: string
  count: number
  col: number
  row: number
}

export function HeatmapCalendar({ data, isLoading = false }: HeatmapCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{
    text: string
    subtext: string
    x: number
    y: number
  } | null>(null)

  const countMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((entry) => map.set(entry.date, entry.count))
    return map
  }, [data])

  const { cells, monthLabels, totalWeeks } = useMemo(() => {
    const today = new Date()
    const cells: CellData[] = []

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)
    const dayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOfWeek)

    const totalDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalWeeks = Math.ceil(totalDays / 7)

    let lastMonth = -1
    const current = new Date(startDate)
    const rawMonthLabels: { label: string; col: number }[] = []

    for (let week = 0; week < totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        if (current > today) break

        const dateStr = current.toISOString().split('T')[0]
        const count = countMap.get(dateStr) || 0

        const month = current.getMonth()
        if (month !== lastMonth) {
          rawMonthLabels.push({ label: MONTHS[month], col: week })
          lastMonth = month
        }

        cells.push({ date: dateStr, count, col: week, row: day })
        current.setDate(current.getDate() + 1)
      }
    }

    // Ensure minimum spacing between month labels (in pixels)
    const MIN_LABEL_GAP = 36
    const spaced: { label: string; x: number }[] = []
    for (const m of rawMonthLabels) {
      const naturalX = LABEL_WIDTH + m.col * CELL_STEP
      const prevEnd = spaced.length > 0 ? spaced[spaced.length - 1].x + MIN_LABEL_GAP : -Infinity
      spaced.push({ label: m.label, x: Math.max(naturalX, prevEnd) })
    }

    return { cells, monthLabels: spaced, totalWeeks }
  }, [countMap])

  const getX = (col: number) => LABEL_WIDTH + col * CELL_STEP
  const getY = (row: number) => TOP_PADDING + row * CELL_STEP

  const svgWidth = LABEL_WIDTH + totalWeeks * CELL_STEP + 8
  const svgHeight = TOP_PADDING + 7 * CELL_STEP + 4

  const handleMouseEnter = (cell: CellData, e: React.MouseEvent<SVGRectElement>) => {
    const svgEl = (e.target as SVGRectElement).ownerSVGElement
    const containerEl = containerRef.current
    if (!svgEl || !containerEl) return

    const svgRect = svgEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()
    const scale = svgRect.width / svgWidth

    const cellCenterX = svgRect.left - containerRect.left + (getX(cell.col) + CELL_SIZE / 2) * scale
    const cellTopY = svgRect.top - containerRect.top + getY(cell.row) * scale

    setTooltip({
      text: `${cell.count} ${cell.count === 1 ? 'activity' : 'activities'}`,
      subtext: formatDate(cell.date),
      x: cellCenterX,
      y: cellTopY - 8,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-[160px] bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Responsive heatmap grid — scales to fit container */}
      <div>
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: 'block' }}
          role="img"
          aria-label="Learning activity heatmap showing daily contributions over the past year"
        >
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={`month-${i}`}
              x={m.x}
              y={14}
              fill="#656d76"
              fontSize="12"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels — only Mon, Wed, Fri */}
          {SHOW_DAY_INDEXES.map((i) => (
            <text
              key={`day-${i}`}
              x={0}
              y={getY(i) + CELL_SIZE - 2}
              fill="#656d76"
              fontSize="11"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {DAY_LABELS[i]}
            </text>
          ))}

          {/* Activity cells */}
          {cells.map((cell) => (
            <rect
              key={cell.date}
              x={getX(cell.col)}
              y={getY(cell.row)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              ry={3}
              fill={getColor(cell.count)}
              stroke="rgba(27,31,36,0.06)"
              strokeWidth={1}
              className="cursor-pointer"
              style={{ outline: 'none' }}
              onMouseEnter={(e) => handleMouseEnter(cell, e)}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg text-center whitespace-nowrap leading-relaxed">
            <div className="font-semibold">{tooltip.text}</div>
            <div className="text-gray-300 text-[11px]">{tooltip.subtext}</div>
          </div>
          <div className="flex justify-center -mt-px">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgb(31 41 55)',
              }}
            />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-[6px] mt-2 text-xs text-gray-500">
        <span>Less</span>
        {[COLORS.empty, COLORS.level1, COLORS.level2, COLORS.level3, COLORS.level4].map(
          (color, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: color,
                border: '1px solid rgba(27,31,36,0.06)',
              }}
            />
          )
        )}
        <span>More</span>
      </div>
    </div>
  )
}
