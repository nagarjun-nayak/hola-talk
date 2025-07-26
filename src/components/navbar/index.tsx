import Image from "next/image";
import Link from "next/link";
import CharacterAnimation from "../animation/character";
import { BiMenuAltRight as MenuIcon } from "react-icons/bi";
import { AiOutlineClose as XIcon } from "react-icons/ai";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { FcGoogle } from "react-icons/fc";
import PopAnimation from "../animation/pop";
import Loader from "../loader";

const Navbar = ({
  status,
  session,
}: {
  status: "loading" | "authenticated" | "unauthenticated";
  session: Session | null;
}) => {
  const links = [
    {
      label: "Home",
      path: "#",
    },
    {
      label: "About",
      path: "#about",
    },
    {
      label: "Contact",
      path: "#contact",
    },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 z-10 w-full border-b border-gray-400/20 bg-white bg-opacity-5 backdrop-blur-lg backdrop-filter">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <PopAnimation>
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                priority
              />
            </PopAnimation>

            {/* This version shows on small screens (sm) and up */}
            <div className="hidden sm:block">
              <CharacterAnimation
                text="Real-Time Video Call Translator & Caption Generator"
                textStyle="text-lg font-bold text-white"
              />
            </div>

            {/* This shorter version shows ONLY on extra-small screens (and is hidden on sm and up) */}
            <div className="block sm:hidden">
              <CharacterAnimation
                text="Real-Time Video Call Translator"
                textStyle="text-lg font-bold text-white"
              />
            </div>
          </Link>

          <div className="hidden space-x-5 text-white lg:flex lg:items-center">
            {links.map((link) => (
              <Link
                className="transition-colors duration-300 hover:text-gray-400"
                key={link.path}
                href={link.path}
              >
                <CharacterAnimation
                  text={link.label}
                  textStyle="text-base font-medium"
                />
              </Link>
            ))}
            <PopAnimation>
              <button
                className="lk-button"
                onClick={() => {
                  if (status === "authenticated") {
                    signOut();
                  } else {
                    signIn("google");
                  }
                }}
              >
                {status === "authenticated" ? (
                  "Sign Out"
                ) : (
                  <div className="flex items-center space-x-2">
                    <FcGoogle />
                    <div>Sign In</div>
                  </div>
                )}
              </button>
            </PopAnimation>
            <PopAnimation>
              <select className="lk-button">
                <option value="en">English</option>
              </select>
            </PopAnimation>

            <PopAnimation>
              <Link href="/profile">
                {status === "loading" ? (
                  <Loader />
                ) : status === "authenticated" ? (
                  <Image
                    src={session?.user.image as string}
                    width={40}
                    height={40}
                    className="cursor-pointer rounded-full transition duration-300 hover:grayscale"
                    alt="profile picture"
                  />
                ) : null}
              </Link>
            </PopAnimation>
          </div>

          <div className="flex items-center space-x-4 lg:hidden">
            {isMenuOpen ? (
              <XIcon className="h-6 w-6 text-white" onClick={toggleMenu} />
            ) : (
              <MenuIcon className="h-6 w-6 text-white" onClick={toggleMenu} />
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="flex flex-col space-y-2 p-4 pb-5 text-white lg:hidden">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="block rounded px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-3 pt-1">
              <button
                className="lk-button text-sm"
                onClick={() => {
                  // This logic seems reversed, should be signOut if authenticated
                  if (status === "authenticated") {
                    signOut();
                  } else {
                    signIn("google");
                  }
                }}
              >
                {status === "authenticated" ? "Sign Out" : "Sign In"}
              </button>
              <select className="lk-button text-sm">
                <option value="en">English</option>
              </select>
            </div>
            <PopAnimation>
              <Link href="/profile">
                {status === "loading" ? (
                  <Loader />
                ) : status === "authenticated" ? (
                  <Image
                    src={session?.user.image as string}
                    width={40}
                    height={40}
                    className="cursor-pointer rounded-full transition duration-300 hover:grayscale"
                    alt="profile picture"
                  />
                ) : null}
              </Link>
            </PopAnimation>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;