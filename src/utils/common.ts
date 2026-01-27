import { formatDate } from 'date-fns'

export const getFormattedDate = (date?: Date) => {
  if (!date) return ''
  return formatDate(date, 'yyyy/MM/dd')
}
