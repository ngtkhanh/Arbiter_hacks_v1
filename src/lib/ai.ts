import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const pricingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productId: { type: Type.INTEGER },
    quantity: { type: Type.INTEGER },
    decay_schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          minutes_before_close: { type: Type.INTEGER },
          price: { type: Type.NUMBER },
        },
        required: ["minutes_before_close", "price"]
      }
    },
    ai_rationale: { type: Type.STRING },
  },
  required: ["productId", "quantity", "decay_schedule", "ai_rationale"]
};

export async function analyzeImageAndGeneratePricing(imageBase64: string, mimeType: string, catalogJson: string, closingTimeMinutes: number = 120) {
  const prompt = `
Bạn là một AI Business Advisor cho cửa hàng thực phẩm tươi sống.
Đây là danh sách sản phẩm (menu cố định) của cửa hàng:
${catalogJson}

Nhiệm vụ của bạn là:
1. Nhìn ảnh, xác định xem đồ vật trong ảnh KHỚP với sản phẩm nào trong menu. Trả về chính xác \`productId\`. BẮT BUỘC phải khớp với 1 món có sẵn trong menu.
2. Đếm số lượng hiện tại (\`quantity\`).
3. Lập kế hoạch giảm giá (Price Decay Schedule) để xả kho trước khi đóng cửa (${closingTimeMinutes} phút nữa), DỰA TRÊN mức giá gốc (basePrice) và giá sàn (minPrice) của sản phẩm bạn đã chọn trong menu.
4. Ở trường ai_rationale, hãy giải thích ngắn gọn bằng tiếng Việt lý do bạn thiết lập biểu đồ giá này.

Hãy trả về JSON tuân thủ đúng schema được yêu cầu.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: pricingSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process image with AI");
  }
}
