"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-gray-500 hover:text-gray-700"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
}
