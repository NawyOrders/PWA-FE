"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { categories } from "@/data/categories";
import { dishes } from "@/data/dishes";
import { CircleIconButton } from "@/components/CircleIconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCircle } from "@/components/CategoryCircle";
import { FilterChip } from "@/components/FilterChip";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchPill } from "@/components/SearchPill";
import { TextInput } from "@/components/TextInput";
import { PhoneInput } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Modal } from "@/components/Modal";
import { Drawer } from "@/components/Drawer";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ListRow } from "@/components/ListRow";
import { useUiStore } from "@/store/uiStore";
import {
  BellIcon,
  CardIcon,
  CheckIcon,
  CloseIcon,
  HeartIcon,
  HelpIcon,
  HomeIcon,
  InfoIcon,
  MenuIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[1.125rem] font-extrabold text-title">{title}</h2>
      {children}
    </section>
  );
}

export function ComponentsShowcase() {
  const { locale, dict } = useI18n();
  const [chip, setChip] = useState(0);
  const [category, setCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [quantity, setQuantity] = useState(2);
  const [favorite, setFavorite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const showToast = useUiStore((state) => state.showToast);

  const sampleDish = dishes[0];

  return (
    <main className="space-y-8 px-5 pb-24 pt-4 text-start">
      <h1 className="text-[1.5rem] font-extrabold text-title">
        Components — {locale.toUpperCase()}
      </h1>

      <Section title="Header">
        <ScreenHeader
          kicker={dict.home.kicker}
          title={dict.nav.home}
          counter={dict.cart.count.replace("{count}", "2")}
          onAction={() => setDrawerOpen(true)}
        />
      </Section>

      <Section title="Buttons">
        <div className="space-y-3">
          <PrimaryButton icon={<CheckIcon className="h-5 w-5" />}>{dict.cart.checkout}</PrimaryButton>
          <PrimaryButton disabled>{dict.auth.send}</PrimaryButton>
          <PrimaryButton variant="outline">Outline</PrimaryButton>
          <div className="flex items-center gap-3">
            <CircleIconButton label={dict.common.menu} variant="white">
              <MenuIcon className="h-5 w-5" />
            </CircleIconButton>
            <CircleIconButton label={dict.common.close} variant="muted">
              <CloseIcon className="h-5 w-5" />
            </CircleIconButton>
            <CircleIconButton label={dict.product.favorite} variant="muted">
              <HeartIcon className="h-5 w-5" />
            </CircleIconButton>
            <CircleIconButton label={dict.product.addToCart} variant="primary">
              <PlusIcon className="h-5 w-5" />
            </CircleIconButton>
            <CircleIconButton label="trash" variant="danger">
              <TrashIcon className="h-5 w-5" />
            </CircleIconButton>
          </div>
        </div>
      </Section>

      <Section title="Product card">
        <ProductCard
          dish={sampleDish}
          isFavorite={favorite}
          onAdd={() => showToast(dict.toast.addedToCart, "success")}
          onToggleFavorite={() => setFavorite((value) => !value)}
        />
      </Section>

      <Section title="Category circles">
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {categories.map((item, index) => (
            <CategoryCircle
              key={item.id}
              label={dict.categories[item.id]}
              image={item.image}
              active={category === index}
              onClick={() => setCategory(index)}
            />
          ))}
        </div>
      </Section>

      <Section title="Filter chips">
        <div className="flex gap-2">
          {[dict.orders.filterAll, dict.orders.filterDelivered, dict.orders.filterCancelled].map(
            (label, index) => (
              <FilterChip key={label} active={chip === index} onClick={() => setChip(index)}>
                {label}
              </FilterChip>
            ),
          )}
        </div>
      </Section>

      <Section title="Status badges">
        <div className="flex gap-2">
          <StatusBadge status="delivered" label={dict.orders.delivered} />
          <StatusBadge status="cancelled" label={dict.orders.cancelled} />
        </div>
      </Section>

      <Section title="Search pill">
        <SearchPill
          value={search}
          onChange={setSearch}
          onSubmit={() => undefined}
          placeholder={dict.common.search}
          buttonLabel={dict.common.searchShort}
        />
      </Section>

      <Section title="Inputs">
        <div className="space-y-4">
          <TextInput
            label={dict.auth.fullName}
            required
            value={name}
            onChange={setName}
            placeholder={dict.auth.fullNamePlaceholder}
            helper={dict.auth.fullNameHelper}
          />
          <PhoneInput
            value={phone}
            onChange={setPhone}
            onSend={() => undefined}
            sendLabel={dict.auth.send}
            ariaLabel={dict.auth.phoneLabel}
            placeholder={dict.auth.phonePlaceholder}
            countdown={phone.length === 10 ? 59 : null}
            countdownLabel={dict.auth.seconds.replace("{seconds}", "59")}
          />
          <OtpInput value={otp} onChange={setOtp} ariaLabel={dict.auth.otpLabel} />
        </div>
      </Section>

      <Section title="Quantity stepper">
        <QuantityStepper
          quantity={quantity}
          onIncrement={() => setQuantity((value) => value + 1)}
          onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
          decreaseLabel="decrease"
          increaseLabel="increase"
        />
      </Section>

      <Section title="Language toggle">
        <LanguageToggle
          label={dict.drawer.language}
          locale={locale}
          onChange={() => undefined}
        />
      </Section>

      <Section title="List rows">
        <div className="space-y-3">
          <ListRow
            icon={<HomeIcon className="h-5 w-5 text-primary" />}
            iconClassName="bg-primary-tint"
            title={dict.nav.home}
            subtitle={dict.home.location}
          />
          <ListRow
            icon={<BellIcon className="h-5 w-5 text-accent" />}
            iconClassName="bg-glow"
            title={dict.profile.notifications}
            subtitle={dict.profile.about}
          />
          <ListRow
            icon={<CardIcon className="h-5 w-5 text-success" />}
            iconClassName="bg-success-bg"
            title={dict.profile.payment}
          />
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap gap-3">
          <PrimaryButton fullWidth={false} onClick={() => setModalOpen(true)}>
            Open modal
          </PrimaryButton>
          <PrimaryButton fullWidth={false} variant="outline" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </PrimaryButton>
          <PrimaryButton
            fullWidth={false}
            variant="outline"
            onClick={() => showToast(dict.toast.couponApplied, "default")}
          >
            Show toast
          </PrimaryButton>
        </div>
      </Section>

      <Section title="Icons">
        <div className="flex flex-wrap items-center gap-4 text-title">
          <MenuIcon className="h-6 w-6" />
          <SearchIcon className="h-6 w-6" />
          <HeartIcon className="h-6 w-6" filled />
          <PhoneIcon className="h-6 w-6" />
          <HelpIcon className="h-6 w-6" />
          <InfoIcon className="h-6 w-6" />
        </div>
      </Section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} labelledBy="dev-modal-title">
        <h2 id="dev-modal-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.loginRequired.title}
        </h2>
        <p className="mt-2 text-[0.875rem] text-muted">{dict.loginRequired.body}</p>
        <div className="mt-5">
          <PrimaryButton onClick={() => setModalOpen(false)}>{dict.loginRequired.cta}</PrimaryButton>
        </div>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} labelledBy="dev-drawer-title">
        <div id="dev-drawer-title" className="px-6">
          <p className="mt-3 text-[0.875rem] text-muted">{dict.drawer.guest}</p>
          <div className="mt-6 space-y-3">
            <ListRow icon={<HomeIcon className="h-5 w-5 text-primary" />} title={dict.nav.home} />
            <ListRow icon={<HelpIcon className="h-5 w-5 text-primary" />} title={dict.profile.help} />
          </div>
          <div className="mt-6">
            <LanguageToggle label={dict.drawer.language} locale={locale} onChange={() => undefined} />
          </div>
        </div>
      </Drawer>
    </main>
  );
}
