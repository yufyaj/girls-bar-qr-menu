import { ReactNode } from 'react'

interface CustomerLayoutProps {
  children: ReactNode
  tableId?: string
}

export default function CustomerLayout({ children, tableId }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">メニュー</h1>
            {tableId && (
              <div className="text-sm text-gray-600">
                テーブル: {tableId}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-sm text-gray-500">
            ご注文はスタッフが確認次第対応させていただきます
          </p>
        </div>
      </footer>
    </div>
  )
}
