"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Inbox, AlertTriangle, Mail } from "lucide-react";

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
  };
  location?: "inbox" | "spam";
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"spam" | "inbox">("spam");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/emails/search?q=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        const processedEmails = (data.messages || []).map(
          (email: GmailMessage) => ({
            ...email,
            location: email.location,
          })
        );
        setEmails(processedEmails);
        console.log(processedEmails);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailHeader = (
    headers: Array<{ name: string; value: string }>,
    name: string
  ) => {
    return (
      headers.find((header) => header.name.toLowerCase() === name.toLowerCase())
        ?.value || ""
    );
  };

  const formatEmailDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error: unknown) {
      console.log(error);
      return dateString;
    }
  };

  const filteredEmails = emails.filter((email) => email.location === activeTab);

  const spamCount = emails.filter((email) => email.location === "spam").length;
  const inboxCount = emails.filter(
    (email) => email.location === "inbox"
  ).length;
  const totalCount = emails.length;
  const spamPercentage = totalCount > 0 ? (spamCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Health Analysis</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search email by subject, sender, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
          >
            <Search className="h-4 w-4" />
            Analyze
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : emails.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-12 p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm">
              {/* Health Indicator Circle */}
              <div className="flex-shrink-0 relative">
                <div
                  className={`h-40 w-40 rounded-full ${
                    spamPercentage > 50
                      ? "bg-red-50"
                      : spamPercentage > 20
                      ? "bg-yellow-50"
                      : "bg-green-50"
                  } flex items-center justify-center transition-all duration-300 ease-in-out`}
                >
                  <div
                    className={`h-32 w-32 rounded-full ${
                      spamPercentage > 50
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : spamPercentage > 20
                        ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                        : "bg-gradient-to-br from-green-500 to-green-600"
                    } flex flex-col items-center justify-center shadow-lg transition-all duration-300 ease-in-out`}
                  >
                    <span className="text-white text-2xl font-bold tracking-tight">
                      {spamPercentage > 50
                        ? "Poor"
                        : spamPercentage > 20
                        ? "Fair"
                        : "Good"}
                    </span>
                    {totalCount > 0 && (
                      <span className="text-white text-xs opacity-90">
                        {Math.round(spamPercentage)}% spam
                      </span>
                    )}
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>

              {/* Email Counts */}
              <div className="flex-1 space-y-6">
                <div className="flex-row flex gap-4">
                  <div className="bg-white rounded-xl w-full p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <EmailBadge count={inboxCount} type="inbox" />
                  </div>
                  <div className="bg-white rounded-xl w-full p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <EmailBadge count={spamCount} type="spam" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="border-b border-gray-200 flex-1">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("inbox")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === "inbox"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Inbox className="h-4 w-4" />
                    Inbox ({inboxCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("spam")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === "spam"
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Spam ({spamCount})
                  </button>
                </nav>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    email.location === "spam"
                      ? "border-red-200 bg-red-50/50"
                      : "border-blue-200 bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 flex-1">
                          {getEmailHeader(email.payload.headers, "subject") ||
                            "(No Subject)"}
                        </h3>
                        <div className="ml-4 flex-shrink-0 flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {formatEmailDate(
                              getEmailHeader(email.payload.headers, "date")
                            )}
                          </span>
                          {email.location === "spam" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Spam
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Inbox className="h-3 w-3 mr-1" />
                              Inbox
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700 ml-4">
                          To:
                        </span>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          {getEmailHeader(email.payload.headers, "to")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {email.snippet}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEmails.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No {activeTab} emails found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {emails.length > 0
                      ? `No emails found in ${activeTab}. Try switching tabs or adjusting your search query.`
                      : "Try adjusting your search query"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No emails analyzed yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Search for an email to analyze its health status
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
function EmailBadge({ count, type }: { count: number; type: string }) {
  const BadgeIcon =
    type === "inbox" ? (
      <Inbox className="h-6 w-6 text-blue-500" />
    ) : (
      <AlertTriangle className="h-6 w-6 text-red-500" />
    );

  return (
    <div className="flex items-center gap-3">
      {BadgeIcon}
      <div>
        <span className="text-2xl font-semibold text-gray-900">{count}</span>
        <span className="text-gray-500 ml-2 font-medium">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
    </div>
  );
}
