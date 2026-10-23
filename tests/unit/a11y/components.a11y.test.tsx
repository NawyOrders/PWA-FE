import { describe, expect, it } from "vitest";
import { renderWithProviders, LOCALES, type Locale } from "../../utils/render";
import { expectNoAxeViolations, runAxe } from "../../utils/axe";
import { TextInput } from "@/components/TextInput";
import { PhoneInput } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FilterChip } from "@/components/FilterChip";
import { QuantityStepper } from "@/components/QuantityStepper";
import { CircleIconButton } from "@/components/CircleIconButton";
import { SearchPill } from "@/components/SearchPill";
import { StarRating } from "@/components/StarRating";
import { ImageUpload } from "@/components/ImageUpload";
import { ListRow } from "@/components/ListRow";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { OptionCard } from "@/components/OptionCard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Modal } from "@/components/Modal";
import { Drawer } from "@/components/Drawer";
import { ProductCard } from "@/components/ProductCard";
import { CartItemCard } from "@/components/CartItemCard";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { SwipeToDelete } from "@/components/SwipeToDelete";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { PlusIcon } from "@/components/icons";
import { dishes } from "@/data/dishes";

/**
 * The axe sweep of the shared components (TESTING.md section 8.3).
 *
 * Every component is rendered in both locales because the accessible name and
 * the reading direction change with the language.
 */
const components: Array<{ name: string; render: () => React.ReactElement }> = [
  {
    name: "TextInput",
    render: () => (
      <TextInput
        label="الاسم"
        value="محمد"
        onChange={() => undefined}
        helper="مساعد"
        required
      />
    ),
  },
  {
    name: "PhoneInput",
    render: () => (
      <PhoneInput
        value="0101234567"
        onChange={() => undefined}
        onSend={() => undefined}
        sendLabel="إرسال"
        countdown={42}
        countdownLabel="42 ثانية"
      />
    ),
  },
  {
    name: "OtpInput",
    render: () => <OtpInput value="1234" onChange={() => undefined} ariaLabel="رمز التحقق" />,
  },
  {
    name: "PrimaryButton",
    render: () => <PrimaryButton>إتمام الطلب</PrimaryButton>,
  },
  {
    name: "FilterChip",
    render: () => (
      <FilterChip active onClick={() => undefined}>
        الكل
      </FilterChip>
    ),
  },
  {
    name: "QuantityStepper",
    render: () => (
      <QuantityStepper
        quantity={2}
        onIncrement={() => undefined}
        onDecrement={() => undefined}
        decreaseLabel="إنقاص"
        increaseLabel="زيادة"
      />
    ),
  },
  {
    name: "CircleIconButton",
    render: () => (
      <CircleIconButton label="إضافة" onClick={() => undefined}>
        <PlusIcon />
      </CircleIconButton>
    ),
  },
  {
    name: "SearchPill",
    render: () => (
      <SearchPill
        value=""
        onChange={() => undefined}
        onSubmit={() => undefined}
        placeholder="ابحث"
        buttonLabel="بحث"
      />
    ),
  },
  {
    name: "StarRating",
    render: () => (
      <StarRating
        id="rating"
        label="التقييم"
        value={0}
        onChange={() => undefined}
        starLabels={["1", "2", "3", "4", "5"]}
      />
    ),
  },
  {
    name: "ImageUpload",
    render: () => (
      <ImageUpload
        id="photo"
        label="صورة (اختياري)"
        uploadTap="اضغط لرفع صورة"
        uploadDesktop="اسحب صورة هنا"
        previewAlt="معاينة"
        removeLabel="حذف"
        uploadingLabel="جارٍ الرفع"
        errorSize="الحجم كبير"
        errorType="نوع غير مدعوم"
      />
    ),
  },
  {
    name: "ListRow",
    render: () => (
      <ListRow icon={<PlusIcon />} title="العناوين" subtitle="أدر عناوين التوصيل" onClick={() => undefined} />
    ),
  },
  {
    name: "EmptyState",
    render: () => (
      <EmptyState
        icon={<PlusIcon />}
        title="السلة فاضية"
        hint="أضف أصنافك المفضلة"
        actionLabel="ابدأ التسوق"
        onAction={() => undefined}
      />
    ),
  },
  {
    name: "StatusBadge",
    render: () => <StatusBadge status="delivered" label="تم التوصيل" />,
  },
  {
    name: "OptionCard",
    render: () => (
      <OptionCard
        icon={<PlusIcon />}
        title="الأسئلة الشائعة"
        subtitle="كل ما تحتاج معرفته"
        onClick={() => undefined}
      />
    ),
  },
  {
    name: "LanguageToggle",
    render: () => <LanguageToggle label="اللغة" locale="ar" onChange={() => undefined} />,
  },
  {
    name: "ScreenHeader",
    render: () => <ScreenHeader title="السلة" action="menu" onAction={() => undefined} actionLabel="القائمة" />,
  },
  {
    name: "Modal",
    render: () => (
      <Modal open onClose={() => undefined} labelledBy="modal-title">
        <h2 id="modal-title">تأكيد</h2>
        <PrimaryButton>تأكيد</PrimaryButton>
      </Modal>
    ),
  },
  {
    name: "ProductCard",
    render: () => (
      <ProductCard
        dish={dishes[0]}
        isFavorite={false}
        onAdd={() => undefined}
        onToggleFavorite={() => undefined}
      />
    ),
  },
  {
    name: "CartItemCard",
    render: () => (
      <CartItemCard
        dish={dishes[0]}
        quantity={1}
        unitPrice={dishes[0].price}
        addonIds={[]}
        note=""
        editLabel="تعديل"
        onEdit={() => undefined}
        onIncrement={() => undefined}
        onDecrement={() => undefined}
        onDelete={() => undefined}
      />
    ),
  },
  {
    name: "FeaturedCarousel",
    render: () => <FeaturedCarousel dishes={dishes.slice(0, 3)} onAdd={() => undefined} />,
  },
  {
    name: "SwipeToDelete",
    render: () => (
      <SwipeToDelete onDelete={() => undefined} deleteLabel="حذف">
        <p>محتوى</p>
      </SwipeToDelete>
    ),
  },
  {
    name: "LoginRequiredModal",
    render: () => <LoginRequiredModal />,
  },
];

