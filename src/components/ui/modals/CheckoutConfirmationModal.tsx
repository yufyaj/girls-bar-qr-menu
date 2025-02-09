"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { OrderDetail } from '@/types/order'

interface CheckoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  totalAmount?: number
  orderDetails?: OrderDetail[]
}

export function CheckoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  totalAmount,
  orderDetails = []
}: CheckoutConfirmationModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      お会計の確認
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="mt-2 space-y-4">
                        <div className="space-y-4">
                          {orderDetails.length > 0 && (
                            <div className="mt-4 flow-root">
                              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                  <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                      <tr>
                                        <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">商品名</th>
                                        <th scope="col" className="px-3 py-2 text-right text-sm font-semibold text-gray-900">数量</th>
                                        <th scope="col" className="px-3 py-2 text-right text-sm font-semibold text-gray-900">単価</th>
                                        <th scope="col" className="px-3 py-2 text-right text-sm font-semibold text-gray-900">小計</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {orderDetails.map((item, index) => (
                                        <tr key={index}>
                                          <td className="py-2 pl-4 pr-3 text-sm sm:pl-0">{item.name}</td>
                                          <td className="px-3 py-2 text-right text-sm text-gray-500">{item.quantity}</td>
                                          <td className="px-3 py-2 text-right text-sm text-gray-500">¥{item.price.toLocaleString()}</td>
                                          <td className="px-3 py-2 text-right text-sm text-gray-500">¥{item.subtotal.toLocaleString()}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                          {totalAmount !== undefined && (
                            <p className="text-2xl font-semibold text-gray-900 text-right">
                              合計: ¥{totalAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          お会計を確定してもよろしいですか？<br />
                          スタッフがご案内いたしますので、そのままお待ちください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 sm:col-start-2"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "処理中..." : "はい"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}