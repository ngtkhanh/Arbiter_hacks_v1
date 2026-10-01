import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const pricingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    item_name: { type: Type.STRING },
    quantity: { type: Type.INTEGER },
    base_price: { type: Type.NUMBER },
    min_price: { type: Type.NUMBER },
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
  required: ["item_name", "quantity", "base_price", "min_price", "decay_schedule", "ai_rationale"]
};

export async function analyzeImageAndGeneratePricing(imageBase64: string, mimeType: string, closingTimeMinutes: number = 120) {
  const prompt = `
Bạn là một AI Business Advisor cho cửa hàng thực phẩm tươi sống.
Nhiệm vụ của bạn là nhận diện món đồ trong ảnh, đếm số lượng hiện tại, và lập kế hoạch giảm giá (Price Decay Schedule) để xả kho trước khi đóng cửa.
Cửa hàng sẽ đóng cửa sau ${closingTimeMinutes} phút nữa.
Hãy trả về JSON tuân thủ đúng schema được yêu cầu.

Yêu cầu chi tiết:
1. Nhận diện tên món và số lượng từ ảnh.
2. Đề xuất giá gốc (base_price) và giá sàn (min_price).
3. Tạo mảng decay_schedule: các mốc giảm giá dần đều dựa vào thời gian còn lại (minutes_before_close) và số lượng tồn kho.
4. Ở trường ai_rationale, hãy giải thích ngắn gọn bằng tiếng Việt lý do bạn thiết lập biểu đồ giá này (Ví dụ: "Bánh sừng bò tồn nhiều mà chỉ còn 2 tiếng, cần hạ giá sâu sớm để đẩy hàng").
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
