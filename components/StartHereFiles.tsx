import { FileCode2 } from "lucide-react";
import type { ImportantFile } from "@/lib/schemas";

export function StartHereFiles({ files }: { files: ImportantFile[] }) {
  return (
    <section className="rounded-3xl border border-[#123B35] bg-[#030807]/80 p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#08201C] text-[#00D1B2]">
          <FileCode2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#00D1B2]">
            Start Here
          </p>
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Files worth reading first</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {files.slice(0, 12).map((file) => (
          <div
            key={file.path}
            className="grid gap-3 rounded-2xl border border-[#0F2A26] bg-[#06110F]/65 p-4 md:grid-cols-[220px_120px_1fr]"
          >
            <p className="break-all font-mono text-sm text-[#FFFFFF]">{file.path}</p>
            <p className="h-fit w-fit rounded-full border border-[#123B35] px-3 py-1 font-mono text-xs text-[#00D1B2]">
              {file.category}
            </p>
            <p className="text-sm leading-6 text-[#8FA8A2]">{file.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
