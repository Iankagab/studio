import { createBrowserRouter } from "react-router";
import { Layout } from "@/app/components/Layout";
import { Dashboard } from "@/app/pages/Dashboard";
import { Agendamentos } from "@/app/pages/Agendamentos";
import { Servicos } from "@/app/pages/Servicos";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "agendamentos", Component: Agendamentos },
      { path: "servicos", Component: Servicos },
    ],
  },
]);
