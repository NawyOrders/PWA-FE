import { notFound } from "next/navigation";
import { ComponentsShowcase } from "@/components/dev/ComponentsShowcase";

export default function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ComponentsShowcase />;
}
