"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "../contexts/ProfileContext";
import { useAuth } from "../contexts/AuthContext";
import { AVATAR_OPTIONS } from "../services/profileService";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile, updateProfile } = useProfile();
  const { session } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("pomegranate");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setSelectedAvatar(profile.avatar || "pomegranate");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: firstName.trim() || undefined,
        avatar: selectedAvatar,
      });
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar selection */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedAvatar(option.id)}
                  className={cn(
                    "relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all",
                    selectedAvatar === option.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  title={option.label}
                >
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">What do I call you</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>


          <div className="space-y-2">
            <Label className="text-gray-500">Email</Label>
            <p className="text-sm text-gray-600">{session?.user?.email}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
