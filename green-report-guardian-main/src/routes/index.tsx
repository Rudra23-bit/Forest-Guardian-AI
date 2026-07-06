import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

const WEBHOOK_URL = "http://localhost:5678/webhook/forest-report";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forest Guardian AI — Report Forest Incidents" },
      {
        name: "description",
        content:
          "Report illegal logging, forest fires, poaching and other forest incidents. AI-powered analysis helps protect our forests.",
      },
      { property: "og:title", content: "Forest Guardian AI" },
      {
        property: "og:description",
        content: "AI-powered forest incident reporting for citizens, officers, NGOs and volunteers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "success" } | { kind: "error"; message: string };

function Index() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [gps, setGps] = useState<string>("");
  const [gpsBusy, setGpsBusy] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGps("Geolocation not supported");
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setGpsBusy(false);
      },
      (err) => {
        setGps(`Error: ${err.message}`);
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return setImagePreview(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {
      name: (fd.get("name") as string) || "",
      email: (fd.get("email") as string) || "",
      phone: (fd.get("phone") as string) || "",
      report_source: fd.get("report_source") as string,
      incident_type: fd.get("incident_type") as string,
      location: fd.get("location") as string,
      description: fd.get("description") as string,
      gps: gps || "",
      image: imagePreview || "",
      submitted_at: new Date().toISOString(),
    };

    setStatus({ kind: "loading" });
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setStatus({ kind: "success" });
      form.reset();
      setGps("");
      setImagePreview(null);
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-forest-deep text-forest-header-fg">
      {/* Ambient 3D background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% -10%, rgba(16,185,129,0.25), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(251,191,36,0.18), transparent 60%), radial-gradient(1000px 700px at 50% 110%, rgba(5,150,105,0.35), transparent 60%), linear-gradient(180deg, #04120b 0%, #061a10 100%)",
        }}
      />
      {/* Floating 3D orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full float-a pulse-orb"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(110,231,183,0.9), rgba(16,185,129,0.4) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full float-b"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(251,191,36,0.55), rgba(245,158,11,0.25) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div
        aria-hidden
         className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full float-a"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(52,211,153,0.45), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(110,231,183,1) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
              style={{
                background: "linear-gradient(145deg, #10b981, #047857)",
                boxShadow:
                  "0 10px 25px -8px rgba(16,185,129,0.6), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.3)",
                transform: "perspective(400px) rotateX(12deg)",
              }}
              aria-hidden
            >
              🌲
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Forest Guardian <span className="text-forest-mint">AI</span>
              </h1>
              <p className="text-xs md:text-sm text-emerald-200/70">
                Guarding wild places with intelligence
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-forest-line bg-white/5 px-4 py-1.5 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-100/80">AI monitoring active</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 py-8 md:py-14">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-line bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur">
            <span aria-hidden>⚡</span> Real-time AI risk scoring
          </span>
          <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Report a threat.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #6ee7b7 0%, #10b981 40%, #fbbf24 100%)",
              }}
            >
              Save a forest.
            </span>
          </h2>
          <p className="mt-4 text-emerald-100/70 max-w-xl mx-auto text-sm md:text-base">
            Every report is analyzed by AI in seconds. High-risk incidents alert authorities
            instantly — the rest are logged for pattern analysis.
          </p>
        </div>

        {/* 3D Card */}
        <div className="relative group" style={{ perspective: "1600px" }}>
          <div
            aria-hidden
            className="absolute -inset-1 rounded-3xl opacity-60 blur-2xl transition-opacity group-hover:opacity-90"
            style={{
              background:
                "linear-gradient(120deg, rgba(16,185,129,0.5), rgba(251,191,36,0.35))",
            }}
          />
          <div
            className="card-3d relative p-6 md:p-10"
            style={{ transform: "rotateX(1.5deg)" }}
          >
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-forest-mint">
                  Incident Report
                </h3>
                <p className="text-xs md:text-sm text-emerald-100/60 mt-1">
                  Fields marked <span className="text-amber-400">*</span> are required.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-emerald-200/70">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                Encrypted
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Reporter Name">
                  <input name="name" type="text" className="fg-input" placeholder="Your name" />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" className="fg-input" placeholder="you@example.com" />
                </Field>
                <Field label="Phone">
                  <input name="phone" type="tel" className="fg-input" placeholder="+91 98765 43210" />
                </Field>
                <Field label="" required>
                  <select name="report_source" required className="fg-input" defaultValue="">
                    <option value="" disabled>Select source</option>
                    <option>Citizen</option>
                    <option>Forest Officer</option>
                    <option>NGO</option>
                    <option>Volunteer</option>
                  </select>
                </Field>
                <Field label="Incident Type" required>
                  <select name="incident_type" required className="fg-input" defaultValue="">
                    <option value="" disabled>Select incident</option>
                    <option>Illegal Logging</option>
                    <option>Forest Fire</option>
                    <option>Wildlife Poaching</option>
                    <option>Tree Cutting</option>
                    <option>Illegal Mining</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Forest Location" required>
                  <input
                    name="location"
                    type="text"
                    required
                    className="fg-input"
                    placeholder="e.g. Bhiwandi Forest"
                  />
                </Field>
              </div>

              <Field label="Description" required>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="fg-input resize-y"
                  placeholder="Who, what, when, how many people, vehicles, tools…"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Image (optional)">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="fg-input file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:font-semibold file:text-forest-deep file:cursor-pointer"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 h-32 w-full object-cover rounded-lg border border-forest-line shadow-lg"
                    />
                  )}
                </Field>

                <Field label="GPS Location (optional)">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={gps}
                      className="fg-input flex-1"
                      placeholder="Not captured"
                    />
                    <button
                      type="button"
                      onClick={handleGps}
                      disabled={gpsBusy}
                      className="btn-3d px-4 py-2 text-sm whitespace-nowrap disabled:opacity-60"
                    >
                      {gpsBusy ? "…" : "📍 GPS"}
                    </button>
                  </div>
                </Field>
              </div>

              <button
                type="submit"
                disabled={status.kind === "loading"}
                className="btn-3d w-full py-4 text-base disabled:opacity-60"
              >
                {status.kind === "loading" ? "Transmitting to AI…" : "🛡  Submit Report"}
              </button>

              {status.kind === "success" && (
                <div
                  className="rounded-xl p-5 text-sm border border-emerald-400/40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(52,211,153,0.1))",
                    boxShadow: "0 10px 30px -10px rgba(16,185,129,0.5)",
                  }}
                >
                  <p className="font-bold text-emerald-200">✅ Report Submitted Successfully</p>
                  <p className="mt-1 text-emerald-100/80">
                    Your report is being analyzed by AI. Thank you for protecting our forests. 🌲
                  </p>
                </div>
              )}
              {status.kind === "error" && (
                <div
                  className="rounded-xl p-5 text-sm border border-red-400/40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.05))",
                  }}
                >
                  <p className="font-bold text-red-200">❌ Submission failed</p>
                  <p className="mt-1 text-red-100/80">{status.message}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-10 grid grid-cols-3 gap-3 md:gap-5">
          {[
            { k: "24/7", v: "AI monitoring" },
            { k: "<3s", v: "Risk analysis" },
            { k: "80+", v: "Alert threshold" },
          ].map((s) => (
            <div
              key={s.v}
              className="card-3d px-4 py-4 text-center"
              style={{ transform: "rotateX(2deg)" }}
            >
              <div className="text-xl md:text-2xl font-black text-forest-mint">{s.k}</div>
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-emerald-100/60 mt-1">
                {s.v}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-emerald-100/40 mt-10">
          Forest Guardian AI · Every report matters 🌍
        </p>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-200/80 mb-2">
        {label} {required && <span className="text-amber-400">*</span>}
      </span>
      {children}
    </label>
  );
}

