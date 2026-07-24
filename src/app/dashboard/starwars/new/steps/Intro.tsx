import { SectionTitle } from "../../ui";

export function Intro({ title, text, eyebrow }: { title: string; text: string; eyebrow?: string }) {
  return <SectionTitle eyebrow={eyebrow} title={title} desc={text} />;
}
