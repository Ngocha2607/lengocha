"use client";

import Image from "next/image";
import { PORTOS_ASSETS, type DesktopIcon, type PortosAppId } from "@/types/portos";

interface DesktopIconsProps {
  onOpen: (app: PortosAppId) => void;
}

interface DesktopIconButtonProps {
  icon: DesktopIcon;
  onOpen: (app: PortosAppId) => void;
}

/** Every desktop folder shares one artwork — intrinsic 236x236, rendered 58x59. */
const FOLDER_SRC = `${PORTOS_ASSETS}/images/folder.png`;

const ABOUT: DesktopIcon = { label: "About", app: "about" };
const WALLPAPER: DesktopIcon = { label: "Wallpaper", app: "wallpaper" };
const PROJECTS: DesktopIcon = { label: "Projects", app: "projects" };

/**
 * A single 58x78.59 desktop folder. Hovering the button presses the artwork in
 * (`scale(0.9)`, 0.2s ease-out) while leaving the label untouched; a single
 * click opens the matching window.
 */
function DesktopIconButton({ icon, onOpen }: DesktopIconButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(icon.app)}
      className="group flex h-[78.59px] w-[58px] cursor-pointer flex-col items-center justify-center"
    >
      <span className="flex h-[59px] w-[58px] cursor-pointer items-center justify-center transition-transform duration-200 ease-out group-hover:scale-90">
        <Image
          src={FOLDER_SRC}
          alt={icon.label}
          width={58}
          height={59}
          className="h-[59px] w-[58px]"
        />
      </span>
      <p className="font-display text-[14px] font-normal leading-[19.6px] tracking-[-0.14px] text-white">
        {icon.label}
      </p>
    </button>
  );
}

/**
 * The three folders sitting on the desktop wallpaper: About and Wallpaper on a
 * `space-between` row, Projects on its own left-aligned row 85px below (30px
 * below 810px, where the row also loses its 100px right padding).
 */
export function DesktopIcons({ onOpen }: DesktopIconsProps) {
  return (
    <div className="flex w-full flex-col items-start justify-center gap-[85px] overflow-clip max-[809px]:gap-[30px]">
      {/* About & Wallpaper Card */}
      <div className="flex h-[78.59px] w-full flex-row items-center justify-between pr-[100px] max-[809px]:pr-0">
        <DesktopIconButton icon={ABOUT} onOpen={onOpen} />
        <DesktopIconButton icon={WALLPAPER} onOpen={onOpen} />
      </div>
      {/* Journal File & Title Wrapper */}
      <div className="flex w-full flex-row items-center justify-start">
        <div className="pt-[13px]">
          <DesktopIconButton icon={PROJECTS} onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}
