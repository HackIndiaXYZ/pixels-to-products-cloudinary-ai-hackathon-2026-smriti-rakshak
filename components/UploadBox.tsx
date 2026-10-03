"use client";

import { useRef } from "react";

interface UploadBoxProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onAnalyze: () => void;
  analyzing: boolean;
}

export default function UploadBox({
  file,
  setFile,
  onAnalyze,
  analyzing,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
      <div
        onClick={() => inputRef.current?.click()}
        className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 px-6 transition-all hover:border-blue-500/50 hover:bg-blue-500/[0.03]"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400 transition group-hover:scale-110">
          ↑
        </div>

        {file ? (
          <>
            <h3 className="max-w-full truncate text-lg font-semibold">
              {file.name}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>

            <span className="mt-4 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
              Click to replace
            </span>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold">
              Drop your media here
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              or click to browse your files
            </p>

            <div className="mt-5 flex gap-2">
              <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500">
                JPG
              </span>
              <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500">
                PNG
              </span>
              <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500">
                MP4
              </span>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0];

            if (selected) {
              setFile(selected);
            }
          }}
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={!file || analyzing}
        className="mt-5 w-full rounded-xl bg-blue-500 py-4 text-sm font-bold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {analyzing ? (
          <span className="flex items-center justify-center gap-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Analyzing Media...
          </span>
        ) : (
          "Analyze Media →"
        )}
      </button>
    </div>
  );
}