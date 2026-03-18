"use client";

import { KeyRound, Loader2, ArrowRight } from "lucide-react";

export default function JoinBatch({
  batchCode,
  setBatchCode,
  isJoining,
  joinError,
  joinSuccess,
  handleJoinBatch,
}) {
  return (
    <div className="p-8 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-3xl relative overflow-hidden group hover:border-border transition-all duration-500 shadow-2xl flex flex-col justify-between h-full min-h-[250px]">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
        <KeyRound className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-background rounded-lg border border-border/50 shadow-sm">
            <KeyRound className="w-4 h-4 text-foreground/60" />
          </div>
          <h3 className="font-display font-bold text-lg leading-tight tracking-tight">
            Join a Batch
          </h3>
        </div>

        <p className="text-xs text-foreground/40 font-light mb-6 leading-relaxed">
          Enter the unique code provided by your faculty to enroll in their activity point tracking group.
        </p>

        <form onSubmit={handleJoinBatch} className="space-y-4 mt-auto">
          {joinError && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] rounded-lg animate-in fade-in duration-300">
              {joinError}
            </div>
          )}
          {joinSuccess && (
            <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] rounded-lg animate-in fade-in duration-300">
              Successfully joined the batch!
            </div>
          )}
          
          <div className="relative group/input">
            <input
              type="text"
              placeholder="Ex. CS101A"
              className="w-full px-4 py-3 text-sm bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all uppercase placeholder:normal-case font-mono tracking-widest text-center"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isJoining || !batchCode.trim()}
            className="w-full py-3.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-foreground/90 disabled:opacity-30 transition-all active:scale-[0.98] shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Enroll Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
