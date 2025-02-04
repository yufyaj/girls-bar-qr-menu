'use client'

import { CardContainer } from '@/components/ui/containers/CardContainer'

interface StaffDrink {
  staff_id: string
  staff: {
    name: string
  }
  order_items: {
    menu_items: {
      name: string
    }
    price_at_time: number
  }
  drink_date: string
}

interface StaffDrinksManagerProps {
  staffDrinks: StaffDrink[]
}

export function StaffDrinksManager({ staffDrinks }: StaffDrinksManagerProps) {
  // 店員ドリンク集計の計算
  const calculateStaffDrinksSummary = () => {
    return staffDrinks.reduce((acc, drink) => {
      const staffId = drink.staff_id
      if (!acc[staffId]) {
        acc[staffId] = {
          name: drink.staff.name,
          count: 0,
          total: 0,
          drinks: {} as Record<string, number>
        }
      }
      acc[staffId].count++
      acc[staffId].total += drink.order_items.price_at_time
      
      // ドリンクの種類ごとの集計
      const drinkName = drink.order_items.menu_items.name
      acc[staffId].drinks[drinkName] = (acc[staffId].drinks[drinkName] || 0) + 1
      
      return acc
    }, {} as Record<string, {
      name: string
      count: number
      total: number
      drinks: Record<string, number>
    }>)
  }

  const staffSummary = calculateStaffDrinksSummary()

  return (
    <div className="space-y-4">
      <CardContainer>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">店員ドリンク集計</h3>
          <div className="space-y-6">
            {Object.entries(staffSummary).map(([staffId, data]) => (
              <div key={staffId} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-lg">{data.name}</div>
                    <div className="text-sm text-gray-500">
                      合計: {data.count}杯 (¥{data.total.toLocaleString()})
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-1">ドリンク内訳:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.drinks).map(([drinkName, count]) => (
                      <div key={drinkName} className="flex justify-between">
                        <span>{drinkName}</span>
                        <span className="font-medium">{count}杯</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>

      <CardContainer>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">ドリンク履歴</h3>
          <div className="space-y-2">
            {staffDrinks.map((drink, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <div>
                  <div className="font-medium">{drink.staff.name}</div>
                  <div className="text-sm text-gray-500">
                    {drink.order_items.menu_items.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(drink.drink_date).toLocaleDateString()}
                  </div>
                  <div>¥{drink.order_items.price_at_time.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>
    </div>
  )
}