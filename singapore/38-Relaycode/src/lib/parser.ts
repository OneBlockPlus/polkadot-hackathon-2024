import { Method } from "@/components/builder/extrinsic-builder";
import { ApiPromise } from "@polkadot/api";

export function createSectionOptions(
  api: ApiPromise
): { text: string; value: string }[] {
  return Object.keys(api.tx)
    .filter((s) => !s.startsWith("$"))
    .sort()
    .filter((name) => Object.keys(api.tx[name]).length)
    .map((name) => ({
      text: name,
      value: name,
    }));
}

export function createMethodOptions(
  api: ApiPromise,
  sectionName: string
): Method[] {
  const section = api.tx[sectionName];

  if (!section || Object.keys(section).length === 0) {
    return [];
  }

  return Object.keys(section)
    .filter((s) => !s.startsWith("$"))
    .sort()
    .map((method) => {
      const txMethod = section[method];
      const args = txMethod.meta.args.map((arg) => ({
        name: arg.name.toString(),
        type: arg.type.toString(),
      }));

      return {
        section: sectionName,
        method,
        args,
      };
    });
}
