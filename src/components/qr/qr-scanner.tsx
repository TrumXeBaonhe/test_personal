"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Upload as UploadIcon, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import jsQR from "jsqr";

interface QRScannerProps {
  onScanSuccess?: (accountNumber: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [mode, setMode] = useState<"camera" | "file">("camera");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "camera" && isScanning) {
      initializeCamera();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [mode, isScanning]);

  const initializeCamera = () => {
    try {
      const scanner = new Html5QrcodeScanner(
        "qr-scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScannedData(decodedText);
          scanner.clear();
        },
        (error) => {
          console.log(error);
        }
      );

      scannerRef.current = scanner;
    } catch (error) {
      toast.error("Không thể truy cập camera");
      setIsScanning(false);
    }
  };

  const handleScannedData = (data: string) => {
    setScannedData(data);
    setIsScanning(false);
    toast.success("Quét mã QR thành công!");
    onScanSuccess?.(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, img.width, img.height);

          if (code) {
            handleScannedData(code.data);
          } else {
            toast.error("Không tìm thấy mã QR trong ảnh");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quét mã QR</CardTitle>
        <CardDescription>Quét mã QR để nhận số tài khoản của người khác</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2 bg-muted/40 p-1 rounded-full w-fit">
          <Button
            type="button"
            variant={mode === "camera" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setMode("camera");
              setScannedData(null);
            }}
            className="rounded-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            type="button"
            variant={mode === "file" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setMode("file");
              setScannedData(null);
              handleStopScanning();
            }}
            className="rounded-full"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Tệp
          </Button>
        </div>

        {/* Camera Mode */}
        {mode === "camera" && (
          <div className="space-y-4">
            {isScanning ? (
              <div className="space-y-4">
                <div
                  id="qr-scanner-container"
                  className="rounded-2xl overflow-hidden bg-black"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleStopScanning}
                  className="w-full rounded-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Dừng quét
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setIsScanning(true)}
                className="w-full rounded-full shadow-lg shadow-primary/20 h-14"
              >
                <Camera className="h-4 w-4 mr-2" />
                Bắt đầu quét
              </Button>
            )}
          </div>
        )}

        {/* File Mode */}
        {mode === "file" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full rounded-full h-14"
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Chọn ảnh từ máy
            </Button>
          </div>
        )}

        {/* Scanned Data */}
        {scannedData && (
          <div className="p-4 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/20 space-y-2">
            <p className="text-xs font-bold uppercase text-emerald-600">Quét thành công!</p>
            <p className="font-mono font-bold text-lg break-all">{scannedData}</p>
            <Button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(scannedData);
                toast.success("Đã sao chép!");
              }}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              Sao chép
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
