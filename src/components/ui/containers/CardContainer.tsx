import { ReactNode } from 'react'

interface CardContainerProps {
  children: ReactNode
  className?: string
  title?: string
}

export function CardContainer({ children, className = '', title }: CardContainerProps) {
  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
      {title && (
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  )
}
