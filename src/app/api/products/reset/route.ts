import { NextResponse } from "next/server";
import { resetProducts } from "@/lib/productsStore";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const products = resetProducts();
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
