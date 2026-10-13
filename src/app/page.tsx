import Link from "next/link";

const features = [
  { title: "تنقّل مرن", description: "نظّم الصفحات والتخطيطات بسهولة مع توجيه Next.js." },
  { title: "قابل للتثبيت", description: "أضف NawyOrders إلى الشاشة الرئيسية على أجهزتك." },
  { title: "جاهز للعمل دون اتصال", description: "تظهر صفحة مفيدة عند انقطاع اتصال الإنترنت." },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="NawyOrders home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NawyOrders</span>
        </Link>
        <span className="status-pill"><span className="status-dot" /> تطبيق ويب تقدّمي</span>
      </header>

      <section className="hero">
        <p className="eyebrow">بداية جديدة لتجربة NawyOrders</p>
        <h1>كل طلباتك، في مكان واحد.</h1>
        <p className="hero-copy">
          هذا المشروع جاهز لبناء شاشات NawyOrders وإضافة المزايا وربط واجهات API.
          يتضمن إعداد التثبيت وصفحة أساسية للاستخدام عند انقطاع الاتصال.
        </p>
        <Link className="primary-link" href="/offline">تعرّف على تجربة عدم الاتصال <span aria-hidden="true">←</span></Link>
      </section>

      <section className="feature-grid" aria-label="مزايا التطبيق">
        {features.map((feature, index) => (
          <article className="feature-card" key={feature.title}>
            <span className="feature-number">0{index + 1}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <footer className="footer">مبني باستخدام Next.js وTypeScript وTailwind CSS.</footer>
    </main>
  );
}
