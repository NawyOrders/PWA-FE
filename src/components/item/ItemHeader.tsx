import ItemIcon from "./ItemIcon";

type ItemHeaderProps = {
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
};

export default function ItemHeader({ isFavorite, onClose, onToggleFavorite }: ItemHeaderProps) {
  return (
    <header className="item-topbar">
      <button className="round-icon-button close-button" type="button" onClick={onClose} aria-label="إغلاق صفحة المنتج">
        <ItemIcon name="close" size={25} />
      </button>
      <button className={`round-icon-button favorite-button${isFavorite ? " is-favorite" : ""}`} type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} aria-pressed={isFavorite}>
        <ItemIcon name="heart" size={25} />
      </button>
    </header>
  );
}
