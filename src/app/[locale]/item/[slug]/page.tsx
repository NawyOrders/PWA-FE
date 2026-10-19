import "../item.css";
import { notFound } from "next/navigation";
import ItemDetail from "@/components/item/ItemDetail";
import { getDish } from "@/data/dishes";

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "burger-baladi") return <ItemDetail key={slug} />;

  const dish = getDish(slug);
  if (!dish) notFound();

  return <ItemDetail key={dish.id} dish={dish} />;
}
