const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Mock Card'],
    required: true
  },
  status: {
    type: String,
    enum: ['Placed', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Placed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

