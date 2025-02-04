'use client'

import { CardContainer } from '@/components/ui/containers/CardContainer'

interface SalesData {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_items: Array<{
    quantity: number
    price_at_time: number
    is_staff_drink: boolean
    menu_items: {
      name: string
      category_id: string
    }
  }>
}

interface SalesManagerProps {
  salesData: SalesData[]
}

export function SalesManager({ salesData }: SalesManagerProps) {
  // 売上集計の計算
  const calculateSalesSummary = () => {
    const total = salesData.reduce((sum, sale) => sum + sale.total_amount, 0)
    const itemSales = salesData.reduce((acc, sale) => {
      sale.order_items.forEach(item => {
        if (!item.is_staff_drink) {
          const itemName = item.menu_items.name
          acc[itemName] = (acc[itemName] || 0) + (item.price_at_time * item.quantity)
        }
      })
      return acc
    }, {} as Record<string, number>)
    
    return { total, itemSales }
  }

  const { total, itemSales } = calculateSalesSummary()

  return (
    <div className="space-y-4">
      <CardContainer>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">期間売上サマリー</h3>
          <div className="text-2xl font-bold mb-6">
            ¥{total.toLocaleString()}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">商品別売上</h4>
            {Object.entries(itemSales)
              .sort(([, a], [, b]) => b - a)
              .map(([itemName, amount]) => (
                <div key={itemName} className="flex justify-between items-center">
                  <span>{itemName}</span>
                  <span className="font-medium">¥{amount.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </CardContainer>

      <CardContainer>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">売上詳細</h3>
          <div className="space-y-4">
            {salesData.map((sale) => (
              <div key={sale.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(sale.created_at).toLocaleString()}
                    </div>
                    <div className="font-medium">
                      ¥{sale.total_amount.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {sale.order_items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>
                        {item.menu_items.name} × {item.quantity}
                        {item.is_staff_drink && (
                          <span className="text-gray-500 ml-2">(スタッフドリンク)</span>
                        )}
                      </span>
                      <span>¥{(item.price_at_time * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>
    </div>
  )
}