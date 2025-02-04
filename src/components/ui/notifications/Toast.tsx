import { Fragment, useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ToastProps {
  show: boolean
  type: 'success' | 'error'
  title: string
  message?: string
  onClose: () => void
  duration?: number
}

export function Toast({
  show,
  type,
  title,
  message,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [show, duration, onClose])

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-sm pb-4 sm:bottom-auto sm:right-0 sm:top-0 sm:pb-0 sm:pt-4 sm:pr-4">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {type === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">閉じる</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

export function useToast() {
  const [show, setShow] = useState(false)
  const [type, setType] = useState<'success' | 'error'>('success')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState<string | undefined>()

  const showToast = (props: Omit<ToastProps, 'show' | 'onClose'>) => {
    setType(props.type)
    setTitle(props.title)
    setMessage(props.message)
    setShow(true)
  }

  return {
    Toast: (
      <Toast
        show={show}
        type={type}
        title={title}
        message={message}
        onClose={() => setShow(false)}
      />
    ),
    showToast,
  }
}
