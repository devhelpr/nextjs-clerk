"use client";

import { useEffect, useState } from "react";

interface UserProfile {
  full_name: string;
  location: string | null;
  phone_number: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    location: null,
    phone_number: null,
    created_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/userprofile");
      const result = await response.json();

      if (result.error) throw new Error(result.error);
      setProfile(result.data);
      setProfileExists(result.exists);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/userprofile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const result = await response.json();

      if (result.error) throw new Error(result.error);

      setProfile(result.data);
      setProfileExists(result.exists);
      setSuccessMessage(
        profileExists
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        {profileExists ? "Edit Profile" : "Create Profile"}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
            disabled={saving}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            value={profile.location || ""}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            disabled={saving}
            placeholder="Enter your location (optional)"
          />
        </div>

        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            value={profile.phone_number || ""}
            onChange={(e) =>
              setProfile({ ...profile, phone_number: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            disabled={saving}
            placeholder="Enter your phone number (optional)"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : profileExists
              ? "Update Profile"
              : "Create Profile"}
          </button>
        </div>
      </form>

      {profileExists && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Profile created: {new Date(profile.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
