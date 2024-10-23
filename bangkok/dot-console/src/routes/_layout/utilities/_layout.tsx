import { Tabs } from "../../../components/ui";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { css } from "styled-system/css";

export const Route = createFileRoute("/_layout/utilities/_layout")({
  component: UtilitiesPage,
});

function UtilitiesPage() {
  const location = useLocation();
  return (
    <div className={css({ padding: "2rem" })}>
      <Tabs.Root value={location.pathname}>
        <Tabs.List>
          <Tabs.Trigger asChild value="/utilities/planck-convertor">
            <Link to="/utilities/planck-convertor">Planck convertor</Link>
          </Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value={location.pathname}>
          <Outlet />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
