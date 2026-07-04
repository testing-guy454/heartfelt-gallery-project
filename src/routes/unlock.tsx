import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/unlock")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
