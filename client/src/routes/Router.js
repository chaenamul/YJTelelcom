import React, { Suspense, lazy, cloneElement } from "react";
import { useRoutes, Navigate } from "react-router-dom";

const MainPage = lazy(() => import("pages/MainPage"));
const Playground = lazy(() => import("pages/Playground"));
const Page404 = lazy(() => import("pages/Page404"));

function Router() {
  const routes = useRoutes([
    {
      path: "/",
      children: [
        { element: <Navigate to="/main" replace />, index: true },
        { path: "main", element: <MainPage /> },
        { path: "playground", element: <Playground />},
      ],
    },
    { path: "*", element: <Page404 /> },
  ]);
  if (!routes) return null;

  const clone = cloneElement(routes, { key: routes.props.children.key });

  return (
    <Suspense
      fallback={
        <div className="text-center">
          <br />
          Loading...
        </div>
      }
    >
      {clone}
    </Suspense>
  );
}

export default Router;
