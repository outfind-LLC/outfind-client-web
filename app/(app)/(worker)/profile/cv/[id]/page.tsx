import { ResumeEditor } from "@/features/resume/components/resume-editor";

/** Resume editor — inline editing, templates, live preview, ATS, export. */
export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResumeEditor id={id} />;
}
