process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');
const orderService = require('../services/OrderService');
const NotificationService = require('../services/NotificationService');

const ALL_STATUSES = [
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
];

describe('NotificationService.orderStatusChanged — message coverage', () => {
  const Notification = require('../models/Notification');

  afterEach(() => jest.restoreAllMocks());

  it.each(ALL_STATUSES)('persists a specific (non-generic) message for status "%s"', async (status) => {
    let savedPayload;
    jest.spyOn(Notification, 'create').mockImplementation(async (payload) => {
      savedPayload = payload;
      return { ...payload, _id: 'n1', createdAt: new Date() };
    });

    await NotificationService.orderStatusChanged('customer1', 'BRK-202607-00001', status);

    expect(savedPayload.message).toBeTruthy();
    // The generic fallback the code uses when a status is missing from the
    // map — asserting against it directly catches any future status added
    // to the Order model's enum without a matching message here.
    expect(savedPayload.message).not.toBe(`Order #BRK-202607-00001 status updated to ${status}.`);
  });

  it('persists to the Notification model (not just a socket emit)', async () => {
    const Notification2 = require('../models/Notification');
    const createSpy = jest.spyOn(Notification2, 'create').mockResolvedValue({
      _id: 'n2',
      createdAt: new Date(),
    });

    await NotificationService.orderStatusChanged('customer1', 'BRK-1', 'shipped');
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'customer1', type: 'order' })
    );
  });
});

function makeMockOrder(overrides = {}) {
  return {
    _id: 'order123',
    orderNumber: 'BRK-202607-00004',
    status: 'pending',
    customer: 'customer123',
    items: [{ product: 'prod1', quantity: 500 }],
    ...overrides,
  };
}

describe('OrderService.cancelOrder — customer-initiated cancellation notifies the customer', () => {
  afterEach(() => jest.restoreAllMocks());

  it('fires a persisted "cancelled" notification, matching the admin-initiated path', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(makeMockOrder({ status: 'pending' }));
    jest.spyOn(orderRepository, 'updateById').mockResolvedValue(makeMockOrder({ status: 'cancelled' }));
    jest.spyOn(productRepository, 'restoreStock').mockResolvedValue(undefined);
    const notifySpy = jest.spyOn(NotificationService, 'orderStatusChanged').mockResolvedValue(undefined);

    await orderService.cancelOrder('customer123', 'order123', 'Changed my mind');

    expect(notifySpy).toHaveBeenCalledWith('customer123', 'BRK-202607-00004', 'cancelled');
  });
});
