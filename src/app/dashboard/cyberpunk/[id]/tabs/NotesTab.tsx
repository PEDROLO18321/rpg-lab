"use client";

import { useState } from "react";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { areaStyle } from "../../ui";
import { BgField } from "./LifepathTab";
import type { TabProps } from "../sheetModel";

export function NotesTab({ sh, patch }: TabProps) {
  const [text, setText] = useState(sh.notes);

  return (
    <SheetShell
      system="cyberpunk"
      left={
        <SheetSection title="Anotações" accent>
          <textarea
            aria-label="Anotações"
            value={text} rows={16} style={{ ...areaStyle, minHeight: 280 }}
            placeholder={"Contatos, dívidas, pistas, nomes de fixers…"}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => { if (text !== sh.notes) patch({ notes: text }); }}
          />
        </SheetSection>
      }
      right={
        <SheetSection title="Notas do kit e da moda">
          <BgField sh={sh} patch={patch} field="notes" label="Roupas e observações" rows={6} />
        </SheetSection>
      }
    />
  );
}
