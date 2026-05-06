const STORAGE_KEY = "vesper_guest_cart_v1";

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeQuantity = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 1;
  return Math.max(1, Math.min(parsed, 99));
};

const normalizeSize = (value) => {
  const size = String(value || "").trim();
  return size || "Unspecified";
};

const getItemKey = (productId, size) =>
  `${Number(productId)}::${normalizeSize(size)}`;

const persist = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getGuestCartItems = () => {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY)).map((item) => ({
    ...item,
    size: normalizeSize(item?.size),
  }));
};

export const addGuestCartItem = (product, quantity = 1, size) => {
  const items = getGuestCartItems();
  const safeQuantity = normalizeQuantity(quantity);
  const safeSize = normalizeSize(size);
  const id = Number(product?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return items;
  }

  const index = items.findIndex(
    (item) => getItemKey(item.id, item.size) === getItemKey(id, safeSize),
  );

  if (index >= 0) {
    items[index] = {
      ...items[index],
      quantity: normalizeQuantity(
        Number(items[index].quantity || 1) + safeQuantity,
      ),
    };
  } else {
    items.push({
      id,
      name: product?.name || "Product",
      price: Number(product?.price || 0),
      gender: product?.gender || "men",
      category: product?.category || "shirts",
      image: product?.image || "",
      quantity: safeQuantity,
      size: safeSize,
    });
  }

  persist(items);
  return items;
};

export const removeGuestCartItem = (productId, size) => {
  const itemKey = getItemKey(productId, size);
  const items = getGuestCartItems().filter(
    (item) => getItemKey(item.id, item.size) !== itemKey,
  );
  persist(items);
  return items;
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const mergeGuestCartIntoServerCart = async () => {
  const guestItems = getGuestCartItems();
  if (!guestItems.length) {
    return { mergedCount: 0, failedCount: 0 };
  }

  const mergedIds = new Set();

  for (const item of guestItems) {
    const productId = Number(item?.id);
    const quantity = normalizeQuantity(item?.quantity);
    const size = normalizeSize(item?.size);

    if (!Number.isInteger(productId) || productId <= 0) {
      continue;
    }

    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity, size }),
      });

      if (response.ok) {
        mergedIds.add(getItemKey(productId, size));
      }
    } catch {
      // Keep item in guest cart and continue merging other items.
    }
  }

  const remainingItems = guestItems.filter(
    (item) => !mergedIds.has(getItemKey(item?.id, item?.size)),
  );
  persist(remainingItems);

  return {
    mergedCount: mergedIds.size,
    failedCount: remainingItems.length,
  };
};
