"use client";

import { AvatarUpload } from "./avatar-upload";

interface AvatarUploadWrapperProps {
  currentAvatarUrl?: string | null;
}

export function AvatarUploadWrapper({ currentAvatarUrl }: AvatarUploadWrapperProps) {
  const handleUploadSuccess = (url: string) => {
    // Revalidate profile data if needed
    // Could also trigger a refetch or page reload here
    console.log("Avatar uploaded:", url);
  };

  return (
    <AvatarUpload 
      currentAvatarUrl={currentAvatarUrl}
      onUploadSuccess={handleUploadSuccess}
    />
  );
}
