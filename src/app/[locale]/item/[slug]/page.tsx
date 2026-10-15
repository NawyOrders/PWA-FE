import "../item.css";
import { notFound } from "next/navigation";
import ItemDetail from "@/components/item/ItemDetail";

const availableItems = new Set(["burger-baladi"]);

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!availableItems.has(slug)) notFound();

  return <ItemDetail />;
}
