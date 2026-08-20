import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import AuthPage from "./pages/Auth.tsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation, useParams } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));

const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const BranchPage = lazy(() => import("./pages/BranchPage.tsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.tsx"));
const AdminIndex = lazy(() => import("./pages/admin/AdminIndex.tsx"));
const BranchesAdmin = lazy(() =>
  import("./pages/admin/screens-content.tsx").then((m) => ({ default: m.BranchesAdmin })),
);
const PlansAdmin = lazy(() =>
  import("./pages/admin/screens-content.tsx").then((m) => ({ default: m.PlansAdmin })),
);
const OffersAdmin = lazy(() =>
  import("./pages/admin/screens-content.tsx").then((m) => ({ default: m.OffersAdmin })),
);
const TrainersAdmin = lazy(() =>
  import("./pages/admin/screens-content.tsx").then((m) => ({ default: m.TrainersAdmin })),
);
const TestimonialsAdmin = lazy(() =>
  import("./pages/admin/screens-content.tsx").then((m) => ({ default: m.TestimonialsAdmin })),
);
const ClassesAdmin = lazy(() =>
  import("./pages/admin/screens-content.tsx").then((m) => ({ default: m.ClassesAdmin })),
);
const MediaAdmin = lazy(() =>
  import("./pages/admin/screens-operations.tsx").then((m) => ({ default: m.MediaAdmin })),
);
const SettingsAdmin = lazy(() =>
  import("./pages/admin/screens-operations.tsx").then((m) => ({ default: m.SettingsAdmin })),
);
const MembersAdmin = lazy(() =>
  import("./pages/admin/screens-operations.tsx").then((m) => ({ default: m.MembersAdmin })),
);
const ActivityAdmin = lazy(() =>
  import("./pages/admin/screens-operations.tsx").then((m) => ({ default: m.ActivityAdmin })),
);
const BookingsAdmin = lazy(() =>
  import("./pages/admin/screens-operations.tsx").then((m) => ({ default: m.BookingsAdmin })),
);

// Franchise management screens
const FranchisesAdmin = lazy(() =>
  import("./pages/admin/screens-franchise.tsx").then((m) => ({ default: m.FranchisesAdmin })),
);
const FranchiseDetailScreen = lazy(() =>
  import("./pages/admin/screens-franchise.tsx").then((m) => ({ default: m.FranchiseDetailScreen })),
);
const FranchiseAdminsScreen = lazy(() =>
  import("./pages/admin/screens-franchise.tsx").then((m) => ({ default: m.FranchiseAdminsScreen })),
);
const CustomersAdmin = lazy(() =>
  import("./pages/admin/screens-franchise.tsx").then((m) => ({ default: m.CustomersAdmin })),
);
const MembershipsAdmin = lazy(() =>
  import("./pages/admin/screens-franchise.tsx").then((m) => ({ default: m.MembershipsAdmin })),
);
const MyFranchiseScreen = lazy(() =>
  import("./pages/admin/screens-franchise.tsx").then((m) => ({ default: m.MyFranchiseScreen })),
);
const ShoePage = lazy(() => import("./pages/Shoe.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

/** Wrapper to pass the :id route param to FranchiseDetailScreen */
function FranchiseDetailWrapper() {
  const { id } = useParams();
  return <FranchiseDetailScreen franchiseId={id ?? ""} />;
}

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Guard against missing/placeholder Convex URL so the app boots in demo mode
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const isConvexConfigured =
  convexUrl &&
  convexUrl.includes(".convex.cloud") &&
  !convexUrl.startsWith("https://placeholder");
const convex = new ConvexReactClient(
  isConvexConfigured ? convexUrl : "https://placeholder.convex.cloud",
);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/dashboard" />}
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route path="/branch/:id" element={<BranchPage />} />
              <Route path="/shoe" element={<ShoePage />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminIndex />} />
                <Route path="branches" element={<BranchesAdmin />} />
                <Route path="plans" element={<PlansAdmin />} />
                <Route path="offers" element={<OffersAdmin />} />
                <Route path="trainers" element={<TrainersAdmin />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="classes" element={<ClassesAdmin />} />
                <Route path="media" element={<MediaAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
                <Route path="members" element={<MembersAdmin />} />
                <Route path="activity" element={<ActivityAdmin />} />
                <Route path="bookings" element={<BookingsAdmin />} />
                {/* Franchise management routes */}
                <Route path="franchises" element={<FranchisesAdmin />} />
                <Route path="franchises/:id" element={<FranchiseDetailWrapper />} />
                <Route path="franchise-admins" element={<FranchiseAdminsScreen />} />
                <Route path="customers" element={<CustomersAdmin />} />
                <Route path="memberships" element={<MembershipsAdmin />} />
                <Route path="my-franchise" element={<MyFranchiseScreen />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
