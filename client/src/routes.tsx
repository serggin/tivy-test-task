import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { NotFound } from "./pages";
import { ErrorPage } from "./pages/ErrorPage";
import Home from "./pages/Home";
import EventsPage from "./pages/Events";
import EventPage from "./pages/Event";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home />, handle: {crumb: (data: any) => <span>{data.threadName}</span>} },
      { path: "/events/:cityId", element: <EventsPage /> },
      { path: "/event/:eventId", element: <EventPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}
