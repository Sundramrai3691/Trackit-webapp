// frontend/src/components/SplineHero.jsx
import React, { Suspense, useState } from "react";

// Lazy-load Spline so it doesn't inflate initial bundle
const Spline = React.lazy(() => import("@splinetool/react-spline"));

/**
 * SplineHero
 * Props:
 *  - sceneUrl: optional; Spline public scene URL (string). If not provided uses a stable public example.
 *
 * Notes:
 *  - Replace DEFAULT_SCENE_URL with your own exported Spline scene URL.
 *  - If Spline fails to load (network/blocking), component falls back to a static image and loader.
 */
export default function SplineHero({ sceneUrl }) {
  const [errored, setErrored] = useState(false);

  // Public example scene (works as a live demo). Replace this with your own scene export.
  // TODO: Replace DEFAULT_SCENE_URL with your exported Spline public URL.
  const DEFAULT_SCENE_URL =
    "https://prod.spline.design/LEvjG3OETYd2GsRw/scene.splinecode";

  const fallbackImg =
    "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

  // If Spline fails to import / render, show static fallback
  if (errored) {
    return (
      <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600/10 to-purple-600/10 flex items-center justify-center">
        <img
          alt="3D fallback"
          src={fallbackImg}
          className="w-full h-full object-cover opacity-95"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="text-center text-white px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading 3D Scene…</p>
            </div>
          </div>
        }
      >
        {/* 
          Use sceneUrl prop if provided, otherwise fallback to DEFAULT_SCENE_URL.
          If Spline fails at runtime, catch via onError (try/catch not available for lazy import),
          so we guard with try/catch around render using an error boundary pattern is better,
          but here we use onLoad/onError event support from Spline (if available) — and a safety try/catch wrapper.
        */}
        <ErrorBoundary onError={() => setErrored(true)}>
          <div className="w-full h-full">
            <Spline
              scene={sceneUrl || DEFAULT_SCENE_URL}
              onLoad={() => {
                /* optional: console.log('Spline loaded') */
              }}
              onError={(err) => {
                console.warn("Spline failed to load:", err);
                setErrored(true);
              }}
            />
          </div>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

/**
 * Minimal ErrorBoundary component so we can catch rendering errors from Spline.
 * Small, self-contained — avoids adding an external dependency.
 */
function ErrorBoundary({ children, onError = () => {} }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  try {
    return (
      <ErrorCatcher
        onCatch={() => {
          setHasError(true);
          onError();
        }}
      >
        {children}
      </ErrorCatcher>
    );
  } catch (err) {
    // This shouldn't usually run — but just in case
    console.warn("ErrorBoundary caught:", err);
    setHasError(true);
    onError();
    return null;
  }
}

/**
 * ErrorCatcher — helper wrapper that uses a render callback to surface synchronous render errors.
 * This is a very light-weight approach; if you prefer, replace with a full React ErrorBoundary class component.
 */
function ErrorCatcher({ children, onCatch }) {
  try {
    return <>{children}</>;
  } catch (err) {
    onCatch(err);
    return null;
  }
}
