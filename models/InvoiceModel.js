const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        invoiceDate: {
            type: Date,
        },

        invoiceNumber: {
            type: String,
            trim: true,
        },

        supplierName: {
            type: String,
            trim: true,
        },

        supplierTRN: {
            type: String,
            trim: true,
        },

        subtotalAmount: {
            type: Number,
            default: 0,
        },

        vatAmount: {
            type: Number,
            default: 0,
        },

        totalAmount: {
            type: Number,
            default: 0,
        },
        fileUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Invoice", invoiceSchema);