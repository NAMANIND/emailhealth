"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UserGroupIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  googleId: string;
  accessToken: string | null;
  refreshToken: string | null;
  createdAt: string;
  updatedAt: string;
}

const navItems = [
  { name: "Health Analysis", href: "/admin", icon: HomeIcon },
  { name: "Users", href: "/admin/users", icon: UserGroupIcon },
  {
    name: "Apis",
    href: "/admin/usage",
    icon: LinkIcon,
  },
];

export function NavBar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.userInfo);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleGoogleLogin = async () => {
    window.location.href = "/api/auth";
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <span className="text-2xl font-bold text-blue-600">eHealth</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin" && pathname === "/admin") ||
            (item.href === "/admin/users" && pathname === "/admin/users");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-gray-200">
        {!currentUser && (
          <div className="p-4">
            <button
              onClick={() => setShowPopup(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Add Yourself
            </button>
          </div>
        )}
        {currentUser && (
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex-shrink-0">
                {currentUser.picture ? (
                  <Image
                    className="h-10 w-10 rounded-full ring-2 ring-white"
                    src={currentUser.picture}
                    alt={currentUser.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white">
                    <span className="text-white font-medium text-sm">
                      {currentUser.name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center cursor-pointer text-sm ">
              <LogoutButton /> Logout
            </div>
          </div>
        )}
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Yourself
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Click the button below to add yourself to the users list using
                Google authentication.
              </p>
              <button
                onClick={() => {
                  setShowPopup(false);
                  handleGoogleLogin();
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
