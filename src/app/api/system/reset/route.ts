import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST() {
  try {
    // Xóa tất cả các đơn đặt chỗ trước (do có ràng buộc khóa ngoại - relation)
    await prisma.reservation.deleteMany();
    
    // Sau đó xóa tất cả các lô hàng xả kho
    await prisma.clearanceItem.deleteMany();

    // Lưu ý: Không xóa bảng Product vì đó là danh mục gốc.

    return NextResponse.json({ success: true, message: "System reset successfully" });
  } catch (error) {
    console.error("Error resetting system:", error);
    return NextResponse.json({ error: "Failed to reset system" }, { status: 500 });
  }
}
