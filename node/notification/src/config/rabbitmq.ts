export const QUEUE_CONFIG = {
  durable: true,
  arguments: {
    "x-delivery-limit": 5,
    "x-queue-type": "quorum",
    "x-dead-letter-routing-key": process.env.ERROR_Q,
    "x-dead-letter-exchange": process.env.ERROR_Q,
  },
};
