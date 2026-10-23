# Restaurant App — Bug Report

**Project:** Restaurant App Testing  
**Reporter:** Mohamed Hafez  
**Date Reported:** 23/10/2026

---

## Bug 1: Basket Fails to Revalidate Updated Menu Prices at Checkout

| Field | Details |
|---|---|
| Story ID | US 3.2: Basket Calculation & Review |
| Test Case ID | TC-03.2.02 |
| Epic | Epic 3: Customization, Basket & Promotions (EP-03) |
| Severity | High |
| Priority | High |

### Description
The basket does not revalidate menu prices against the backend when the customer enters checkout. If an item's price changes after it has been added to the cart, checkout continues with the stale price.

### Preconditions
- The customer has an item in their basket priced at **80 EGP**.

### Steps to Reproduce
1. Add an item priced at 80 EGP to the customer cart.
2. In the restaurant admin panel, update that item's price to 95 EGP.
3. In the customer app/web, click **Proceed to Checkout**.

### Actual Result
The cart continues to show the old price of 80 EGP, and checkout proceeds using the stale/cached price.

### Expected Result
- Revalidate all cart item prices against the backend menu API when entering checkout.
- If a price change is detected, clearly notify the customer with a message such as: **“Price for [Item] has changed.”**
- Update the affected cart line item to 95 EGP.
- Recalculate the subtotal, taxes, and grand total before allowing the customer to continue.
- Ensure the final order uses server-validated prices rather than client-cached values.

---

## Bug 2: Checkout Allows Inactive or Out-of-Stock Items

| Field | Details |
|---|---|
| Story ID | US 3.2: Basket Calculation & Review |
| Test Case ID | TC-03.2.03 |
| Epic | Epic 3: Customization, Basket & Promotions (EP-03) |
| Severity | Critical |
| Priority | High |

### Description
The cart does not reflect item availability changes made in the admin dashboard. Customers can continue checkout or submit an order containing an inactive or out-of-stock item.

### Preconditions
- The customer has an active menu item in their cart.

### Steps to Reproduce
1. Add a menu item to the cart.
2. In the admin dashboard, mark that item as unavailable or out of stock for the serving branch.
3. From the customer app, submit checkout or proceed with the order.

### Actual Result
The cart is not updated after the admin changes the item's status. Checkout/order submission succeeds without notifying the customer.

### Expected Result
- Validate each cart item's active status and availability for the serving branch before creating the order.
- Block checkout/order submission if any item is inactive or out of stock.
- Visually flag the affected item with an **Out of Stock** badge or equivalent unavailable status.
- Show a clear message, such as: **“[Item] is currently out of stock. Please remove it to proceed.”**
- Do not create an order until the customer resolves all unavailable items.
- Perform the authoritative availability validation on the backend to prevent bypassing client-side checks.

---

## Bug 3: Delivery Fee Is Added Before Delivery Location Verification

| Field | Details |
|---|---|
| Story ID | US-4.1: Fulfilment Selection (Delivery vs. Pickup) |
| Test Case ID | TC-04.1.01 |
| Epic | Epic 4: Fulfilment Routing & Checkout (EP-04) |
| Severity | Medium |
| Priority | High |

### Description
The checkout summary adds a delivery fee before the customer selects and verifies their delivery area/address.

### Preconditions
- The **Zamalek** zone is mapped to **Downtown Branch** with a fixed delivery fee of **30 EGP**.

### Steps to Reproduce
1. Open the checkout/fulfilment selection flow.
2. Select **Delivery** as the fulfilment method.
3. Observe the order summary before entering or selecting the delivery address/zone.
4. Select **Zamalek** from the area dropdown and enter a detailed street address.
5. Review the final checkout summary.

### Actual Result
The application adds the delivery fee before checking the customer's delivery location or confirming the applicable zone.

### Expected Result
- Keep the delivery fee pending, displayed as **0.00 EGP** or **Calculated after selecting delivery area**, until a valid delivery area is selected and verified.
- When the customer selects **Zamalek**, resolve the delivery zone and route the order to **Downtown Branch**.
- Add the configured fixed delivery fee of **30 EGP** to the grand total only after successful zone verification.
- Recalculate and display the order total whenever the verified delivery area changes.
- Do not apply a delivery fee when the delivery area is missing or invalid.

---

## Bug 4: “Print Slip” Does Not Generate a Thermal Receipt

| Field | Details |
|---|---|
| Story ID | US-6.3: Order Slip / Invoice Thermal Printing |
| Test Case ID | TC-06.3.01 |
| Epic | Epic 6: Restaurant Operations & Administration (EP-06) |
| Severity | High |
| Priority | High |

### Description
Clicking **Print Slip** for an accepted order does not produce a receipt or send a visible print job to the connected 80mm thermal printer.

### Preconditions
- The order is in **Accepted** status.
- A compatible 80mm thermal receipt printer is connected and online.

### Steps to Reproduce
1. Open the Admin Panel.
2. Locate an order with **Accepted** status.
3. Click **Print Slip** on the order details card.
4. Check the printer communication/status, print queue, and physical receipt output.

### Actual Result
No receipt is produced, and no print job is visible in the printer queue.

### Expected Result
- Ensure the **Print Slip** action generates a valid receipt payload and sends it through the application's supported printing integration to the connected 80mm thermal printer.
- Print the following details:
  - Restaurant header
  - Order ID
  - Branch
  - Fulfilment type
  - Items and modifiers
  - Kitchen notes
  - Subtotal, delivery fee, taxes (where applicable), and grand total
- Render Arabic text correctly in RTL order without distorted or disconnected characters.
- Handle printer disconnection or print failures with a clear error message and a way to retry.
- Provide meaningful logging so failures can be diagnosed.

---

## Recommended Verification Checklist

- [ ] Updated menu prices are revalidated at checkout and all totals are recalculated correctly.
- [ ] Inactive/out-of-stock items block checkout and order creation until resolved.
- [ ] Delivery fees are applied only after the delivery area is successfully verified.
- [ ] The selected delivery zone routes to the correct branch and uses the configured fee.
- [ ] **Print Slip** generates a receipt containing all required order details.
- [ ] Arabic receipt text prints correctly in RTL layout on an 80mm thermal printer.
- [ ] Error states are visible and actionable; backend validations cannot be bypassed.
