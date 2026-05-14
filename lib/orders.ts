import { DeliveryType } from "@prisma/client";

export function getAutoReleaseAt(deliveryType: DeliveryType, deliveredAt = new Date()) {
  const hours = deliveryType === "AUTOMATIC" ? 24 : 72;
  return new Date(deliveredAt.getTime() + hours * 60 * 60 * 1000);
}
