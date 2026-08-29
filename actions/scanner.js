"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanDocument(file) {
  try {
    if (!file || file.size > 5 * 1024 * 1024) {
      throw new Error("File must be smaller than 5MB.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this inventory invoice or delivery note and return valid JSON only.
      Extract:
      - productName
      - sku
      - quantity
      - unitCost
      - supplierName
      - movementDate (ISO date)

      Return exactly:
      {
        "productName": "string",
        "sku": "string",
        "quantity": number,
        "unitCost": number,
        "supplierName": "string",
        "movementDate": "ISO date string"
      }

      If this is not an invoice/delivery document, return {}.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: file.type } },
    ]);

    const cleaned = result.response
      .text()
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : cleaned);

    return {
      productName: parsed.productName || "",
      sku: parsed.sku || "",
      quantity: Number(parsed.quantity) || 0,
      unitCost: Number(parsed.unitCost) || 0,
      supplierName: parsed.supplierName || "",
      movementDate: parsed.movementDate ? new Date(parsed.movementDate) : new Date(),
    };
  } catch (error) {
    console.error("AI document scan failed:", error);
    throw new Error("Could not read the document.");
  }
}
