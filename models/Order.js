const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, // Pending, Shipped, Delivered, Cancelled
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
