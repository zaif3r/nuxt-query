import type {
  QueryArgs,
  UseAsyncQueryParams,
  UseAsyncQueryResult,
} from "../../types";
import type { AsyncData } from "nuxt/app";
import { ref, computed, toRaw } from "vue";
import { get, computedEager } from "@vueuse/core";
import { unwrapArgs, validateArgs } from "../utils";
import { useAsyncData } from "#imports";

export function useAsyncQuery<Args extends object, Data>({
  key = "",
  asyncFn,
  options,
  args: defaultArgs,
}: UseAsyncQueryParams<Args, Data>): UseAsyncQueryResult<Args, Data> {
  const initialState = ref(true);
  const mutatedArgs = ref<Partial<QueryArgs<Args>>>({});

  const args = computed<Partial<Args>>(() => {
    const unwrappedDefault = unwrapArgs(get(defaultArgs));
    const unwrappedMutated = unwrapArgs(mutatedArgs.value);
    return { ...unwrappedDefault, ...unwrappedMutated };
  });

  function getWatchedArgs(args: Partial<Args>) {
    return options?.watchArgs?.map((key) => args[key]).toString();
  }

  const watchedArgs = ref<any>(getWatchedArgs(args.value));

  watch(args, (newArgs) => {
    if (options?.watchArgs) {
      const watched = getWatchedArgs(newArgs);
      if (watchedArgs.value != watched) {
        watchedArgs.value = watched;
      }
    }
  });

  const asyncData = useAsyncData(
    key,
    async () => {
      initialState.value = false;

      try {
        const validatedArgs = validateArgs(args.value, options?.required);
        const result = await asyncFn(toRaw(validatedArgs));
        options?.onSuccess?.(result);
        options?.onSettled?.(result, undefined);
        return result;
      } catch (error) {
        options?.onError?.(error);
        options?.onSettled?.(undefined, error);
        throw error;
      }
    },
    {
      ...options,
      watch: [...(options?.watch ?? []), watchedArgs],
    }
  ) as AsyncData<Data, Error>;

  const pending = computedEager(() => {
    if (initialState.value) return false;
    return asyncData.pending.value;
  });

  async function execute(args?: QueryArgs<Args>) {
    mutatedArgs.value = args;
    await asyncData.execute();
    return asyncData.data.value;
  }

  async function executeOrFail(args?: QueryArgs<Args>) {
    const result = await execute(args);
    if (asyncData.error.value) throw asyncData.error.value;
    return result as Data;
  }

  return {
    ...asyncData,
    args,
    pending,
    execute,
    executeOrFail,
  };
}