describe("axe: the shared components", () => {
  for (const [locale, dir] of LOCALES) {
    for (const component of components) {
      it(`UT-A11Y-COMP-${component.name.toUpperCase()}-${locale.toUpperCase()} has no violation in ${dir}`, async () => {
        const { container } = renderWithProviders(component.render(), { locale });

        const summary = await expectNoAxeViolations(container);

        expect(summary.violations).toEqual([]);
      });
    }
  }
});

/**
 * Known defects found by the axe sweep. They are asserted as still present so
 * the suite stays green while the defect is tracked; the test fails as soon as
 * the app is fixed, which is the signal to delete the entry.
 */
const knownIssues: Array<{ name: string; rules: string[]; render: () => React.ReactElement }> = [
  {
    name: "Drawer",
    rules: ["aria-allowed-role"],
    render: () => (
      <Drawer open onClose={() => undefined} labelledBy="drawer-title">
        <h2 id="drawer-title">القائمة</h2>
        <PrimaryButton>إغلاق</PrimaryButton>
      </Drawer>
    ),
  },
];

describe("axe: the known defects", () => {
  for (const issue of knownIssues) {
    for (const locale of LOCALES.map(([code]) => code) as Locale[]) {
      it(`UT-A11Y-KNOWN-${issue.name.toUpperCase()}-${locale.toUpperCase()} still reports ${issue.rules.join(", ")}`, async () => {
        const { container } = renderWithProviders(issue.render(), { locale });

        const results = await runAxe(container);
        const reported = [...new Set(results.violations.map((violation) => violation.id))].sort();

        expect(reported).toEqual([...issue.rules].sort());
      });
    }
  }
});
