/**
 * Shared contracts for the portos.framer.website clone.
 * Content shapes are transcribed verbatim from the live site.
 */

/** Every window the desktop can open. */
export type PortosAppId =
  | "about"
  | "projects"
  | "writing"
  | "contact"
  | "resume"
  | "gallery"
  | "recycleBin"
  | "experience"
  | "decisions";

/**
 * The owner profile links. Shared because both the dock and the menu bar offer
 * them, and two copies of a URL are two chances for one to go stale.
 */
export const PORTOS_PROFILES = {
  github: "https://github.com/Ngocha2607",
  linkedin: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
} as const;

/** Root of every downloaded asset for this page. */
export const PORTOS_ASSETS = "/sites/portos-framer-website-67488b6b/root-8a5edab2";

/** An item pinned to the dock. Either opens a window or leaves the site. */
export interface DockItem {
  /** `data-framer-name` on the live site — kept so specs and code line up. */
  name: string;
  icon: string;
  alt: string;
  /** Set for in-app icons. */
  app?: PortosAppId;
  /** Set for the two external icons (Instagram, Framer). */
  href?: string;
  /**
   * What the hover tooltip says. Deliberately NOT `name`: that is the live
   * site's Framer layer name, which is the macOS app the icon is borrowed
   * from (Launchpad, Messages, Notes) rather than what clicking it opens
   * (Writing, Resume, Leadership & Technical Decisions). A tooltip's job is to say
   * what the control does. Falls back to `name` when unset.
   */
  tooltip?: string;
  /** Hidden below 810px on the live site. */
  hideOnMobile?: boolean;
}

/** A folder sitting on the desktop. */
export interface DesktopIcon {
  label: string;
  app: PortosAppId;
}

/** Window chrome geometry, per app. */
export interface WindowGeometry {
  width: number;
  height: number;
}

export interface ProjectCard {
  title: string;
  description?: string;
  image: string;
  /** Rendered height in the masonry column, in px at 864px window width. */
  imageHeight: number;
}

export interface GalleryImage {
  src: string;
  height: number;
}

export interface AboutCounter {
  label: string;
  value: string;
}
