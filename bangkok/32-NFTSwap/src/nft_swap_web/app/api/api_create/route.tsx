import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { maxnum, collectionName } = await request.json();
  console.log("Received data:", maxnum, collectionName); // 打印接收到的数据

  
  // 返回 200 状态和一个简单的 JSON 响应
  return NextResponse.json({
    message: "Request received successfully!",
  });
}
