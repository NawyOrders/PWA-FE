import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SwipeToDelete } from "./SwipeToDelete";
import { renderWithProviders } from "../../tests/utils/render";

function renderSwipe(locale: "ar" | "en" = "ar") {
  const onDelete = vi.fn();
  const view = renderWithProviders(
    <SwipeToDelete onDelete={onDelete} deleteLabel="حذف">
      <p>عنصر السلة</p>
    </SwipeToDelete>,
    { locale },
  );
  return { ...view, onDelete };
}

describe("SwipeToDelete", () => {
  it("UT-SWIPE-01 always offers the delete button", () => {
    renderSwipe();

    expect(screen.getByRole("button", { name: "حذف" })).toBeInTheDocument();
  });

  it("UT-SWIPE-02 deletes with the keyboard alternative", async () => {
    const { user, onDelete } = renderSwipe();

    await user.click(screen.getByRole("button", { name: "حذف" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("UT-SWIPE-03 keeps the content visible before the drag", () => {
    renderSwipe();

    const content = screen.getByText("عنصر السلة").parentElement!;
    expect(content.style.transform).toBe("translateX(0px)");
  });

  it("UT-SWIPE-04 reveals the delete area after a long drag", () => {
    renderSwipe();

    const content = screen.getByText("عنصر السلة").parentElement!;
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 300, pointerType: "touch" });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 200, pointerType: "touch" });
    fireEvent.pointerUp(content, { pointerId: 1, clientX: 200, pointerType: "touch" });

    expect(content.style.transform).toBe("translateX(-88px)");
  });

  it("UT-SWIPE-05 snaps back after a short drag", () => {
    renderSwipe();

    const content = screen.getByText("عنصر السلة").parentElement!;
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 300, pointerType: "touch" });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 295, pointerType: "touch" });
    fireEvent.pointerUp(content, { pointerId: 1, clientX: 295, pointerType: "touch" });

    expect(content.style.transform).toBe("translateX(0px)");
  });

  it("UT-SWIPE-06 slides the other way in English", () => {
    renderSwipe("en");

    const content = screen.getByText("عنصر السلة").parentElement!;
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 200, pointerType: "touch" });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 300, pointerType: "touch" });
    fireEvent.pointerUp(content, { pointerId: 1, clientX: 300, pointerType: "touch" });

    expect(content.style.transform).toBe("translateX(88px)");
  });

  it("UT-SWIPE-07 does not delete while dragging", () => {
    const { onDelete } = renderSwipe();

    const content = screen.getByText("عنصر السلة").parentElement!;
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 300, pointerType: "touch" });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 120, pointerType: "touch" });
    fireEvent.pointerUp(content, { pointerId: 1, clientX: 120, pointerType: "touch" });

    expect(onDelete).not.toHaveBeenCalled();
  });
});
