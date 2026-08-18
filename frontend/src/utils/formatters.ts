/**
 * Formats financial amounts professionally with 2 decimal places and comma thousand separators.
 * Example: 250000 -> "250,000.00"
 */
export const formatAmount = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0.00'
  const num = typeof val === 'number' ? val : parseFloat(String(val))
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Safely parses any value to float number without NaN or string concatenation bugs.
 */
export const parseNumber = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0
  const num = typeof val === 'number' ? val : parseFloat(String(val))
  return isNaN(num) ? 0 : num
}
