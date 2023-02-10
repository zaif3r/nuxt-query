import type { Ref } from "vue";
import type { MaybeRef } from "@vueuse/core";
import type { AsyncDataOptions } from "nuxt/app";

export type QueryArgs<Args extends object> = {
  [Key in keyof Partial<Args>]: MaybeRef<Partial<Args>[Key]>;
};

export type UseQueryArgs<Args extends object> = MaybeRef<
  Partial<QueryArgs<Args>>
>;

export type UseAsyncQueryParams<Args extends object, Data> = {
  key?: string;
  args?: UseQueryArgs<Args>;
  options?: QueryOptions<Args, Data>;
  asyncFn: (args: Args) => Promise<Data>;
};

export type UseAsyncQueryResult<Args extends object, Data> = {
  args: Ref<Partial<Args>>;
  data: Ref<Data | null>;
  error: Ref<Error | null>;
  pending: Ref<boolean>;
  refresh: () => Promise<void>;
  execute: (args?: QueryArgs<Args>) => Promise<Data | null>;
  executeOrFail: (args?: QueryArgs<Args>) => Promise<Data>;
};

export type QueryOptions<Args extends object, Data> = AsyncDataOptions<Data> & {
  required?: (keyof Args)[];
  watchArgs?: (keyof Args)[];
  onError?: (error: any) => any;
  onSuccess?: (data: Data) => any;
  onSettled?: (data?: Data, error?: any) => any;
};
