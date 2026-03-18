"use client";

import { KeyRound, Loader2 } from "lucide-react";

export default function JoinBatch({
  batchCode,
  setBatchCode,
  isJoining,
  joinError,
  joinSuccess,
  handleJoinBatch,
}) {
  return (
    <div className="p-6 bg-secondary/10 border border-border rounded-xl">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <KeyRound className="w-4 h-4" /> Join a Batch
      </h3>
      <form onSubmit={handleJoinBatch} className="space-y-4">
        {joinError && <p className="text-xs text-red-500">{joinError}</p>}
        {joinSuccess && (
          <p className="text-xs text-green-500">
            Successfully joined the batch!
          </p>
        )}
        <input
          type="text"
          placeholder="Ex. CS101A"
          className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors uppercase placeholder:normal-case font-mono"
          value={batchCode}
          onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
          required
        />
        <button
          type="submit"
          disabled={isJoining || !batchCode.trim()}
          className="w-full py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex justify-center items-center"
        >
          {isJoining ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Join"
          )}
        </button>
      </form>
    </div>
  );
}
