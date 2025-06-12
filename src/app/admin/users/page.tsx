"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  tags: Tag[];
}

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleGoogleLogin = async () => {
    // redirect to Google OAuth login
    window.location.href = "/api/auth";
  };

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

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Please log in to view this page");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
    fetchTags();
  }, [router]);

  const isUserInList = currentUser
    ? users.some((user) => user.email === currentUser.email)
    : false;

  const handleCreateTag = async () => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName }),
      });
      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        setNewTagName("");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleOpenTagModal = (user: User) => {
    setSelectedUser(user);
    setSelectedTags(user.tags?.map((tag) => tag.id) || []);
    setShowTagModal(true);
  };

  const handleSaveTags = async () => {
    if (!selectedUser) return;

    try {
      // First, remove all existing tags
      const currentTagIds = selectedUser.tags?.map((tag) => tag.id) || [];
      for (const tagId of currentTagIds) {
        await fetch(`/api/users/${selectedUser.id}/tags`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId }),
        });
      }

      // Then, add all selected tags
      for (const tagId of selectedTags) {
        await fetch(`/api/users/${selectedUser.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId }),
        });
      }

      // Refresh user data
      const response = await fetch(`/api/users/${selectedUser.id}/tags`);
      if (response.ok) {
        const updatedTags = await response.json();
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, tags: updatedTags } : user
          )
        );
      }

      setShowTagModal(false);
    } catch (error) {
      console.error("Error updating user tags:", error);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
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
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Users Directory
            </h1>
            <div className="flex gap-4">
              {!currentUser && (
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Yourself
                </button>
              )}
              {currentUser && !isUserInList && (
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Yourself
                </button>
              )}
              {currentUser && isUserInList && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md">
                  {currentUser.picture ? (
                    <Image
                      className="h-6 w-6 rounded-full"
                      src={currentUser.picture}
                      alt={currentUser.name}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">
                        {currentUser.name?.[0]}
                      </span>
                    </div>
                  )}
                  <span>{currentUser.email}</span>
                </div>
              )}
              <button
                onClick={() => setShowTokens(!showTokens)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showTokens ? "Hide Tokens" : "Show Tokens"}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  All Users
                </h3>
                <button
                  onClick={() => setShowCreateTagModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Tag
                </button>
              </div>
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Google ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Access Token
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Refresh Token
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Created At
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Updated At
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tags
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.picture ? (
                                  <Image
                                    className="h-10 w-10 rounded-full"
                                    src={user.picture}
                                    alt=""
                                    width={40}
                                    height={40}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-sm">
                                      {user.name?.[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.googleId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.accessToken ? (
                                showTokens ? (
                                  <div className="font-mono text-xs break-all">
                                    {user.accessToken}
                                  </div>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Present
                                  </span>
                                )
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Missing
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.refreshToken ? (
                                showTokens ? (
                                  <div className="font-mono text-xs break-all">
                                    {user.refreshToken}
                                  </div>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Present
                                  </span>
                                )
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Missing
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(user.updatedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              {user.tags?.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleOpenTagModal(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Manage Tags
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Tag Modal */}
      {showCreateTagModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Tag
              </h3>
              <button
                onClick={() => setShowCreateTagModal(false)}
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
              <div>
                <label
                  htmlFor="tagName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tag Name
                </label>
                <input
                  type="text"
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateTagModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCreateTag();
                    setShowCreateTagModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {showTagModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage Tags for {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
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

            {/* Current Tags */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Current Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedUser.tags || []).map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.name}
                  </div>
                ))}
                {(!selectedUser.tags || selectedUser.tags.length === 0) && (
                  <span className="text-gray-500 text-sm">
                    No tags assigned
                  </span>
                )}
              </div>
            </div>

            {/* Available Tags */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Available Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTags.includes(tag.id)
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {selectedTags.includes(tag.id) ? "✓ " : "+ "}
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="text-gray-500 text-sm">
                    No tags available
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTags}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
