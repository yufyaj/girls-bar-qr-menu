/**
 * 注文ステータスの定義
 */
export const OrderStatus = {
  PENDING: 'pending',    // 注文受付待ち
  ACCEPTED: 'accepted',  // 注文受付済み
  COMPLETED: 'completed', // 提供完了
  CANCELED: 'canceled',  // キャンセル
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

/**
 * 注文ステータスの表示名を取得する
 */
export const getStatusLabel = (status: OrderStatusType): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return '受付待ち';
    case OrderStatus.ACCEPTED:
      return '受付済み';
    case OrderStatus.COMPLETED:
      return '完了';
    case OrderStatus.CANCELED:
      return 'キャンセル';
    default:
      return '不明';
  }
};

/**
 * 注文ステータスの色を取得する（Tailwind CSS用）
 */
export const getStatusColor = (status: OrderStatusType): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-200 text-yellow-800';
    case OrderStatus.ACCEPTED:
      return 'bg-blue-200 text-blue-800';
    case OrderStatus.COMPLETED:
      return 'bg-green-200 text-green-800';
    case OrderStatus.CANCELED:
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

/**
 * 次のステータスを取得する
 * PENDINGの場合はACCEPTED
 * ACCEPTEDの場合はCOMPLETED
 * それ以外の場合は現在のステータスを返す
 */
export const getNextStatus = (status: OrderStatusType): OrderStatusType => {
  switch (status) {
    case OrderStatus.PENDING:
      return OrderStatus.ACCEPTED;
    case OrderStatus.ACCEPTED:
      return OrderStatus.COMPLETED;
    default:
      return status;
  }
};