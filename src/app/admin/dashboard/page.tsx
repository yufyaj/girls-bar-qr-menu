import { getCurrentStoreId } from '@/app/actions/auth'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const storeId = await getCurrentStoreId()

  return <DashboardClient storeId={storeId} />
}
