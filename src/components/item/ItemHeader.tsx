import ItemIcon from "./ItemIcon";
import { useI18n } from "@/lib/i18n";

type ItemHeaderProps = {
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
};

export default function ItemHeader({ isFavorite, onClose, onToggleFavorite }: ItemHeaderProps) {
  const { t } = useI18n();
  return (
    <header className="item-topbar">
      <button className="round-icon-button close-button" type="button" onClick={onClose} aria-label={t("closeItem")}>
        <ItemIcon name="close" size={25} />
      </button>
      <button className={`round-icon-button favorite-button${isFavorite ? " is-favorite" : ""}`} type="button" onClick={onToggleFavorite} aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")} aria-pressed={isFavorite}>
        <ItemIcon name="heart" size={25} />
      </button>
    </header>
  );
}
