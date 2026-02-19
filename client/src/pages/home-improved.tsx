import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download, Plus, Save, Trash2, FileText,
  Briefcase, GraduationCap, Code, Folder, X,
  ChevronDown, ChevronUp, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type SectionType = "experience" | "education" | "skills" | "projects" | "custom";

type ResumeSection = {
  id?: number;
  section_type: string;
  title: string | null;
  content: Record<string, any>;
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
  content: Record<string, any>;
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

const defaultSectionFields: Record<SectionType, string[]> = {
  experience: ["company", "role", "start", "end", "location", "description"],
  education: ["school", "degree", "start", "end", "description"],
  skills: ["name", "level"],
  projects: ["name", "url", "technologies", "description"],
  custom: [],
};

const sectionIcons = {
  experience: Briefcase,
  education: GraduationCap,
  skills: Code,
  projects: Folder,
  custom: FileText,
};

function blankForm(): ResumeForm {
  return {
    title: "My Resume",
    template: "modern",
    full_name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    sections: [],
  };
}

function defaultSection(type: SectionType, index: number): SectionForm {
  if (type === "custom") {
    return { section_type: type, title: "Custom Section", sort_order: index, content: { text: "" } };
  }
  const firstItem: Record<string, string> = {};
  for (const field of defaultSectionFields[type]) firstItem[field] = "";
  return {
    section_type: type,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    sort_order: index,
    content: { items: [firstItem] }
  };
}

async function fetchResumes(): Promise<Resume[]> {
  const response = await fetch("/api/resumes");
  if (!response.ok) throw new Error(`Failed to fetch resumes`);
  return response.json();
}

export default function Home() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ResumeForm>(blankForm());
  const [previewVisible, setPreviewVisible] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const resumesQuery = useQuery({ queryKey: ["resumes"], queryFn: fetchResumes });

  const saveMutation = useMutation({
    mutationFn: async (data: ResumeForm) => {
      const method = data.id ? "PUT" : "POST";
      const url = data.id ? `/api/resumes/${data.id}` : "/api/resumes";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Save failed");
      return (await response.json()) as Resume;
    },
    onSuccess: async (saved) => {
      setSelectedId(saved.id);
      setForm(resumeToForm(saved));
      toast({ title: "Success", description: "Resume saved successfully" });
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save resume", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
    },
    onSuccess: async () => {
      setSelectedId(null);
      setForm(blankForm());
      toast({ title: "Success", description: "Resume deleted" });
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  const resumeToForm = (resume: Resume): ResumeForm => ({
    id: resume.id,
    title: resume.title || "",
    template: resume.template || "modern",
    full_name: resume.full_name || "",
    email: resume.email || "",
    phone: resume.phone || "",
    location: resume.location || "",
    website: resume.website || "",
    linkedin: resume.linkedin || "",
    github: resume.github || "",
    summary: resume.summary || "",
    sections: resume.sections.map(s => ({
      section_type: s.section_type as SectionType,
      title: s.title || "",
      sort_order: s.sort_order,
      content: s.content,
    })),
  });

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const addSection = (type: SectionType) => {
    const newSection = defaultSection(type, form.sections.length);
    setForm(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    const newExpanded = new Set(expandedSections);
    newExpanded.add(form.sections.length);
    setExpandedSections(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Resume Builder</h1>
              <p className="text-xs text-slate-500">Create your professional resume</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewVisible(!previewVisible)}
              className="hidden lg:flex"
            >
              {previewVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {previewVisible ? "Hide" : "Show"} Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 print:hidden space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  My Resumes
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedId(null);
                      setForm(blankForm());
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resumesQuery.data?.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => {
                      setSelectedId(resume.id);
                      setForm(resumeToForm(resume));
                    }}
                    className={`w-full p-3 rounded-lg text-left transition ${
                      selectedId === resume.id
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{resume.title}</p>
                    <p className="text-xs text-slate-500">{new Date(resume.updated_at).toLocaleDateString()}</p>
                  </button>
                ))}
                {resumesQuery.isLoading && (
                  <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
                )}
                {!resumesQuery.isLoading && (!resumesQuery.data || resumesQuery.data.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No resumes yet</p>
                )}
              </CardContent>
            </Card>

            {form.id && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => form.id && deleteMutation.mutate(form.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Resume
              </Button>
            )}
          </aside>

          <main className={`${previewVisible ? "lg:col-span-5" : "lg:col-span-9"} print:hidden space-y-6`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Resume Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Software Engineer Resume"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name</label>
                    <Input
                      value={form.full_name}
                      onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Location</label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Website</label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://johndoe.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">LinkedIn</label>
                    <Input
                      value={form.linkedin}
                      onChange={(e) => setForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Professional Summary</label>
                  <Textarea
                    value={form.summary}
                    onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="A brief summary of your professional background and goals..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Sections
                  <div className="flex gap-2">
                    {Object.entries(sectionIcons).map(([type, Icon]) => (
                      <Button
                        key={type}
                        size="sm"
                        variant="outline"
                        onClick={() => addSection(type as SectionType)}
                        title={`Add ${type}`}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.sections.map((section, idx) => {
                  const Icon = sectionIcons[section.section_type] || FileText;
                  const isExpanded = expandedSections.has(idx);

                  return (
                    <div key={idx} className="border rounded-lg">
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                        onClick={() => toggleSection(idx)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-600" />
                          <span className="font-medium text-sm">{section.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm(prev => ({
                                ...prev,
                                sections: prev.sections.filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t bg-slate-50/50">
                          <SectionEditor
                            section={section}
                            onChange={(updated) => {
                              setForm(prev => ({
                                ...prev,
                                sections: prev.sections.map((s, i) => i === idx ? updated : s)
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {form.sections.length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-8">
                    No sections yet. Click the icons above to add sections.
                  </p>
                )}
              </CardContent>
            </Card>
          </main>

          {previewVisible && (
            <aside className="lg:col-span-4 print:col-span-12">
              <div className="sticky top-24">
                <Card className="shadow-lg">
                  <CardContent className="p-0">
                    <ResumePreview form={form} />
                  </CardContent>
                </Card>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange }: { section: SectionForm; onChange: (section: SectionForm) => void }) {
  if (section.section_type === "custom") {
    return (
      <Textarea
        value={section.content.text || ""}
        onChange={(e) => onChange({ ...section, content: { text: e.target.value } })}
        placeholder="Enter custom content..."
        rows={4}
      />
    );
  }

  const fields = defaultSectionFields[section.section_type];
  const items = section.content.items || [];

  return (
    <div className="space-y-4">
      {items.map((item: Record<string, string>, itemIdx: number) => (
        <div key={itemIdx} className="p-3 bg-white rounded-lg border space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field} className={field === "description" ? "md:col-span-2" : ""}>
                <label className="text-xs font-medium text-slate-600 mb-1 block capitalize">
                  {field.replace("_", " ")}
                </label>
                {field === "description" ? (
                  <Textarea
                    value={item[field] || ""}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[itemIdx] = { ...newItems[itemIdx], [field]: e.target.value };
                      onChange({ ...section, content: { items: newItems } });
                    }}
                    placeholder={`Enter ${field}...`}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={item[field] || ""}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[itemIdx] = { ...newItems[itemIdx], [field]: e.target.value };
                      onChange({ ...section, content: { items: newItems } });
                    }}
                    placeholder={`Enter ${field}...`}
                  />
                )}
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const newItems = items.filter((_: any, i: number) => i !== itemIdx);
              if (newItems.length === 0) {
                const emptyItem: Record<string, string> = {};
                fields.forEach(f => emptyItem[f] = "");
                newItems.push(emptyItem);
              }
              onChange({ ...section, content: { items: newItems } });
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const emptyItem: Record<string, string> = {};
          fields.forEach(f => emptyItem[f] = "");
          onChange({ ...section, content: { items: [...items, emptyItem] } });
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}

function ResumePreview({ form }: { form: ResumeForm }) {
  return (
    <div className="bg-white w-full aspect-[8.5/11] overflow-auto">
      <div className="p-8 min-h-full">
        <header className="mb-6 pb-4 border-b-2 border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {form.full_name || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {form.email && <span>{form.email}</span>}
            {form.phone && <span>{form.phone}</span>}
            {form.location && <span>{form.location}</span>}
            {form.website && <span className="text-blue-600">{form.website}</span>}
            {form.linkedin && <span className="text-blue-600">{form.linkedin}</span>}
          </div>
        </header>

        {form.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Summary</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{form.summary}</p>
          </section>
        )}

        {form.sections.map((section, idx) => (
          <section key={idx} className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">{section.title}</h2>
            {section.section_type === "custom" ? (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{section.content.text}</p>
            ) : (
              <div className="space-y-4">
                {(section.content.items || []).map((item: Record<string, string>, itemIdx: number) => (
                  <div key={itemIdx}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {item.role || item.degree || item.name || ""}
                        {(item.company || item.school) && <span className="text-slate-600"> - {item.company || item.school}</span>}
                      </h3>
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                        {[item.start, item.end].filter(Boolean).join(" - ")}
                      </span>
                    </div>
                    {item.location && <p className="text-xs text-slate-500 mb-1">{item.location}</p>}
                    {item.description && <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>}
                    {item.technologies && <p className="text-sm text-slate-600 mt-1">Tech: {item.technologies}</p>}
                    {item.url && <p className="text-sm text-blue-600 mt-1">{item.url}</p>}
                    {item.level && <p className="text-sm text-slate-600">Level: {item.level}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {form.sections.length === 0 && !form.summary && (
          <p className="text-center text-slate-400 py-12">Start adding content to see your resume preview</p>
        )}
      </div>
    </div>
  );
}
