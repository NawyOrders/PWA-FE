export default function NotesField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="item-section notes-section" aria-labelledby="notes-heading">
      <div className="section-heading-row">
        <h2 id="notes-heading">ملاحظات خاصة</h2>
        <span>اختياري</span>
      </div>
      <label className="sr-only" htmlFor="item-note">اكتب ملاحظاتك على الطلب</label>
      <textarea id="item-note" value={value} onChange={(event) => onChange(event.target.value.slice(0, 180))} maxLength={180} placeholder="مثال: بدون مخلل، صلصة إضافية بجانب الطبق" rows={2} />
      <span className="note-count">{value.length}/180</span>
    </section>
  );
}
