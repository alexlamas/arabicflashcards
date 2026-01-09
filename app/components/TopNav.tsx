"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  PlayCircle,
  GameController,
  CardsThree,
  GearSix,
  HouseSimple,
  NotePencil,
  Swatches,
  SignOut,
  ChatCircle,
  CaretDown,
  List,
} from "@phosphor-icons/react";
import { useWords } from "../contexts/WordsContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { AVATAR_OPTIONS } from "../services/profileService";
import { AuthDialog } from "./AuthDialog";
import { SettingsModal } from "./SettingsModal";
import { FeedbackModal } from "./FeedbackModal";
import { useOfflineNavigation } from "../hooks/useOfflineNavigation";
import { useUserRoles } from "../hooks/useUserRoles";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  active: boolean;
  badge?: number;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
}

function NavLink({  active, badge, icon: Icon, children, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5",
        active
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center bg-gray-200">
          {badge}
        </span>
      )}
    </button>
  );
}

interface MobileNavLinkProps {
  href: string;
  active: boolean;
  badge?: number;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
}

function MobileNavLink({  active, badge, icon: Icon, children, onClick }: MobileNavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 text-left text-base font-medium transition-colors flex items-center gap-3",
        active
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <Icon className="h-5 w-5" />
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 ml-auto">
          {badge}
        </span>
      )}
    </button>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const { navigate } = useOfflineNavigation();
  const { reviewCount } = useWords();
  const { session, handleLogout } = useAuth();
  const { firstName: profileFirstName, avatar, isLoading: isProfileLoading } = useProfile();
  const { isAdmin, isReviewer } = useUserRoles();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayName = profileFirstName || session?.user?.email?.split("@")[0] || "User";
  const avatarImage = AVATAR_OPTIONS.find(a => a.id === avatar)?.image || "/avatars/pomegranate.svg";

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <AuthDialog />

      <nav className="fixed top-0 pt-4 bg-white left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="h-12 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-sm px-2 pr-1">
          {/* Mobile hamburger - on left */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <List className="h-5 w-5" />
          </Button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              href="/"
              active={pathname === "/"}
              icon={HouseSimple}
              onClick={() => handleNavigate("/")}
            >
              Home
            </NavLink>
            <NavLink
              href="/my-words"
              active={pathname === "/my-words"}
              icon={CardsThree}
              onClick={() => handleNavigate("/my-words")}
            >
              My words
            </NavLink>
            <NavLink
              href="/memory-game"
              active={pathname === "/memory-game"}
              icon={GameController}
              onClick={() => handleNavigate("/memory-game")}
            >
              Play
            </NavLink>
            <NavLink
              href="/review"
              active={pathname === "/review"}
              icon={PlayCircle}
              badge={reviewCount}
              onClick={() => handleNavigate("/review")}
            >
              Review
            </NavLink>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop right side */}
          <div className="hidden md:flex items-center">
            {/* User dropdown - only show when profile is loaded */}
            {!isProfileLoading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full p-1 h-auto gap-1.5 pr-3 shadow-sm text-sm font-medium animate-in fade-in duration-300"
                  >
                    <Image
                      src={avatarImage}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    {displayName}
                    <CaretDown className="h-3 w-3 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-gray-500">
                  {session?.user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <GearSix className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                  <ChatCircle className="w-4 h-4 mr-2" />
                  Send feedback
                </DropdownMenuItem>
                {(isAdmin || isReviewer) && (
                  <>
                    <DropdownMenuSeparator />
                    {isReviewer && (
                      <DropdownMenuItem onClick={() => handleNavigate("/content-editor")}>
                        <NotePencil className="w-4 h-4 mr-2" />
                        Content editor
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => handleNavigate("/admin")}>
                          <GearSix className="w-4 h-4 mr-2" />
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate("/design-system")}>
                          <Swatches className="w-4 h-4 mr-2" />
                          Design system
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <SignOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile avatar on right - only show when profile is loaded */}
          <div className="md:hidden">
            {!isProfileLoading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full animate-in fade-in duration-300">
                    <Image
                      src={avatarImage}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-xs text-gray-500">
                    {session?.user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <GearSix className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                    <ChatCircle className="w-4 h-4 mr-2" />
                    Send feedback
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <SignOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="py-2">
              <MobileNavLink
                href="/"
                active={pathname === "/"}
                icon={HouseSimple}
                onClick={() => handleNavigate("/")}
              >
                Home
              </MobileNavLink>
              <MobileNavLink
                href="/my-words"
                active={pathname === "/my-words"}
                icon={CardsThree}
                onClick={() => handleNavigate("/my-words")}
              >
                My words
              </MobileNavLink>
              <MobileNavLink
                href="/memory-game"
                active={pathname === "/memory-game"}
                icon={GameController}
                onClick={() => handleNavigate("/memory-game")}
              >
                Play
              </MobileNavLink>
              <MobileNavLink
                href="/review"
                active={pathname === "/review"}
                icon={PlayCircle}
                badge={reviewCount}
                onClick={() => handleNavigate("/review")}
              >
                Review
              </MobileNavLink>

              {/* Admin section */}
              {(isAdmin || isReviewer) && (
                <>
                  <div className="border-t my-2 mx-4" />
                  {isReviewer && (
                    <MobileNavLink
                      href="/content-editor"
                      active={pathname === "/content-editor"}
                      icon={NotePencil}
                      onClick={() => handleNavigate("/content-editor")}
                    >
                      Content editor
                    </MobileNavLink>
                  )}
                  {isAdmin && (
                    <>
                      <MobileNavLink
                        href="/admin"
                        active={pathname === "/admin"}
                        icon={GearSix}
                        onClick={() => handleNavigate("/admin")}
                      >
                        Admin
                      </MobileNavLink>
                      <MobileNavLink
                        href="/design-system"
                        active={pathname === "/design-system"}
                        icon={Swatches}
                        onClick={() => handleNavigate("/design-system")}
                      >
                        Design system
                      </MobileNavLink>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
}
