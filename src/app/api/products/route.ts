import { NextResponse } from "next/server";
import { getProducts } from "@/lib/productsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
