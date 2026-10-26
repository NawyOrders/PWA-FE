export interface CacheLike {
  match(request: Request | string): Promise<Response | undefined>;
  put(request: Request | string, response: Response): Promise<void>;
  keys(): Promise<ReadonlyArray<Request>>;
  delete(request: Request | string): Promise<boolean>;
  addAll(requests: ReadonlyArray<string | Request>): Promise<void>;
}

export interface CacheStorageLike {
  open(name: string): Promise<CacheLike>;
  keys(): Promise<string[]>;
  delete(name: string): Promise<boolean>;
}

export type FetchLike = (input: Request | string, init?: RequestInit) => Promise<Response>;
