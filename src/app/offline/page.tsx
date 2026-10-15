import "./offline.css";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-shell">
      <div className="offline-card">
        <span className="offline-icon" aria-hidden="true">↯</span>
        <p className="eyebrow">انقطع الاتصال بالإنترنت</p>
        <h1>أنت غير متصل الآن</h1>
        <p>تحقّق من اتصالك بالإنترنت ثم حاول مرة أخرى. سنكون هنا عندما تعود.</p>
        <Link className="primary-link" href="/">العودة إلى الرئيسية <span aria-hidden="true">←</span></Link>
      </div>
    </main>
  );
}
