const Invoice = require("../models/InvoiceModel.js");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL,
});

const axios = require("axios");

const runOCR = async (imageUrl) => {
    const response = await axios.post(
        "https://api.ocr.space/parse/image",
        null,
        {
            params: {
                apikey: process.env.OCR_API_KEY || "helloworld",
                url: imageUrl, // 👈 IMPORTANT: direct image URL
                language: "eng",
                isOverlayRequired: false,
            },
        }
    );

    const text =
        response.data?.ParsedResults?.[0]?.ParsedText || "";

    return text;
};
// ===============================
// 1. EXTRACT ONLY CONTROLLER
// ===============================
exports.extractInvoiceData = async (req, res) => {
    try {
        const file = req.file;
        console.log(req.file)
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        // OCR STEP
       

        const extractedText = await runOCR(file.path);
        // AI EXTRACTION
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an invoice OCR extractor. Return ONLY valid JSON.",
                },
                {
                    role: "user",
                    content: `
Extract invoice data from this OCR text.

Return ONLY JSON in this exact format:

{
  "invoiceDate": { "value": "", "confidence": 0 },
  "invoiceNumber": { "value": "", "confidence": 0 },
  "supplierName": { "value": "", "confidence": 0 },
  "supplierTRN": { "value": "", "confidence": 0 },
  "subtotalAmount": { "value": 0, "confidence": 0 },
  "vatAmount": { "value": 0, "confidence": 0 },
  "totalAmount": { "value": 0, "confidence": 0 }
}

Rules:
- confidence must be between 0 and 1
- 1 = fully certain, 0 = guess
- Return valid JSON only
- No markdown
- No explanation
- Amounts must be numbers only

TEXT:
${extractedText}
`
                },
            ],
            temperature: 0.1,
            max_tokens: 300,
        });

        let content = response.choices[0].message.content;

        let extractedData;

        try {
            extractedData = JSON.parse(content);
        } catch (err) {
            const start = content.indexOf("{");
            const end = content.lastIndexOf("}");

            const clean = content.substring(start, end + 1);

            extractedData = JSON.parse(clean);
        }

        // RETURN ONLY
        return res.status(200).json({
            success: true,
            message: "Invoice extracted successfully",
            extractedData,
            fileUrl: file.path,
        });

    } catch (error) {
        console.log("EXTRACT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// 2. SAVE CONFIRMED INVOICE
// ===============================
exports.saveInvoice = async (req, res) => {
    try {
        const {
            userId,
            invoiceDate,
            invoiceNumber,
            supplierName,
            supplierTRN,
            subtotalAmount,
            vatAmount,
            totalAmount,
            fileUrl,
        } = req.body;

        const invoice = await Invoice.create({
            userId,
            invoiceDate,
            invoiceNumber,
            supplierName,
            supplierTRN,
            subtotalAmount,
            vatAmount,
            totalAmount,
            fileUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Invoice saved successfully",
            invoice,
        });

    } catch (error) {
        console.log("SAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getUserInvoices = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        const invoices = await Invoice.find({ userId })
            .sort({ createdAt: -1 }); // latest first

        return res.status(200).json({
            success: true,
            message: "Invoices fetched successfully",
            count: invoices.length,
            invoices,
        });

    } catch (error) {
        console.log("FETCH ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};