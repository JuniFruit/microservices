export const QUEUE_CONFIG = {
  durable: true,
  arguments: { "x-delivery-limit": 5, "x-queue-type": "quorum" },
};
