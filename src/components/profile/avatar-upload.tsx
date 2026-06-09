"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, User } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Hình ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) {
      toast.error("Vui lòng chọn một hình ảnh");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: preview }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload thất bại");
      }

      toast.success("Cập nhật ảnh đại diện thành công!");
      onUploadSuccess?.(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi upload ảnh");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-32 rounded-full border-4 border-primary/20 bg-muted/40 overflow-hidden flex items-center justify-center shadow-lg">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <User className="h-16 w-16 text-muted-foreground" />
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Chọn ảnh
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {preview && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || !preview}
            className="rounded-full w-full shadow-lg shadow-primary/20"
          >
            {isUploading ? "Đang tải lên..." : "Tải lên ảnh đại diện"}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Kích thước tối đa: 5MB • Định dạng: JPG, PNG, WebP
      </p>
    </div>
  );
}
