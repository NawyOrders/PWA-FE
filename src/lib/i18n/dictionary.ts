import ar from "./legacy-ar";
import en from "./legacy-en";

export const dictionaries = { ar, en } as const;
export type MessageKey = keyof typeof ar;
