import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export default function BurgerArtwork() {
  const { t } = useI18n();
  return (
    <div className="burger-artwork">
      <div className="burger-white-circle" />
      <Image className="burger-product-image" src="/burger.png" alt={t("itemImageAlt")} width={1000} height={918} priority sizes="(max-width: 600px) 92vw, 540px" />
    </div>
  );
}
