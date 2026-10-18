const SAVE_NAME_DELAY_MS = 600;

export async function saveDisplayName(name: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SAVE_NAME_DELAY_MS));
  if (!name.trim()) {
    throw new Error("Name is required");
  }
}
