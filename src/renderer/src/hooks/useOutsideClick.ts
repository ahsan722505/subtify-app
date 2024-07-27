import React from 'react'

export default function useOutsideClick(ref, callback, excludeClassnames: string[] = []): void {
  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event): void {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        !excludeClassnames.some((classname) => event.target.closest(`.${classname}`))
      ) {
        callback()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])
}
