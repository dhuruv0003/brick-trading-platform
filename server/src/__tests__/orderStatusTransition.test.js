process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const orderRepository = require('../repositories/OrderRepository');
const orderService = require('../services/OrderService');
const AppError = require('../utils/AppError');

// NotificationService/mailer fire-and-forget side effects on status change —
// stub them out so this test only exercises the transition logic itself.
jest.mock('../services/NotificationService', () => ({
  orderStatusChanged: jest.fn().mockResolvedValue(undefined),
  orderPlaced: jest.fn().mockResolvedValue(undefined),
}));

function makeMockOrder(overrides = {}) {
  return {
    _id: 'order123',
    orderNumber: 'BRK-202607-00004',
    status: 'pending',
    customer: 'customer123',
    items: [{ product: 'prod1', quantity: 1 }],
    ...overrides,
  };
}

describe('OrderService.adminUpdateOrder — status transition validation', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rejects an illegal transition (pending -> processing) with a specific, non-empty message', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(makeMockOrder({ status: 'pending' }));

    // This is the exact scenario from the reported bug: the admin UI
    // previously offered "processing" as a selectable option even from
    // "pending", which is not a legal transition per the state machine.
    await expect(
      orderService.adminUpdateOrder('order123', { status: 'processing' }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Cannot transition order from "pending" to "processing"'),
    });
  });

  it('the rejected transition error is an AppError whose message survives production-style cloning', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(makeMockOrder({ status: 'pending' }));

    let caught;
    try {
      await orderService.adminUpdateOrder('order123', { status: 'processing' });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(AppError);
    // Mirrors errorHandler.js's production clone path — this is exactly
    // what was previously reducing the message to an empty string.
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(caught)), caught);
    expect(cloned.message).not.toBe('');
    expect(cloned.message).toContain('Cannot transition order from "pending" to "processing"');
  });

  it('allows a legal transition (pending -> confirmed) and succeeds', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(makeMockOrder({ status: 'pending' }));
    jest.spyOn(orderRepository, 'updateById').mockResolvedValue(makeMockOrder({ status: 'confirmed' }));

    const result = await orderService.adminUpdateOrder('order123', { status: 'confirmed' });

    expect(result.status).toBe('confirmed');
    expect(orderRepository.updateById).toHaveBeenCalledWith(
      'order123',
      expect.objectContaining({ status: 'confirmed' }),
    );
  });

  it('adminGetOrderById returns validNextStatuses reflecting the real state machine', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue({
      ...makeMockOrder({ status: 'pending' }),
      toObject() {
        // eslint-disable-next-line no-unused-vars
        const { toObject, ...rest } = this;
        return rest;
      },
    });

    const result = await orderService.adminGetOrderById('order123');

    expect(result.validNextStatuses).toEqual(['confirmed', 'cancelled']);
  });
});
