import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Save, Trash2 } from "lucide-react";

type SectionType = "experience" | "education" | "skills" | "projects" | "custom";
type SectionContent = { items: Record<string, string>[] } | { text: string };

type ResumeSection = {
  id?: number;
  section_type: string;
  title: string | null;
  content: unknown;
  sort_order: number;
};

type Resume = {
  id: string;
  user_id: string | null;
  title: string;
  template: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  sections: ResumeSection[];
};

type SectionForm = {
  section_type: SectionType;
  title: string;
  sort_order: number;
  content: SectionContent;
};

type ResumeForm = {
  id?: string;
  title: string;
  template: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  sections: SectionForm[];
};

const textInput = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
const sectionInput = "w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const defaultSectionFields: Record<SectionType, string[]> = {
  experience: ["company", "role", "start", "end", "location", "description"],
  education: ["school", "degree", "start", "end", "description"],
  skills: ["name", "level"],
  projects: ["name", "url", "technologies", "description"],
  custom: [],
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sectionOptions(): Array<{ value: SectionType; label: string }> {
  return [
    { value: "experience", label: "Experience" },
    { value: "education", label: "Education" },
    { value: "skills", label: "Skills" },
    { value: "projects", label: "Projects" },
    { value: "custom", label: "Custom" },
  ];
}

function normalizeType(type: string): SectionType {
  return sectionOptions().some((item) => item.value === type) ? (type as SectionType) : "custom";
}

function defaultSection(type: SectionType, index: number): SectionForm {
  if (type === "custom") {
    return { section_type: type, title: "Custom", sort_order: index, content: { text: "" } };
  }
  const firstItem: Record<string, string> = {};
  for (const field of defaultSectionFields[type]) firstItem[field] = "";
  return { section_type: type, title: titleCase(type), sort_order: index, content: { items: [firstItem] } };
}

