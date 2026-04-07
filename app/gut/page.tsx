"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/lib/toast-context";

type Phase = {
  id: number;
  name: string;
  notes: string | null;
  startDate: string;
  active: boolean;
};

type Food = {
  id: number;
  name: string;
  category: string;
  notes: string | null;
};

type Strategy = {
  id: number;
  text: string;
  notes: string | null;
};

type Particle = { id: number; emoji: string; x: number };

// ── Randomized celebration messages ──────────────────────────────────────────

const AVOID_MSGS = [
  "That's one less enemy 🛡️",
  "Logged! Your gut thanks you 🧠",
  "Protocol getting stronger 💪",
  "Smart move. You're in control 🎯",
  "Building your armor, brick by brick 🔥",
  "Another threat neutralized ⚡",
];

const ALLOW_MSGS = [
  "Yes! Fuel yourself right 🌿",
  "Green light! Your body loves this 🟢",
  "Healing food locked in ✨",
  "That's a win for your gut 💚",
  "Stack those good choices 🌱",
  "Your microbiome is cheering 🎉",
];

const STRATEGY_MSGS = [
  "Strategy locked in 🔒",
  "That's how you stop a flare before it starts 🧩",
  "Your future self thanks you 🙏",
  "Building the system one step at a time 🪜",
  "ADHD + protocol = unstoppable 🧠⚡",
  "You just made the right move 🎯",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string) {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function toDateInputValue(isoString: string) {
  return new Date(isoString).toISOString().split("T")[0];
}

function dayLabel(n: number) {
  if (n === 1) return "Day 1 — you started. That's huge.";
  if (n <= 3)  return `Day ${n} — early momentum 🌱`;
  if (n <= 7)  return `Day ${n} — building the habit 💪`;
  if (n <= 14) return `Day ${n} — two weeks of discipline 🔥`;
  return `Day ${n} — you're a veteran 🏆`;
}

function scoreLabel(n: number) {
  if (n === 0) return "Start building your protocol";
  if (n < 5)   return "Getting started 🌱";
  if (n < 10)  return "Building momentum 💪";
  if (n < 20)  return "Solid protocol 🔥";
  return "You're dialed in 🏆";
}

// ── Emoji burst particles ─────────────────────────────────────────────────────

const AVOID_EMOJIS = ["🛡️", "⚡", "💪", "🎯", "🔥"];
const ALLOW_EMOJIS = ["🌿", "💚", "✨", "🌱", "🎉"];
const STRAT_EMOJIS = ["🔒", "🧠", "⚡", "🎯", "🙏"];
const PHASE_EMOJIS = ["🚀", "🔥", "💪", "🎯", "⚡"];

function useBurst() {
  const [particles, setParticles] = useState<Particle[]>([]);
  function burst(emojis: string[]) {
    const batch: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      emoji: pick(emojis),
      x: 10 + Math.random() * 80,
    }));
    setParticles((p) => [...p, ...batch]);
    setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      setParticles((p) => p.filter((pp) => !ids.has(pp.id)));
    }, 1000);
  }
  return { particles, burst };
}

// ── Quick-add inline input ────────────────────────────────────────────────────

function QuickAdd({
  placeholder,
  onAdd,
  onCancel,
  saving,
  accentClass,
  buttonLabel,
}: {
  placeholder: string;
  onAdd: (value: string, notes: string) => void;
  onCancel: () => void;
  saving: boolean;
  accentClass: string;
  buttonLabel: string;
}) {
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    if (value.trim()) onAdd(value.trim(), notes.trim());
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !showNotes) submit(); if (e.key === "Escape") onCancel(); }}
          placeholder={placeholder}
          className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted hover:text-secondary font-bold px-2 py-2.5"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !value.trim()}
          className={`py-2.5 px-3 rounded-lg text-xs font-extrabold transition-colors disabled:opacity-40 whitespace-nowrap ${accentClass}`}
        >
          {saving ? "..." : buttonLabel}
        </button>
      </div>
      {showNotes ? (
        <textarea
          autoFocus
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
          placeholder="Add a note (e.g. cooked only, limited amounts)..."
          rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-secondary text-xs focus:outline-none focus:border-accent transition-colors resize-none"
        />
      ) : (
        value.trim() && (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-left text-xs text-muted hover:text-secondary transition-colors"
          >
            + add a note
          </button>
        )
      )}
    </div>
  );
}

