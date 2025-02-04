import { ReactNode } from 'react'

interface CardContainerProps {
  children: ReactNode
  className?: string
}

export function CardContainer({ children, className = '' }: CardContainerProps) {
  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
      {children}
    </div>
  )
}
