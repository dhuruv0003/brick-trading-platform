process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const productRepository = require('../repositories/ProductRepository');
const orderRepository = require('../repositories/OrderRepository');
const orderService = require('../services/OrderService');
const AppError = require('../utils/AppError');

// Fire-and-forget side effects that createOrder triggers — stub them out so
// this test only exercises quantity validation itself.
jest.mock('../services/NotificationService', () => ({
  orderPlaced: jest.fn().mockResolvedValue(undefined),
  newOrderPlaced: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../config/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  renderEmailTemplate: jest.fn().mockReturnValue('<html></html>'),
}));
jest.mock('../models/Customer', () => ({
  findById: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) }),
}));

function makeMockProduct(overrides = {}) {
  return {
    _id: 'prod1',
    name: 'Premium Wire Cut Brick',
    isActive: true,
    inStock: true,
    stockQuantity: 0, // untracked, so the stock-limit check is a no-op here
    pricing: { retail: 8500, type: 'per_brick' },
    images: [],
    specs: {},
    ...overrides,
  };
}

const baseOrderInput = {
  shippingAddress: {
    fullName: 'Test Customer',
    phone: '9999999999',
    addressLine1: 'Line 1',
    city: 'City',
    state: 'State',
    pincode: '123456',
  },
  paymentMethod: 'cod',
};

describe('OrderService.createOrder — brick quantity increment rules (per_brick)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('accepts quantity 500', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(makeMockProduct());
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00001');
    jest.spyOn(orderRepository, 'create').mockImplementation(async (data) => ({ ...data, _id: 'order1' }));
    jest.spyOn(productRepository, 'decrementStock').mockResolvedValue(undefined);

    const order = await orderService.createOrder('customer1', {
      ...baseOrderInput,
      items: [{ product: 'prod1', quantity: 500 }],
    });
    expect(order.items[0].quantity).toBe(500);
  });

  it('accepts quantity 1000', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(makeMockProduct());
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00002');
    jest.spyOn(orderRepository, 'create').mockImplementation(async (data) => ({ ...data, _id: 'order2' }));
    jest.spyOn(productRepository, 'decrementStock').mockResolvedValue(undefined);

    const order = await orderService.createOrder('customer1', {
      ...baseOrderInput,
      items: [{ product: 'prod1', quantity: 1000 }],
    });
    expect(order.items[0].quantity).toBe(1000);
  });

  it('rejects quantity 501 with a specific error identifying the item and rule', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(makeMockProduct());
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00003');

    await expect(
      orderService.createOrder('customer1', {
        ...baseOrderInput,
        items: [{ product: 'prod1', quantity: 501 }],
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Premium Wire Cut Brick'),
    });
  });

  it('rejects quantity 250 (below minimum, not a multiple of 500)', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(makeMockProduct());
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00004');

    await expect(
      orderService.createOrder('customer1', {
        ...baseOrderInput,
        items: [{ product: 'prod1', quantity: 250 }],
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects quantity 0', async () => {
    // quantity 0 is caught by the pre-existing "valid product ID and
    // quantity" check before the quantity-rule check even runs.
    jest.spyOn(productRepository, 'findById').mockResolvedValue(makeMockProduct());

    await expect(
      orderService.createOrder('customer1', {
        ...baseOrderInput,
        items: [{ product: 'prod1', quantity: 0 }],
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('OrderService.createOrder — brick quantity increment rules (bundle_1000)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('accepts quantity 1 and 2 bundles', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(
      makeMockProduct({ pricing: { retail: 18000, type: 'bundle_1000' } })
    );
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00005');
    jest.spyOn(orderRepository, 'create').mockImplementation(async (data) => ({ ...data, _id: 'order5' }));
    jest.spyOn(productRepository, 'decrementStock').mockResolvedValue(undefined);

    const order = await orderService.createOrder('customer1', {
      ...baseOrderInput,
      items: [{ product: 'prod1', quantity: 2 }],
    });
    expect(order.items[0].quantity).toBe(2);
  });

  it('rejects a fractional bundle quantity (1.5)', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(
      makeMockProduct({ pricing: { retail: 18000, type: 'bundle_1000' } })
    );
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00006');

    await expect(
      orderService.createOrder('customer1', {
        ...baseOrderInput,
        items: [{ product: 'prod1', quantity: 1.5 }],
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a negative bundle quantity from a raw API call bypassing the client', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(
      makeMockProduct({ pricing: { retail: 18000, type: 'bundle_1000' } })
    );

    await expect(
      orderService.createOrder('customer1', {
        ...baseOrderInput,
        items: [{ product: 'prod1', quantity: -1 }],
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
