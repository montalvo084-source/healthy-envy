"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Checkpoint, Profile } from "@/lib/types";
import CheckpointTable from "@/components/CheckpointTable";

export default function ProgressPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, cpRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/checkpoints"),
      ]);
      setProfile(await profileRes.json());
      setCheckpoints(await cpRes.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-36" />
        <div className="h-48 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
          Measurements
        </h1>
        <Link
          href="/checkpoints"
          className="text-sm font-bold px-3 py-2 rounded-xl bg-accent text-bg hover:bg-accent/80 transition-colors"
        >
          + Record
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4">
        {profile && (
          <CheckpointTable checkpoints={checkpoints} profile={profile} />
        )}
        {checkpoints.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📏</p>
            <p className="font-bold text-app-text">No measurements yet</p>
            <p className="text-secondary text-sm mt-1">
              Record your waist, hips, and chest to track progress
            </p>
            <Link
              href="/checkpoints"
              className="inline-block mt-4 px-5 py-3 rounded-xl bg-accent text-bg font-bold text-sm hover:bg-accent/80 transition-colors"
            >
              Record First Measurement
            </Link>
          </div>
        )}
      </div>

      {/* Baseline reminder */}
      {checkpoints.length > 0 && !profile?.startWaist && !profile?.startHips && !profile?.startChest && (
        <div className="bg-surface rounded-xl border border-border/50 p-4 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-app-text">Set a baseline</p>
            <p className="text-xs text-secondary mt-0.5">
              Add your starting measurements in{" "}
              <Link href="/settings" className="text-accent underline">Settings</Link>{" "}
              to see how far you&apos;ve come.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
