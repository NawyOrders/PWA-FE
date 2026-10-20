import { useI18n } from "@/lib/i18n";

export default function NotesField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  return (
    <section className="item-section notes-section" aria-labelledby="notes-heading">
      <div className="section-heading-row">
        <h2 id="notes-heading">{t("specialNotes")}</h2>
        <span>{t("optional")}</span>
      </div>
      <label className="sr-only" htmlFor="item-note">{t("noteLabel")}</label>
      <textarea id="item-note" value={value} onChange={(event) => onChange(event.target.value.slice(0, 180))} maxLength={180} placeholder={t("notePlaceholder")} rows={2} />
      <span className="note-count">{value.length}/180</span>
    </section>
  );
}
