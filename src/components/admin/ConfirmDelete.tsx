"use client";
import { useState } from "react";
import Drawer from "./Drawer";

/** Destructive confirmation that names the item. */
export default function ConfirmDelete({ name, kind, onConfirm, onCancel }: { name: string | null; kind: string; onConfirm: () => Promise<void> | void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Drawer open={!!name} onClose={onCancel} title={`Delete ${kind}`}
      footer={<>
        <button onClick={onCancel} className="btn btn-secondary btn-md">Keep it</button>
        <button disabled={busy} onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }} className="btn btn-md bg-danger text-white hover:brightness-95">{busy ? "Deleting…" : `Delete “${name}”`}</button>
      </>}>
      <p className="text-ink-2">This permanently removes <strong className="text-ink">{name}</strong> from your site. This can&apos;t be undone.</p>
    </Drawer>
  );
}
