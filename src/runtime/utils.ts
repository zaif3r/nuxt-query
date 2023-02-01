import type { QueryArgs } from "../types";
import type { MaybeRef } from "@vueuse/core";
import { get } from "@vueuse/core";
import { toRaw } from "vue";

export function unwrapArgs<Args extends object>(
  args?: QueryArgs<Args>
): Partial<Args> {
  if (!args) return {} as Partial<Args>;

  const keys = Object.keys(args) as (keyof Args)[];
  const unwrappedArgs: Partial<Args> = {};

  for (const key of keys) {
    const maybeRef = args[key] as MaybeRef<Args[keyof Args]> | undefined;
    if (!maybeRef) continue;

    unwrappedArgs[key] = toRaw(get(maybeRef));
  }

  return unwrappedArgs;
}

export function validateArgs<Args extends object>(
  args: Partial<Args>,
  required?: (keyof Args)[]
): Args {
  if (!required) return args as Args;

  for (const key of required) {
    if (args[key] == undefined) {
      throw new Error(`Missing required argument: ${String(key)}`);
    }
  }

  return args as Args;
}
