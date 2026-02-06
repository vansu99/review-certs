import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const ErrorTrigger = () => {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('Đây là một lỗi thử nghiệm để kiểm tra Error Boundary!')
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-8">
      <h3 className="text-red-800 font-semibold mb-2">Khu vực thử nghiệm lỗi</h3>
      <p className="text-sm text-red-600 mb-4">
        Nhấn vào nút bên dưới để gây ra một lỗi runtime và kiểm tra Error Boundary.
      </p>
      <Button variant="destructive" onClick={() => setShouldThrow(true)}>
        Gây lỗi ngay!
      </Button>
    </div>
  )
}
