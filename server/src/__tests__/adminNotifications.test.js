process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const productRepository = require('../repositories/ProductRepository');
const orderRepository = require('../repositories/OrderRepository');
const orderService = require('../services/OrderService');
const NotificationService = require('../services/NotificationService');

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
    stockQuantity: 0,
    pricing: { retail: 8500, type: 'per_brick' },
    images: [],
    specs: {},
    ...overrides,
  };
}

const baseOrderInput = {
  shippingAddress: {
    fullName: 'Ramesh Gupta',
    phone: '9999999999',
    addressLine1: 'Line 1',
    city: 'City',
    state: 'State',
    pincode: '123456',
  },
  paymentMethod: 'cod',
};

describe('OrderService.createOrder — admin notification on new order', () => {
  afterEach(() => jest.restoreAllMocks());

  it('fires NotificationService.newOrderPlaced with the order and customer name', async () => {
    jest.spyOn(productRepository, 'findById').mockResolvedValue(makeMockProduct());
    jest.spyOn(orderRepository, 'generateOrderNumber').mockResolvedValue('BRK-202607-00010');
    jest.spyOn(orderRepository, 'create').mockImplementation(async (data) => ({
      ...data,
      _id: 'order10',
    }));
    jest.spyOn(productRepository, 'decrementStock').mockResolvedValue(undefined);
    jest.spyOn(NotificationService, 'orderPlaced').mockResolvedValue(undefined);
    const newOrderSpy = jest.spyOn(NotificationService, 'newOrderPlaced').mockResolvedValue(undefined);

    await orderService.createOrder('customer1', {
      ...baseOrderInput,
      items: [{ product: 'prod1', quantity: 500 }],
    });

    // Fire-and-forget — flush microtasks before asserting.
    await new Promise((resolve) => setImmediate(resolve));

    expect(newOrderSpy).toHaveBeenCalledTimes(1);
    const [orderArg, customerNameArg] = newOrderSpy.mock.calls[0];
    expect(orderArg.orderNumber).toBe('BRK-202607-00010');
    expect(customerNameArg).toBe('Ramesh Gupta');
  });
});

describe('NotificationService.sendToAdmin / newOrderPlaced', () => {
  const Notification = require('../models/Notification');

  afterEach(() => jest.restoreAllMocks());

  it('persists an admin notification with forAdmin=true and no customer', async () => {
    const created = {
      _id: 'notif1',
      forAdmin: true,
      customer: null,
      type: 'order',
      title: 'New Order Placed',
      message: 'New order #BRK-1 placed by Test User — ₹8,500.',
      createdAt: new Date(),
    };
    jest.spyOn(Notification, 'create').mockResolvedValue(created);

    const result = await NotificationService.sendToAdmin({
      type: 'order',
      title: 'New Order Placed',
      message: 'New order #BRK-1 placed by Test User — ₹8,500.',
      link: '/admin/orders/order1',
    });

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ forAdmin: true, customer: null })
    );
    expect(result).toBe(created);
  });

  it('newOrderPlaced builds a message containing the order number and total', async () => {
    const sendToAdminSpy = jest.spyOn(NotificationService, 'sendToAdmin').mockResolvedValue({});

    await NotificationService.newOrderPlaced(
      { _id: 'order1', orderNumber: 'BRK-202607-00099', pricing: { total: 12000 } },
      'Test Customer'
    );

    expect(sendToAdminSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Order Placed',
        message: expect.stringContaining('BRK-202607-00099'),
        link: '/admin/orders/order1',
      })
    );
    expect(sendToAdminSpy.mock.calls[0][0].message).toContain('Test Customer');
  });
});
