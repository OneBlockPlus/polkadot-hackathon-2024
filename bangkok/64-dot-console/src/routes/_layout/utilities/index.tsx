import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/utilities/")({
  loader: () => redirect({ to: "/utilities/planck-convertor" }),
});
