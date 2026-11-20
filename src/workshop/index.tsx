import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { DEFAULT_TOOLBAR } from "./default-toolbar";

import "./lab.css";

import type { ToolbarModule, ToolbarProps } from "./types";

/**
 * Toolbar variations. Each file in ./toolbars is one variation, picked with
 * ?toolbar=<file name>. Adding a file is all it takes: nothing here needs to
 * change, so parallel sessions never edit the same file.
 */

type Variation = {
  slug: string;
  name: string;
  idea: string;
  Component: ToolbarModule["default"];
};

const modules = import.meta.glob<ToolbarModule>("./toolbars/*.tsx", {
  eager: true,
});

const toSlug = (filePath: string) =>
  filePath.replace(/^.*\//, "").replace(/\.tsx$/, "");

export const variations: Variation[] = Object.entries(modules)
  .map(([filePath, mod]) => {
    const slug = toSlug(filePath);
    return {
      slug,
      name: mod.meta?.name || slug,
      idea: mod.meta?.idea || "",
      Component: mod.default,
    };
  })
  .filter((variation) => typeof variation.Component === "function")
  .sort((a, b) => {
    // Excalidraw's own toolbar first, then A to Z
    if (a.slug === "original") {
      return -1;
    }
    if (b.slug === "original") {
      return 1;
    }
    return a.slug.localeCompare(b.slug);
  });

const findVariation = (slug: string | null | undefined) =>
  variations.find((variation) => variation.slug === slug);

const getDefaultSlug = () =>
  findVariation(DEFAULT_TOOLBAR)?.slug || variations[0]?.slug || "original";

const readSlugFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return findVariation(params.get("toolbar"))?.slug || getDefaultSlug();
};

// A tiny store, so the toolbar and the lab pill stay in sync.
let currentSlug = readSlugFromUrl();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getCurrentSlug = () => currentSlug;

export const setToolbar = (slug: string) => {
  if (!findVariation(slug) || slug === currentSlug) {
    return;
  }
  currentSlug = slug;
  const url = new URL(window.location.href);
  url.searchParams.set("toolbar", slug);
  window.history.replaceState(window.history.state, "", url);
  listeners.forEach((listener) => listener());
};

const stepToolbar = (step: 1 | -1) => {
  const index = variations.findIndex(
    (variation) => variation.slug === currentSlug,
  );
  const next =
    variations[(index + step + variations.length) % variations.length];
  if (next) {
    setToolbar(next.slug);
  }
};

const useCurrentSlug = () =>
  useSyncExternalStore(subscribe, getCurrentSlug, getCurrentSlug);

/**
 * If a variation crashes while it renders, show Excalidraw's toolbar instead
 * so the app keeps working, and say what happened in the console.
 */
class VariationErrorBoundary extends React.Component<
  { slug: string; fallback: () => React.ReactNode; children: React.ReactNode },
  { failedSlug: string | null }
> {
  state = { failedSlug: null as string | null };

  static getDerivedStateFromError() {
    return { failedSlug: "pending" };
  }

  componentDidCatch(error: Error) {
    console.error(
      `The "${this.props.slug}" toolbar crashed, so Excalidraw's toolbar is showing instead.`,
      error,
    );
    this.setState({ failedSlug: this.props.slug });
  }

  componentDidUpdate(prevProps: { slug: string }) {
    if (prevProps.slug !== this.props.slug && this.state.failedSlug) {
      this.setState({ failedSlug: null });
    }
  }

  render() {
    if (this.state.failedSlug) {
      return this.props.fallback();
    }
    return this.props.children;
  }
}

const WorkshopToolbar = (props: ToolbarProps) => {
  const slug = useCurrentSlug();
  const variation = findVariation(slug);

  if (!variation) {
    return <>{props.renderDefault()}</>;
  }

  const { Component } = variation;
  return (
    <VariationErrorBoundary slug={slug} fallback={props.renderDefault}>
      <Component {...props} />
    </VariationErrorBoundary>
  );
};

/** Passed to <Excalidraw renderToolbar={...}> in excalidraw-app/App.tsx. */
export const renderWorkshopToolbar = (props: ToolbarProps) => (
  <WorkshopToolbar {...props} />
);

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
};

/**
 * The lab switcher: a small pill that appears when there's more than one
 * variation. [ and ] switch too. Add ?lab=0 to the URL to hide it.
 */
export const ToolbarLab = () => {
  const slug = useCurrentSlug();
  const [isListOpen, setIsListOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const isHidden =
    new URLSearchParams(window.location.search).get("lab") === "0";
  const isEnabled = variations.length > 1 && !isHidden;

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      if (event.key === "[" || event.key === "]") {
        event.preventDefault();
        stepToolbar(event.key === "]" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isEnabled]);

  useEffect(() => {
    if (!isListOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!pillRef.current?.contains(event.target as Node)) {
        setIsListOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [isListOpen]);

  if (!isEnabled) {
    return null;
  }

  const index = variations.findIndex((variation) => variation.slug === slug);
  const current = variations[index];

  return (
    <div className="workshop-lab" ref={pillRef} data-testid="toolbar-lab">
      {isListOpen && (
        <ul className="workshop-lab__list" role="listbox">
          {variations.map((variation) => (
            <li key={variation.slug}>
              <button
                type="button"
                role="option"
                aria-selected={variation.slug === slug}
                className="workshop-lab__option"
                onClick={() => {
                  setToolbar(variation.slug);
                  setIsListOpen(false);
                }}
              >
                <span className="workshop-lab__option-name">
                  {variation.name}
                </span>
                {variation.idea && (
                  <span className="workshop-lab__option-idea">
                    {variation.idea}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="workshop-lab__step"
        aria-label="Previous toolbar ([)"
        title="Previous toolbar ([)"
        onClick={() => stepToolbar(-1)}
      >
        <span aria-hidden="true">&lsaquo;</span>
      </button>
      <button
        type="button"
        className="workshop-lab__current"
        aria-haspopup="listbox"
        aria-expanded={isListOpen}
        onClick={() => setIsListOpen(!isListOpen)}
      >
        <span className="workshop-lab__label">Toolbar</span>
        <span className="workshop-lab__name">{current?.name}</span>
        <span className="workshop-lab__count">
          {index + 1} of {variations.length}
        </span>
      </button>
      <button
        type="button"
        className="workshop-lab__step"
        aria-label="Next toolbar (])"
        title="Next toolbar (])"
        onClick={() => stepToolbar(1)}
      >
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </div>
  );
};
