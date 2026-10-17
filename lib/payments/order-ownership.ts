export function isOrderOwnedByUser(orderUserId: string | null, userId: string | null) {
  return Boolean(orderUserId && userId && orderUserId === userId);
}
