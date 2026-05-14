"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type AvatarUser = { avatar?: string | null; username: string; displayName?: string | null };

export function AvatarUploader({ user, onUploaded, size = "large" }: { user: AvatarUser; onUploaded?: (avatar: string) => void; size?: "large" | "small" }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(user.avatar ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const label = user.displayName || user.username;
  const initial = (label || "E").slice(0, 1).toUpperCase();
  const avatarSize = size === "large" ? "h-28 w-28 rounded-[2rem] text-4xl" : "h-16 w-16 rounded-2xl text-xl";

  async function upload(file: File) {
    setError("");
    if (file.size > 2 * 1024 * 1024) { setError("头像文件不能超过 2MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("仅支持 jpg、jpeg、png、webp"); return; }
    setPreview(URL.createObjectURL(file));
    const body = new FormData();
    body.append("avatar", file);
    setLoading(true);
    const response = await fetch("/api/account/avatar", { method: "POST", body });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !data.ok) { setError(data.message ?? "头像上传失败"); return; }
    setPreview(data.avatar);
    onUploaded?.(data.avatar);
    window.dispatchEvent(new Event("enxx:user-updated"));
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => inputRef.current?.click()} className={`${avatarSize} flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-400 to-violet-500 font-black text-white shadow-[0_22px_60px_rgba(37,99,235,.25)]`} aria-label="上传头像">
        {preview ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} /> : initial}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
      <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={loading}>{loading ? "上传中..." : "上传头像"}</Button>
      {error ? <p className="text-xs font-bold text-rose-600">{error}</p> : null}
    </div>
  );
}
