import ar from "./ar";
import en from "./en";

export const dictionaries = { ar, en } as const;
export type MessageKey = keyof typeof ar;