function blankForm(): ResumeForm {
  return {
    title: "Software Engineer Resume",
    template: "modern",
    full_name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    sections: [defaultSection("experience", 0), defaultSection("skills", 1)],
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeSection(section: ResumeSection): SectionForm {
  const section_type = normalizeType(section.section_type);
  const title = section.title ?? titleCase(section_type);
  const sort_order = section.sort_order ?? 0;

  if (section_type === "custom") {
    const content = asObject(section.content);
    return { section_type, title, sort_order, content: { text: asString(content.text) } };
  }

  const fields = defaultSectionFields[section_type];
  const raw = asObject(section.content);
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems
    .map((item) => asObject(item))
    .map((item) => {
      const out: Record<string, string> = {};
      for (const field of fields) out[field] = asString(item[field]);
      return out;
    });

  return {
    section_type,
    title,
    sort_order,
    content: { items: items.length > 0 ? items : [(defaultSection(section_type, 0).content as { items: Record<string, string>[] }).items[0]] },
  };
}

function fromResume(resume: Resume): ResumeForm {
  return {
    id: resume.id,
    title: resume.title ?? "",
    template: resume.template ?? "modern",
    full_name: resume.full_name ?? "",
    email: resume.email ?? "",
    phone: resume.phone ?? "",
    location: resume.location ?? "",
    website: resume.website ?? "",
    linkedin: resume.linkedin ?? "",
    github: resume.github ?? "",
    summary: resume.summary ?? "",
    sections: (resume.sections ?? []).map(normalizeSection),
  };
}

function toPayload(form: ResumeForm) {
  return {
    title: form.title,
    template: form.template,
    full_name: form.full_name || null,
    email: form.email || null,
    phone: form.phone || null,
    location: form.location || null,
    website: form.website || null,
    linkedin: form.linkedin || null,
    github: form.github || null,
    summary: form.summary || null,
    sections: form.sections.map((section, index) => ({
      section_type: section.section_type,
      title: section.title || null,
      content: section.content,
      sort_order: section.sort_order ?? index,
    })),
  };
}

async function fetchResumes(): Promise<Resume[]> {
  const response = await fetch("/api/resumes", { credentials: "include" });
  if (!response.ok) throw new Error(`Failed to fetch resumes (${response.status})`);
  return response.json();
}

export default function Home() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ResumeForm>(blankForm());
  const [saveError, setSaveError] = useState("");

  const resumesQuery = useQuery({ queryKey: ["resumes"], queryFn: fetchResumes });

  const saveMutation = useMutation({
    mutationFn: async (data: ResumeForm) => {
      const method = data.id ? "PUT" : "POST";
      const url = data.id ? `/api/resumes/${data.id}` : "/api/resumes";
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(data)),
      });
      if (!response.ok) throw new Error(`Save failed (${response.status})`);
      return (await response.json()) as Resume;
    },
    onSuccess: async (saved) => {
      setSelectedId(saved.id);
      setForm(fromResume(saved));
      setSaveError("");
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error) => setSaveError(error instanceof Error ? error.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Delete failed (${response.status})`);
    },
    onSuccess: async () => {
      setSelectedId(null);
      setForm(blankForm());
      setSaveError("");
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  const updateSection = (index: number, updater: (section: SectionForm) => SectionForm) => {
    setForm((prev) => {
      const next = [...prev.sections];
      next[index] = updater(next[index]);
      return { ...prev, sections: next };
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate(form);
  };

  const resumeCount = useMemo(() => resumesQuery.data?.length ?? 0, [resumesQuery.data]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0ecff_0%,_#f6f8fc_35%,_#f8fafc_100%)] text-slate-900">
      <header className="print:hidden border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-4 py-3 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Resume Studio</p>
            <h1 className="text-lg font-semibold">Builder Workspace</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] gap-4 p-4 md:grid-cols-[290px_1fr_560px] md:px-6 md:py-5">
        <aside className="print:hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Documents</h2>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              onClick={() => {
                setSelectedId(null);
                setForm(blankForm());
                setSaveError("");
              }}
            >
              New
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500">{resumeCount} resumes</p>
          <div className="space-y-2">
            {(resumesQuery.data ?? []).map((resume) => (
              <button
                key={resume.id}
                type="button"
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  selectedId === resume.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setSelectedId(resume.id);
                  setForm(fromResume(resume));
                  setSaveError("");
                }}
              >
                <p className="truncate text-sm font-semibold">{resume.title || "Untitled Resume"}</p>
                <p className="text-xs text-slate-500">{new Date(resume.updated_at).toLocaleString()}</p>
              </button>
            ))}
            {resumesQuery.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
          </div>
        </aside>

        <section className="print:hidden rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Resume Name</span>
                <input className={textInput} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</span>
                <input className={textInput} value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className={textInput} placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              <input className={textInput} placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className={textInput} placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
              <input className={textInput} placeholder="Website" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
            </div>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Professional summary"
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Add Section</span>
                {sectionOptions().map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sections: [...prev.sections, defaultSection(item.value, prev.sections.length)],
                      }))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>

              {form.sections.map((section, sectionIndex) => (
                <div key={`${section.section_type}-${sectionIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 grid gap-2 md:grid-cols-[140px_1fr_auto]">
                    <select
                      className={sectionInput}
                      value={section.section_type}
                      onChange={(e) => {
                        const nextType = normalizeType(e.target.value);
                        updateSection(sectionIndex, () => defaultSection(nextType, sectionIndex));
                      }}
                    >
                      {sectionOptions().map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className={sectionInput}
                      value={section.title}
                      onChange={(e) => updateSection(sectionIndex, (prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Section title"
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          sections: prev.sections.filter((_, idx) => idx !== sectionIndex),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  {section.section_type === "custom" ? (
                    <textarea
                      className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      value={"text" in section.content ? section.content.text : ""}
                      onChange={(e) => updateSection(sectionIndex, (prev) => ({ ...prev, content: { text: e.target.value } }))}
                      placeholder="Custom section content"
                    />
                  ) : (
                    <SectionItemsEditor section={section} sectionIndex={sectionIndex} updateSection={updateSection} />
                  )}
                </div>
              ))}
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </button>
              {form.id && (
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  onClick={() => deleteMutation.mutate(form.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="resume-paper-container rounded-2xl border border-slate-200 bg-slate-100/80 p-3 shadow-sm">
          <article id="resume-paper" className="resume-paper mx-auto min-h-[960px] w-full max-w-[800px] rounded-md bg-white p-10 text-slate-900 shadow-lg">
            <header className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-bold tracking-tight">{form.full_name || "Your Name"}</h2>
              <p className="mt-2 text-sm text-slate-600">{[form.email, form.phone, form.location, form.website].filter(Boolean).join("  |  ")}</p>
            </header>
            {form.summary && (
              <section className="mt-6">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">Summary</h3>
                <p className="text-sm leading-relaxed text-slate-700">{form.summary}</p>
              </section>
            )}
            {form.sections.map((section, index) => (
              <section key={`preview-${section.section_type}-${index}`} className="mt-6">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">{section.title || titleCase(section.section_type)}</h3>
                {renderPreview(section)}
              </section>
            ))}
          </article>
        </section>
      </div>
    </main>
  );
}

function SectionItemsEditor({
  section,
  sectionIndex,
  updateSection,
}: {
  section: SectionForm;
  sectionIndex: number;
  updateSection: (index: number, updater: (section: SectionForm) => SectionForm) => void;
}) {
  if (!("items" in section.content)) return null;
  const fields = defaultSectionFields[section.section_type];
  const items = section.content.items;

  return (
    <div className="space-y-2">
      {items.map((item, itemIndex) => (
        <div key={`item-${itemIndex}`} className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="grid gap-2 md:grid-cols-2">
            {fields.map((field) => (
              <input
                key={`${field}-${itemIndex}`}
                className={sectionInput}
                placeholder={titleCase(field)}
                value={item[field] ?? ""}
                onChange={(e) =>
                  updateSection(sectionIndex, (prev) => {
                    if (!("items" in prev.content)) return prev;
                    const nextItems = [...prev.content.items];
                    nextItems[itemIndex] = { ...nextItems[itemIndex], [field]: e.target.value };
                    return { ...prev, content: { items: nextItems } };
                  })
                }
              />
            ))}
          </div>
          <div className="mt-2 text-right">
            <button
              type="button"
              className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
              onClick={() =>
                updateSection(sectionIndex, (prev) => {
                  if (!("items" in prev.content)) return prev;
                  const nextItems = prev.content.items.filter((_, idx) => idx !== itemIndex);
                  if (nextItems.length > 0) return { ...prev, content: { items: nextItems } };
                  const reset = defaultSection(prev.section_type, 0);
                  return { ...prev, content: reset.content };
                })
              }
            >
              Remove Item
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50"
        onClick={() =>
          updateSection(sectionIndex, (prev) => {
            if (!("items" in prev.content)) return prev;
            const reset = defaultSection(prev.section_type, 0);
            const newItem = "items" in reset.content ? reset.content.items[0] : {};
            return { ...prev, content: { items: [...prev.content.items, { ...newItem }] } };
          })
        }
      >
        <Plus className="h-3.5 w-3.5" />
        Add Item
      </button>
    </div>
  );
}

function renderPreview(section: SectionForm) {
  if (section.section_type === "custom") {
    return <p className="text-sm leading-relaxed text-slate-700">{"text" in section.content ? section.content.text : ""}</p>;
  }
  if (!("items" in section.content)) return null;

  return (
    <div className="space-y-3">
      {section.content.items.map((item, idx) => (
        <div key={`preview-item-${idx}`}>
          <p className="text-sm font-semibold text-slate-900">
            {item.role || item.degree || item.name || "Item"} {item.company || item.school ? `- ${item.company || item.school}` : ""}
          </p>
          <p className="text-xs text-slate-500">{[item.start, item.end, item.location].filter(Boolean).join(" | ")}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {item.description || item.level || item.technologies || item.url || ""}
          </p>
        </div>
      ))}
    </div>
  );
}
