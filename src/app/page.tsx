"use client";

import { useEffect, useState } from "react";

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

interface TokenData {
  access_token: string;
  refresh_token: string;
}

export default function LoginPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<TokenData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setData(data);
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

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You are already signed in
            </p>

            {data && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Access Token
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={data.access_token}
                      readOnly
                      className="flex-1 p-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={() => handleCopy(data.access_token, "access")}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {copied === "access" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Refresh Token
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={data.refresh_token}
                      readOnly
                      className="flex-1 p-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={() => handleCopy(data.refresh_token, "refresh")}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {copied === "refresh" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to <br />
            Roger Email Health
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to contribute your email for testing
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
