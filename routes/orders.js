const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin only)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    await order.populate('user', 'name email');
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    // First, find the order without populating to check ownership
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin (before populating)
    // Compare ObjectIds directly using toString() for reliable comparison
    const orderUserId = order.user.toString();
    const currentUserId = req.user._id.toString();
    
    if (orderUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Now populate the order for response
    await order.populate('user', 'name email');
    await order.populate('items.product');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    // Validation
    if (!deliveryAddress || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Delivery address and payment method are required' 
      });
    }

    if (!['Cash on Delivery', 'Mock Card'].includes(paymentMethod)) {
      return res.status(400).json({ 
        message: 'Invalid payment method' 
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product || !product.available) {
        return res.status(400).json({ 
          message: `Product ${item.product.name} is no longer available` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.product.name}` 
        });
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save();

      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      status: 'Placed'
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate('items.product');
    res.status(201).json({ 
      message: 'Order placed successfully', 
      order 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

