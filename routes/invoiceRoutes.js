const express = require("express");

const {
    extractInvoiceData,
    saveInvoice,
    getUserInvoices,
} = require("../controllers/InvoiceController");

const router = express.Router();

const { default: upload } = require("../middlewares/upload.js");

// 1. Extract OCR invoice data only
router.post(
    "/extract-invoice",
    upload.single("file"),
    extractInvoiceData
);

// 2. Save confirmed invoice
router.post(
    "/save-invoice",
    saveInvoice
);

router.get("/user/:userId", getUserInvoices);

module.exports = router;