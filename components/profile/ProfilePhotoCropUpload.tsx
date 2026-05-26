"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import {
  ImagePlus,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";

type CropPoint = {
  x: number;
  y: number;
};

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const OUTPUT_SIZE = 512;

function notify(title: string, type: "success" | "error" | "info" = "info") {
  window.dispatchEvent(new CustomEvent("contractorops:toast", { detail: { title, type } }));
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Unable to load image.")));
    image.src = url;
  });
}

function getRadianAngle(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function getRotatedSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

async function getCroppedImageBlob(imageSrc: string, pixelCrop: CropArea, rotation = 0): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Browser does not support image cropping.");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) throw new Error("Browser does not support image export.");

  croppedCanvas.width = OUTPUT_SIZE;
  croppedCanvas.height = OUTPUT_SIZE;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to create cropped image."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      0.9
    );
  });
}

export function ProfilePhotoCropUpload({
  value,
  label = "Upload profile image",
  onCropped,
  onRemove
}: {
  value: string;
  label?: string;
  onCropped: (file: File, previewUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [sourceUrl, setSourceUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [crop, setCrop] = useState<CropPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [savingCrop, setSavingCrop] = useState(false);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const onCropComplete = useCallback((_area: CropArea, pixels: CropArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function validateFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be below 5 MB.";
    }

    return "";
  }

  function openCropPopup(file: File) {
    const error = validateFile(file);

    if (error) {
      notify(error, "error");
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);

    const nextUrl = URL.createObjectURL(file);

    setSourceUrl(nextUrl);
    setFileName(file.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setModalOpen(true);
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    openCropPopup(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    openCropPopup(file);
  }

  async function saveCrop() {
    if (!sourceUrl || !croppedAreaPixels) {
      notify("Select and crop an image first.", "error");
      return;
    }

    setSavingCrop(true);

    try {
      const blob = await getCroppedImageBlob(sourceUrl, croppedAreaPixels, rotation);
      const croppedFile = new File([blob], `profile-${Date.now()}.webp`, {
        type: "image/webp"
      });

      const previewUrl = URL.createObjectURL(croppedFile);

      onCropped(croppedFile, previewUrl);
      setModalOpen(false);
      notify("Cropped photo ready. Click Save settings to update profile.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to crop image.", "error");
    } finally {
      setSavingCrop(false);
    }
  }

  return (
    <>
      <div
        className={[
          "rounded-[1.75rem] border border-dashed p-5 transition",
          dragActive
            ? "border-blueprint bg-blue-50 dark:bg-blue-500/10"
            : "border-slate-300 bg-slate-50 hover:border-blueprint/70 dark:border-white/10 dark:bg-white/5"
        ].join(" ")}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInput}
          type="file"
        />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-xl font-black text-white dark:bg-safety-yellow dark:text-slate-950">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Profile preview" className="h-full w-full object-cover" src={value} />
            ) : (
              <ImagePlus className="h-8 w-8" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-950 dark:text-white">{label}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Choose a photo, crop it in the popup, then save settings.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-glow dark:bg-safety-yellow dark:text-slate-950"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <Upload className="h-4 w-4" />
                Choose photo
              </button>

              {value && (
                <button
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-red-200 px-4 text-sm font-black text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                  onClick={onRemove}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">Crop profile photo</h3>
                <p className="mt-1 max-w-xl truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {fileName}
                </p>
              </div>

              <button
                className="rounded-2xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white"
                disabled={savingCrop}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid lg:grid-cols-[1fr_280px]">
              <div className="relative h-[420px] bg-slate-950">
                <Cropper
                  aspect={1}
                  crop={crop}
                  cropShape="round"
                  image={sourceUrl}
                  maxZoom={4}
                  minZoom={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onRotationChange={setRotation}
                  onZoomChange={setZoom}
                  rotation={rotation}
                  showGrid={false}
                  zoom={zoom}
                />
              </div>

              <div className="grid gap-5 border-l border-slate-200 p-5 dark:border-white/10">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Zoom</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-full accent-blueprint"
                      max={4}
                      min={1}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      step={0.1}
                      type="range"
                      value={zoom}
                    />
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Rotation</p>
                  <input
                    className="mt-3 w-full accent-blueprint"
                    max={360}
                    min={0}
                    onChange={(event) => setRotation(Number(event.target.value))}
                    step={1}
                    type="range"
                    value={rotation}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                      onClick={() => setRotation((current) => (current - 90 + 360) % 360)}
                      type="button"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Left
                    </button>

                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                      onClick={() => setRotation((current) => (current + 90) % 360)}
                      type="button"
                    >
                      <RotateCw className="h-4 w-4" />
                      Right
                    </button>
                  </div>
                </div>

                <div className="mt-auto grid gap-3">
                  <button
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-glow disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950"
                    disabled={savingCrop}
                    onClick={saveCrop}
                    type="button"
                  >
                    <Save className="h-4 w-4" />
                    Use cropped photo
                  </button>

                  <button
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                    disabled={savingCrop}
                    onClick={() => setModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}