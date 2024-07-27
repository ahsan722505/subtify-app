import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore, { AlphabetCase } from '@renderer/store/store'
import clsx from 'clsx'

export default function AlphabetCasing(): JSX.Element {
  const alphabetCase = useProjectStore((state) => state.alphabetCase)
  const setAlphabetCase = useAppStore((state) => state.setAlphabetCase)

  return (
    <div className="h-10 rounded-md border border-gray-300 flex justify-between items-center px-3 grow">
      <span
        className={clsx(
          'cursor-pointer hover:bg-gray-300 px-2 rounded-md',
          !alphabetCase && 'bg-gray-300'
        )}
        onClick={() => setAlphabetCase(null)}
      >
        -
      </span>
      <span
        className={clsx(
          'cursor-pointer hover:bg-gray-300 px-1 rounded-md',
          alphabetCase === AlphabetCase.CAPITALIZE && 'bg-gray-300'
        )}
        onClick={() => setAlphabetCase(AlphabetCase.CAPITALIZE)}
      >
        Ab
      </span>
      <span
        className={clsx(
          'cursor-pointer hover:bg-gray-300 px-1 rounded-md',
          alphabetCase === AlphabetCase.UPPERCASE && 'bg-gray-300'
        )}
        onClick={() => setAlphabetCase(AlphabetCase.UPPERCASE)}
      >
        AB
      </span>
      <span
        className={clsx(
          'cursor-pointer hover:bg-gray-300 px-1 rounded-md',
          alphabetCase === AlphabetCase.LOWERCASE && 'bg-gray-300'
        )}
        onClick={() => setAlphabetCase(AlphabetCase.LOWERCASE)}
      >
        ab
      </span>
    </div>
  )
}