// ── Inline edit form ──────────────────────────────────────────────────────────

function InlineEdit({
  initialValue,
  initialNotes,
  onSave,
  onCancel,
  onDelete,
  deleteConfirm,
  saving,
  inputClass,
  saveClass,
}: {
  initialValue: string;
  initialNotes: string;
  onSave: (value: string, notes: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  saving: boolean;
  inputClass: string;
  saveClass: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [notes, setNotes] = useState(initialNotes);
  return (
    <div className="flex flex-col gap-2 p-3">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
        className={`w-full bg-bg border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none transition-colors ${inputClass}`}
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Note (optional, e.g. cooked only)"
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-secondary text-xs focus:outline-none focus:border-accent transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDelete}
          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
            deleteConfirm ? "bg-danger text-white" : "border border-border text-muted hover:text-danger"
          }`}
        >
          {deleteConfirm ? "Confirm?" : "Delete"}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-border text-secondary font-bold text-xs">Cancel</button>
        <button
          type="button"
          onClick={() => onSave(value, notes)}
          disabled={saving || !value.trim()}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ${saveClass}`}
        >
          {saving ? "..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GutPage() {
  const { showToast } = useToast();
  const { particles, burst } = useBurst();

  const [scoreBumping, setScoreBumping] = useState(false);
  const scoreBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  function bumpScore() {
    setScoreBumping(true);
    if (scoreBumpTimeout.current) clearTimeout(scoreBumpTimeout.current);
    scoreBumpTimeout.current = setTimeout(() => setScoreBumping(false), 450);
  }

  const [newFoodId, setNewFoodId] = useState<number | null>(null);
  const [newStrategyId, setNewStrategyId] = useState<number | null>(null);

  // Phase
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [editingPhase, setEditingPhase] = useState(false);
  const [addingPhase, setAddingPhase] = useState(false);
  const [savingPhase, setSavingPhase] = useState(false);
  const [phaseName, setPhaseName] = useState("");
  const [phaseNotes, setPhaseNotes] = useState("");
  const [phaseStartDate, setPhaseStartDate] = useState("");
  const [deletePhaseConfirm, setDeletePhaseConfirm] = useState(false);

  // Foods
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [addingFood, setAddingFood] = useState<"AVOID" | "ALLOWED" | null>(null);
  const [savingFood, setSavingFood] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [editFoodName, setEditFoodName] = useState("");
  const [editFoodNotes, setEditFoodNotes] = useState("");
  const [deleteFoodConfirmId, setDeleteFoodConfirmId] = useState<number | null>(null);

  // Strategies
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(true);
  const [addingStrategy, setAddingStrategy] = useState(false);
  const [savingStrategy, setSavingStrategy] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [editStrategyText, setEditStrategyText] = useState("");
  const [editStrategyNotes, setEditStrategyNotes] = useState("");
  const [deleteStrategyConfirmId, setDeleteStrategyConfirmId] = useState<number | null>(null);

  async function loadPhase() {
    try {
      const res = await fetch("/api/gut/phase");
      const phases: Phase[] = await res.json();
      setActivePhase(phases.find((p) => p.active) ?? null);
    } catch { /* ignore */ }
    finally { setLoadingPhase(false); }
  }
  async function loadFoods() {
    try {
      const res = await fetch("/api/gut/foods");
      setFoods(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingFoods(false); }
  }
  async function loadStrategies() {
    try {
      const res = await fetch("/api/gut/strategies");
      setStrategies(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingStrategies(false); }
  }

  useEffect(() => {
    loadPhase();
    loadFoods();
    loadStrategies();
  }, []);

  const avoidFoods   = foods.filter((f) => f.category === "AVOID");
  const allowedFoods = foods.filter((f) => f.category === "ALLOWED");
  const protocolScore = avoidFoods.length + allowedFoods.length + strategies.length + (activePhase ? 3 : 0);

  // ── Phase handlers ──────────────────────────────────────────────────────────

  async function handleSavePhase() {
    if (!phaseName.trim()) { showToast("Phase name is required", "error"); return; }
    setSavingPhase(true);
    try {
      if (editingPhase && activePhase) {
        await fetch(`/api/gut/phase/${activePhase.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: phaseName, notes: phaseNotes || null, startDate: phaseStartDate }),
        });
        showToast("Phase updated 🎯", "success");
        setEditingPhase(false);
      } else {
        await fetch("/api/gut/phase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: phaseName, notes: phaseNotes || null, startDate: phaseStartDate }),
        });
        burst(PHASE_EMOJIS);
        bumpScore();
        showToast("Phase started! Let's go 🚀", "success");
        setAddingPhase(false);
      }
      loadPhase();
    } catch { showToast("Something went wrong", "error"); }
    finally { setSavingPhase(false); }
  }

  async function handleDeletePhase() {
    if (!activePhase) return;
    if (!deletePhaseConfirm) { setDeletePhaseConfirm(true); return; }
    await fetch(`/api/gut/phase/${activePhase.id}`, { method: "DELETE" });
    showToast("Phase removed", "info");
    setDeletePhaseConfirm(false);
    setEditingPhase(false);
    loadPhase();
  }

  // ── Food handlers ───────────────────────────────────────────────────────────

  async function handleAddFood(name: string, notes: string, category: "AVOID" | "ALLOWED") {
    setSavingFood(true);
    try {
      const res = await fetch("/api/gut/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, notes: notes || null }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const food: Food = await res.json();
      burst(category === "AVOID" ? AVOID_EMOJIS : ALLOW_EMOJIS);
      bumpScore();
      showToast(pick(category === "AVOID" ? AVOID_MSGS : ALLOW_MSGS), "success");
      setNewFoodId(food.id);
      setTimeout(() => setNewFoodId(null), 600);
      setAddingFood(null);
      loadFoods();
    } catch (e) {
      console.error(e);
      showToast("Something went wrong", "error");
    }
    finally { setSavingFood(false); }
  }

  async function handleUpdateFood(name: string, notes: string) {
    if (!editingFood) return;
    setSavingFood(true);
    try {
      await fetch(`/api/gut/foods/${editingFood.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category: editingFood.category, notes: notes || null }),
      });
      showToast("Updated ✓", "success");
      setEditingFood(null);
      loadFoods();
    } catch { showToast("Something went wrong", "error"); }
    finally { setSavingFood(false); }
  }

  async function handleDeleteFood(id: number) {
    if (deleteFoodConfirmId !== id) { setDeleteFoodConfirmId(id); return; }
    await fetch(`/api/gut/foods/${id}`, { method: "DELETE" });
    showToast("Removed", "info");
    setDeleteFoodConfirmId(null);
    setEditingFood(null);
    loadFoods();
  }

  // ── Strategy handlers ───────────────────────────────────────────────────────

  async function handleAddStrategy(text: string, notes: string) {
    setSavingStrategy(true);
    try {
      const res = await fetch("/api/gut/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, notes: notes || null }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const strategy: Strategy = await res.json();
      burst(STRAT_EMOJIS);
      bumpScore();
      showToast(pick(STRATEGY_MSGS), "success");
      setNewStrategyId(strategy.id);
      setTimeout(() => setNewStrategyId(null), 600);
      setAddingStrategy(false);
      loadStrategies();
    } catch (e) {
      console.error(e);
      showToast("Something went wrong", "error");
    }
    finally { setSavingStrategy(false); }
  }

  async function handleUpdateStrategy(text: string, notes: string) {
    if (!editingStrategy) return;
    setSavingStrategy(true);
    try {
      await fetch(`/api/gut/strategies/${editingStrategy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, notes: notes || null }),
      });
      showToast("Updated ✓", "success");
      setEditingStrategy(null);
      loadStrategies();
    } catch { showToast("Something went wrong", "error"); }
    finally { setSavingStrategy(false); }
  }

  async function handleDeleteStrategy(id: number) {
    if (deleteStrategyConfirmId !== id) { setDeleteStrategyConfirmId(id); return; }
    await fetch(`/api/gut/strategies/${id}`, { method: "DELETE" });
    showToast("Removed", "info");
    setDeleteStrategyConfirmId(null);
    setEditingStrategy(null);
    loadStrategies();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="py-6 flex flex-col gap-6 pb-28">

      {/* Emoji burst particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none fixed z-50 text-2xl animate-float-up select-none"
          style={{ left: `${p.x}%`, bottom: "80px" }}
        >
          {p.emoji}
        </span>
      ))}

      {/* ── Header + Protocol Score ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text tracking-tight">Gut Health</h1>
          <p className="text-secondary text-sm mt-0.5">Your diverticulitis protocol</p>
        </div>
        <div className="flex flex-col items-center bg-surface border border-border rounded-xl px-4 py-2.5 min-w-[64px]">
          <span className={`text-2xl font-extrabold text-accent leading-none ${scoreBumping ? "animate-score-bump" : ""}`}>
            {protocolScore}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted mt-0.5">pts</span>
        </div>
      </div>
      {!loadingFoods && !loadingStrategies && (
        <p className="text-xs text-secondary -mt-4 font-medium">{scoreLabel(protocolScore)}</p>
      )}

      {/* ── Current Phase ───────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary">Current Phase</h2>

        {loadingPhase ? (
          <div className="h-24 bg-surface rounded-xl animate-pulse" />
        ) : editingPhase || addingPhase ? (
          <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-secondary">Phase Name</label>
              <input
                type="text"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="e.g. Step 2: Days 4–6"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-secondary">Start Date</label>
              <input
                type="date"
                value={phaseStartDate}
                onChange={(e) => setPhaseStartDate(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-secondary">Notes (optional)</label>
              <textarea
                value={phaseNotes}
                onChange={(e) => setPhaseNotes(e.target.value)}
                placeholder="What does this phase involve?"
                rows={2}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-app-text text-sm focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <div className="flex gap-2">
              {editingPhase && (
                <button
                  type="button"
                  onClick={handleDeletePhase}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${deletePhaseConfirm ? "bg-danger text-white" : "border border-border text-muted hover:text-danger"}`}
                >
                  {deletePhaseConfirm ? "Confirm?" : "Delete"}
                </button>
              )}
              <button type="button" onClick={() => { setEditingPhase(false); setAddingPhase(false); }} className="flex-1 py-2 rounded-lg border border-border text-secondary font-bold text-sm">Cancel</button>
              <button type="button" onClick={handleSavePhase} disabled={savingPhase} className="flex-1 py-2 rounded-lg bg-accent text-bg font-bold text-sm disabled:opacity-50">
                {savingPhase ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : activePhase ? (
          <div className="bg-surface rounded-xl border border-accent/40 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold text-app-text text-base leading-tight">{activePhase.name}</p>
              <div className="flex gap-3 pt-0.5 shrink-0">
                <button type="button" onClick={() => { setPhaseName(activePhase.name); setPhaseNotes(activePhase.notes ?? ""); setPhaseStartDate(toDateInputValue(activePhase.startDate)); setEditingPhase(true); setDeletePhaseConfirm(false); }} className="text-xs font-bold text-secondary hover:text-accent transition-colors">Edit</button>
                <button type="button" onClick={() => { setPhaseName(""); setPhaseNotes(""); setPhaseStartDate(new Date().toISOString().split("T")[0]); setAddingPhase(true); }} className="text-xs font-bold text-secondary hover:text-accent transition-colors">New Phase</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center bg-bg rounded-xl px-4 py-2 border border-accent/20">
                <span className="text-3xl font-extrabold text-accent leading-none">{daysSince(activePhase.startDate)}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted mt-0.5">days in</span>
              </div>
              <p className="text-secondary text-xs leading-relaxed flex-1">{dayLabel(daysSince(activePhase.startDate))}</p>
            </div>
            {activePhase.notes && (
              <p className="text-muted text-xs leading-relaxed border-t border-border pt-2">{activePhase.notes}</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setPhaseName(""); setPhaseNotes(""); setPhaseStartDate(new Date().toISOString().split("T")[0]); setAddingPhase(true); }}
            className="bg-surface rounded-xl border border-dashed border-accent/30 p-5 text-center flex flex-col items-center gap-1.5 hover:border-accent transition-colors group"
          >
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-bold text-accent">Set your current phase</span>
            <span className="text-xs text-muted">Where are you in your recovery protocol?</span>
          </button>
        )}
      </section>

      {/* ── Foods to Avoid ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary flex items-center justify-between">
          <span>Foods to Avoid</span>
          {avoidFoods.length > 0 && (
            <span className="bg-danger/20 text-danger text-[10px] font-bold px-2 py-0.5 rounded-full">{avoidFoods.length} tracked</span>
          )}
        </h2>
        <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden">
          {loadingFoods ? (
            <div className="h-12 animate-pulse" />
          ) : (
            avoidFoods.map((food) => (
              <div key={food.id} className={food.id === newFoodId ? "animate-pop-in" : ""}>
                {editingFood?.id === food.id ? (
                  <InlineEdit
                    initialValue={editFoodName}
                    initialNotes={editFoodNotes}
                    onSave={handleUpdateFood}
                    onCancel={() => setEditingFood(null)}
                    onDelete={() => handleDeleteFood(food.id)}
                    deleteConfirm={deleteFoodConfirmId === food.id}
                    saving={savingFood}
                    inputClass="border-danger/40 focus:border-danger"
                    saveClass="bg-danger/80 text-white"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingFood(food); setEditFoodName(food.name); setEditFoodNotes(food.notes ?? ""); setDeleteFoodConfirmId(null); }}
                    className="w-full text-left flex flex-col px-3 py-3 gap-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-danger text-sm shrink-0">✕</span>
                      <span className="text-app-text text-sm font-medium flex-1">{food.name}</span>
                      <span className="text-muted text-xs">edit</span>
                    </div>
                    {food.notes && <p className="text-muted text-xs pl-5">{food.notes}</p>}
                  </button>
                )}
              </div>
            ))
          )}
          {addingFood === "AVOID" ? (
            <QuickAdd
              placeholder="e.g. Carbonated drinks"
              onAdd={(name, notes) => handleAddFood(name, notes, "AVOID")}
              onCancel={() => setAddingFood(null)}
              saving={savingFood}
              accentClass="bg-danger text-white hover:bg-danger/80"
              buttonLabel="🛡️ Add"
            />
          ) : (
            <button
              type="button"
              onClick={() => { setAddingFood("AVOID"); setEditingFood(null); }}
              className="w-full px-3 py-3 text-left text-sm text-muted hover:text-danger hover:bg-danger/5 transition-colors font-medium flex items-center gap-2"
            >
              <span>🛡️</span> Add a food to avoid
            </button>
          )}
        </div>
      </section>

      {/* ── Foods to Allow ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary flex items-center justify-between">
          <span>Foods to Allow</span>
          {allowedFoods.length > 0 && (
            <span className="bg-success/20 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">{allowedFoods.length} tracked</span>
          )}
        </h2>
        <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden">
          {loadingFoods ? (
            <div className="h-12 animate-pulse" />
          ) : (
            allowedFoods.map((food) => (
              <div key={food.id} className={food.id === newFoodId ? "animate-pop-in" : ""}>
                {editingFood?.id === food.id ? (
                  <InlineEdit
                    initialValue={editFoodName}
                    initialNotes={editFoodNotes}
                    onSave={handleUpdateFood}
                    onCancel={() => setEditingFood(null)}
                    onDelete={() => handleDeleteFood(food.id)}
                    deleteConfirm={deleteFoodConfirmId === food.id}
                    saving={savingFood}
                    inputClass="border-success/40 focus:border-success"
                    saveClass="bg-success text-bg"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingFood(food); setEditFoodName(food.name); setEditFoodNotes(food.notes ?? ""); setDeleteFoodConfirmId(null); }}
                    className="w-full text-left flex flex-col px-3 py-3 gap-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-success text-sm shrink-0">✓</span>
                      <span className="text-app-text text-sm font-medium flex-1">{food.name}</span>
                      <span className="text-muted text-xs">edit</span>
                    </div>
                    {food.notes && <p className="text-muted text-xs pl-5">{food.notes}</p>}
                  </button>
                )}
              </div>
            ))
          )}
          {addingFood === "ALLOWED" ? (
            <QuickAdd
              placeholder="e.g. Oatmeal, applesauce"
              onAdd={(name, notes) => handleAddFood(name, notes, "ALLOWED")}
              onCancel={() => setAddingFood(null)}
              saving={savingFood}
              accentClass="bg-success text-bg hover:bg-success/80"
              buttonLabel="🌿 Add"
            />
          ) : (
            <button
              type="button"
              onClick={() => { setAddingFood("ALLOWED"); setEditingFood(null); }}
              className="w-full px-3 py-3 text-left text-sm text-muted hover:text-success hover:bg-success/5 transition-colors font-medium flex items-center gap-2"
            >
              <span>🌿</span> Add a food that helps
            </button>
          )}
        </div>
      </section>

      {/* ── Strategies ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary flex items-center justify-between">
          <span>Strategies</span>
          {strategies.length > 0 && (
            <span className="bg-purple/20 text-purple text-[10px] font-bold px-2 py-0.5 rounded-full">{strategies.length} locked in</span>
          )}
        </h2>
        <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden">
          {loadingStrategies ? (
            <div className="h-12 animate-pulse" />
          ) : (
            strategies.map((strategy) => (
              <div key={strategy.id} className={strategy.id === newStrategyId ? "animate-pop-in" : ""}>
                {editingStrategy?.id === strategy.id ? (
                  <InlineEdit
                    initialValue={editStrategyText}
                    initialNotes={editStrategyNotes}
                    onSave={handleUpdateStrategy}
                    onCancel={() => setEditingStrategy(null)}
                    onDelete={() => handleDeleteStrategy(strategy.id)}
                    deleteConfirm={deleteStrategyConfirmId === strategy.id}
                    saving={savingStrategy}
                    inputClass="border-purple/40 focus:border-purple"
                    saveClass="bg-purple text-white"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingStrategy(strategy); setEditStrategyText(strategy.text); setEditStrategyNotes(strategy.notes ?? ""); setDeleteStrategyConfirmId(null); }}
                    className="w-full text-left flex flex-col px-3 py-3 gap-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-purple text-xs shrink-0">⬡</span>
                      <span className="text-app-text text-sm flex-1">{strategy.text}</span>
                      <span className="text-muted text-xs">edit</span>
                    </div>
                    {strategy.notes && <p className="text-muted text-xs pl-4">{strategy.notes}</p>}
                  </button>
                )}
              </div>
            ))
          )}
          {addingStrategy ? (
            <QuickAdd
              placeholder="e.g. Walk 10 min after meals"
              onAdd={handleAddStrategy}
              onCancel={() => setAddingStrategy(false)}
              saving={savingStrategy}
              accentClass="bg-purple text-white hover:bg-purple/80"
              buttonLabel="🔒 Lock in"
            />
          ) : (
            <button
              type="button"
              onClick={() => { setAddingStrategy(true); setEditingStrategy(null); }}
              className="w-full px-3 py-3 text-left text-sm text-muted hover:text-purple hover:bg-purple/5 transition-colors font-medium flex items-center gap-2"
            >
              <span>🧠</span> Add a strategy
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
