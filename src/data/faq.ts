import type { LocalizedText } from "@/lib/i18n/types";

export type FaqTopic = "orders" | "payment" | "delivery" | "account";

export interface FaqItem {
  id: string;
  topic: FaqTopic;
  question: LocalizedText;
  answer: LocalizedText;
}

// Sample content (DESIGN.md 12.7) — replace with the restaurant's real answers.
export const faqItems: FaqItem[] = [
  {
    id: "delivery-time",
    topic: "delivery",
    question: {
      ar: "كم يستغرق توصيل الطلب في المتوسط؟",
      en: "How long does delivery take on average?",
    },
    answer: {
      ar: "يتم توصيل معظم الطلبات خلال 25 إلى 40 دقيقة حسب موقعك والمطعم المختار. يمكنك متابعة حالة طلبك مباشرة عبر خريطة التتبع الحي داخل التطبيق.",
      en: "Most orders arrive within 25 to 40 minutes depending on your location and the restaurant. You can follow your order live on the tracking map inside the app.",
    },
  },
  {
    id: "payment-methods",
    topic: "payment",
    question: {
      ar: "ما هي طرق الدفع المتاحة؟",
      en: "What payment methods are available?",
    },
    answer: {
      ar: "يمكنك الدفع نقدا عند الاستلام او بالبطاقة البنكية (يرجى التأكيد مع المطعم).",
      en: "You can pay cash on delivery or by bank card (confirm with the restaurant).",
    },
  },
  {
    id: "track-order",
    topic: "orders",
    question: {
      ar: "كيف يمكنني تتبع طلبي؟",
      en: "How can I track my order?",
    },
    answer: {
      ar: "افتح سجل الطلبات واختر طلبك لمشاهدة حالته.",
      en: "Open your order history and choose your order to see its status.",
    },
  },
  {
    id: "cancel-order",
    topic: "orders",
    question: {
      ar: "هل يمكنني الغاء الطلب؟",
      en: "Can I cancel my order?",
    },
    answer: {
      ar: "يمكنك الغاء الطلب قبل ان يبدأ المطعم في تحضيره.",
      en: "You can cancel before the restaurant starts preparing it.",
    },
  },
  {
    id: "discount-code",
    topic: "payment",
    question: {
      ar: "كيف استخدم كود الخصم؟",
      en: "How do I use a discount code?",
    },
    answer: {
      ar: "ادخل الكود في خانة الكوبون داخل السلة ثم اضغط تطبيق.",
      en: "Enter the code in the coupon field in the cart and press Apply.",
    },
  },
  {
    id: "change-address",
    topic: "account",
    question: {
      ar: "كيف اغير عنوان التوصيل؟",
      en: "How do I change my delivery address?",
    },
    answer: {
      ar: "من الملف الشخصي افتح العناوين ثم عدل العنوان او اضف عنوانا جديدا.",
      en: "From your profile open Addresses, then edit an address or add a new one.",
    },
  },
];
