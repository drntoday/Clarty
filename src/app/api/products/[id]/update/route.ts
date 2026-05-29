import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/productsStore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { price, name, description, keywords } = body;

    const updated = updateProduct(id, {
      price: price !== undefined ? Number(price) : undefined,
      name,
      description,
      keywords,
    });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
