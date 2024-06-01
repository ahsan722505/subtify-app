import React from 'react'

export const useDebouncedCallback = <P extends unknown[]>(
  callback: (...args: P) => void,
  delay: number = 500
): ((...args: P) => void) => {
  const timerRef = React.useRef<NodeJS.Timeout>()

  const handler = (...args: P): void => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => callback(...args), delay)
  }

  return handler
}
