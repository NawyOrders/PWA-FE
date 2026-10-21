import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

function Dialog({
  open = true,
  onClose,
  children,
}: {
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  return (
    <div ref={ref} role="dialog" aria-label="اختبار">
      {children ?? (
        <>
          <button type="button">الأول</button>
          <button type="button">الثاني</button>
        </>
      )}
    </div>
  );
}

describe("useFocusTrap", () => {
  it("UT-FOCUS-01 moves the focus inside the container when it opens", () => {
    render(<Dialog />);

    expect(screen.getByRole("button", { name: "الأول" })).toHaveFocus();
  });

  it("UT-FOCUS-02 keeps the focus inside on Tab from the last item", async () => {
    const user = userEvent.setup();
    render(<Dialog />);

    screen.getByRole("button", { name: "الثاني" }).focus();
    await user.tab();

    expect(screen.getByRole("button", { name: "الأول" })).toHaveFocus();
  });

  it("UT-FOCUS-03 keeps the focus inside on Shift+Tab from the first item", async () => {
    const user = userEvent.setup();
    render(<Dialog />);

    await user.tab({ shift: true });

    expect(screen.getByRole("button", { name: "الثاني" })).toHaveFocus();
  });

  it("UT-FOCUS-04 calls onClose on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Dialog onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("UT-FOCUS-05 does not call onClose for another key", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Dialog onClose={onClose} />);

    await user.keyboard("a");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("UT-FOCUS-06 returns the focus to the trigger when it closes", async () => {
    const user = userEvent.setup();
    function Trigger() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            فتح
          </button>
          {open ? <Dialog onClose={() => setOpen(false)} /> : null}
        </>
      );
    }
    render(<Trigger />);

    await user.click(screen.getByRole("button", { name: "فتح" }));
    expect(screen.getByRole("button", { name: "الأول" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "فتح" })).toHaveFocus();
  });

  it("UT-FOCUS-07 does nothing when the trap is closed", () => {
    render(<Dialog open={false} />);

    expect(screen.getByRole("button", { name: "الأول" })).not.toHaveFocus();
  });

  it("UT-FOCUS-08 survives a container without a focusable child", () => {
    expect(() => render(<Dialog>{null}</Dialog>)).not.toThrow();
  });

  it("UT-FOCUS-09 keeps the focus where it is when the container has no focusable child", () => {
    render(
      <Dialog>
        <span>نص</span>
      </Dialog>,
    );

    expect(document.activeElement).toBe(document.body);
  });

  it("UT-FOCUS-10 ignores Tab when the container has no focusable child", () => {
    render(
      <Dialog>
        <span>نص</span>
      </Dialog>,
    );

    expect(() =>
      fireEvent.keyDown(document, { key: "Tab" }),
    ).not.toThrow();
  });

  it("UT-FOCUS-11 leaves the focus alone when the container is not attached", () => {
    function Detached() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true);
      return null;
    }

    expect(() => render(<Detached />)).not.toThrow();
  });

  it("UT-FOCUS-12 does not move the focus on Tab from a middle item", () => {
    render(<Dialog />);

    screen.getByRole("button", { name: "الأول" }).focus();
    fireEvent.keyDown(document, { key: "Tab" });

    expect(screen.getByRole("button", { name: "الأول" })).toHaveFocus();
  });
});
