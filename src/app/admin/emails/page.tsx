"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Email {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  location?: "inbox" | "spam";
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

interface UserEmails {
  user: User;
  recentEmails: Email[];
  spamEmails: Email[];
  error?: string;
}

interface SearchResult {
  user: User;
  results: Email[];
  error?: string;
}

export default function EmailsPage() {
  const router = useRouter();
  const [userEmails, setUserEmails] = useState<UserEmails[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch("/api/emails");
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        const data = await response.json();
        setUserEmails(data.userEmails);
      } catch (error) {
        console.error("Error fetching emails:", error);
        setError("Please log in to view this page");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/emails/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.searchResults);
    } catch (error) {
      console.error("Error searching emails:", error);
      setError("Failed to search emails");
    } finally {
      setIsSearching(false);
    }
  };

  const getEmailHeader = (email: Email, headerName: string) => {
    return (
      email.payload.headers.find((header) => header.name === headerName)
        ?.value || ""
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Email Overview
            </h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {searchResults.length > 0
            ? // Display search results
              searchResults.map((userData) => (
                <div key={userData.user.id} className="mb-8">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center space-x-4">
                      {userData.user.picture ? (
                        <Image
                          src={userData.user.picture}
                          alt={userData.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {userData.user.name[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {userData.user.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {userData.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {userData.error ? (
                    <div className="px-4 py-5 sm:px-6">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-700">{userData.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 sm:px-0">
                      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Search Results
                          </h3>
                        </div>
                        <div className="border-t border-gray-200">
                          <ul className="divide-y divide-gray-200">
                            {userData.results.map((email) => (
                              <li key={email.id} className="px-4 py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {getEmailHeader(email, "Subject")}
                                      </p>
                                      <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                          email.location === "spam"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {email.location}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                      From: {getEmailHeader(email, "From")}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                      {email.snippet}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            : // Display regular email overview
              userEmails.map((userData) => (
                <div key={userData.user.id} className="mb-8">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center space-x-4">
                      {userData.user.picture ? (
                        <Image
                          src={userData.user.picture}
                          alt={userData.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {userData.user.name[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {userData.user.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {userData.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {userData.error ? (
                    <div className="px-4 py-5 sm:px-6">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-700">{userData.error}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Recent Emails Section */}
                      <div className="px-4 py-8 sm:px-0">
                        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                          <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              Recent Emails
                            </h3>
                          </div>
                          <div className="border-t border-gray-200">
                            <ul className="divide-y divide-gray-200">
                              {userData.recentEmails.map((email) => (
                                <li key={email.id} className="px-4 py-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {getEmailHeader(email, "Subject")}
                                      </p>
                                      <p className="text-sm text-gray-500 truncate">
                                        From: {getEmailHeader(email, "From")}
                                      </p>
                                      <p className="text-sm text-gray-500 truncate">
                                        {email.snippet}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Spam Emails Section */}
                      <div className="px-4 py-8 sm:px-0">
                        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                          <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              Spam Emails
                            </h3>
                          </div>
                          <div className="border-t border-gray-200">
                            <ul className="divide-y divide-gray-200">
                              {userData.spamEmails.map((email) => (
                                <li key={email.id} className="px-4 py-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {getEmailHeader(email, "Subject")}
                                      </p>
                                      <p className="text-sm text-gray-500 truncate">
                                        From: {getEmailHeader(email, "From")}
                                      </p>
                                      <p className="text-sm text-gray-500 truncate">
                                        {email.snippet}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
        </div>
      </main>
    </div>
  );
}
