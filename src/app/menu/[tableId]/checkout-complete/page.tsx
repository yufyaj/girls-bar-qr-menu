import CustomerLayout from '@/components/layouts/CustomerLayout'

export default function CheckoutCompletePage() {
  return (
    <CustomerLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              お会計完了
            </h2>
            <div className="mt-8 text-center text-gray-600">
              <p className="mb-4">ご利用ありがとうございました。</p>
              <p>スタッフが伺いますので、<br />そのままお待ちください。</p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}