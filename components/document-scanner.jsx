"use client";

import { useRef, useEffect } from "react";
import { FileScan, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanDocument } from "@/actions/scanner";

export function DocumentScanner({ onScanComplete }) {
  const inputRef = useRef(null);
  const { loading, fn, data, error } = useFetch(scanDocument);

  const onChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await fn(file);
  };

  useEffect(() => {
    if (data && !loading) {
      onScanComplete(data);
      toast.success("Document details extracted");
    }
  }, [data, loading, onScanComplete]);

  useEffect(() => {
    if (error) toast.error(error.message || "Could not scan document");
  }, [error]);

  return (
    <div className="rounded-xl border border-dashed bg-slate-50 p-4">
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onChange} />
      <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? <><Loader2 className="animate-spin" /> Reading document...</> : <><FileScan /> Scan invoice / delivery note with AI</>}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Max 5MB. AI output fills the form for review.</p>
    </div>
  );
}
