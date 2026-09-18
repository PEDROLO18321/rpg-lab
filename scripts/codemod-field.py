"""
Codemod: liga cada <label> ao campo que ele descreve.

Transforma   <label style={X}>Nome</label><input style={Y} ... />
em           <Field label="Nome" style={X}><input style={Y} ... /></Field>

Só toca nos casos em que o campo é o próximo elemento depois do </label>. Qualquer
outra forma (rótulo de grupo, campo distante, JSX complexo no meio) é deixada para
correção manual — a lista sai no relatório.

Uso:  python scripts/codemod-field.py --dry
      python scripts/codemod-field.py --apply
"""
import io
import json
import re
import sys

CONTROLS = ("input", "select", "textarea")
LABEL_RE = re.compile(r"<label(\s[^>]*?)?>", re.S)


def skip_string(src, i):
    """Pula uma string JS/JSX que começa em src[i]. Devolve o índice depois dela."""
    quote = src[i]
    i += 1
    while i < len(src):
        if src[i] == "\\":
            i += 2
            continue
        if src[i] == quote:
            return i + 1
        i += 1
    return i


def find_tag_end(src, i):
    """Dado o índice de '<' de uma tag de abertura, devolve o índice depois de '>'.

    Respeita strings e chaves, para não parar num '>' dentro de `onChange={a > b}`.
    """
    depth = 0
    while i < len(src):
        c = src[i]
        if c in "\"'`":
            i = skip_string(src, i)
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        elif c == ">" and depth == 0:
            return i + 1
        i += 1
    return -1


def find_element_end(src, start):
    """Dado o índice de '<' de um elemento, devolve o índice depois do fechamento.

    Cobre auto-fechado (`<input />`) e com filhos (`<select>…</select>`), contando
    aninhamento de tags do mesmo nome.
    """
    m = re.match(r"<([A-Za-z][\w.-]*)", src[start:])
    if not m:
        return -1
    name = m.group(1)

    open_end = find_tag_end(src, start)
    if open_end == -1:
        return -1
    if src[open_end - 2] == "/":  # <input ... />
        return open_end

    depth = 1
    i = open_end
    open_re = re.compile(r"<" + re.escape(name) + r"(?=[\s/>])")
    close_re = re.compile(r"</" + re.escape(name) + r"\s*>")
    while i < len(src) and depth > 0:
        c = src[i]
        if c in "\"'`":
            i = skip_string(src, i)
            continue
        if c == "<":
            mc = close_re.match(src, i)
            if mc:
                depth -= 1
                i = mc.end()
                continue
            mo = open_re.match(src, i)
            if mo:
                tag_end = find_tag_end(src, i)
                if tag_end == -1:
                    return -1
                if src[tag_end - 2] != "/":
                    depth += 1
                i = tag_end
                continue
        i += 1
    return i if depth == 0 else -1


def label_children(src, open_end):
    """Conteúdo entre <label …> e </label>, ou None se não fechar de forma simples."""
    close = src.find("</label>", open_end)
    if close == -1:
        return None
    inner = src[open_end:close]
    # Um <label> que já contém o campo dentro dele não é caso nosso.
    if re.search(r"<(" + "|".join(CONTROLS) + r")\b", inner):
        return None
    return inner, close + len("</label>")


def attrs_to_props(attrs):
    """Reaproveita style/className do <label> como props do <Field>."""
    keep = []
    for name in ("style", "className"):
        m = re.search(name + r"=(\{(?:[^{}]|\{[^{}]*\})*\}|\"[^\"]*\")", attrs)
        if m:
            keep.append(f"{name}={m.group(1)}")
    return keep


def label_prop(inner):
    """Texto do rótulo como prop. Texto puro vira string; JSX vira fragmento."""
    text = inner.strip()
    if not text:
        return None
    if re.search(r"[<{]", text):
        return "label={<>" + text + "</>}"
    if '"' in text:
        return "label={" + json.dumps(text, ensure_ascii=False) + "}"
    return 'label="' + text + '"'


def transform(src):
    out = []
    i = 0
    done = 0
    skipped = []

    while True:
        m = LABEL_RE.search(src, i)
        if not m:
            break

        parsed = label_children(src, m.end())
        if parsed is None:
            out.append(src[i:m.end()])
            i = m.end()
            continue
        inner, after_label = parsed

        # O campo precisa ser a próxima coisa depois do </label>, fora comentários.
        gap_m = re.match(r"\s*", src[after_label:])
        ctrl_start = after_label + gap_m.end()
        ctrl_m = re.match(r"<(" + "|".join(CONTROLS) + r")\b", src[ctrl_start:])
        prop = label_prop(inner)

        if not ctrl_m or prop is None:
            if not re.search(r"htmlFor", m.group(0)):
                skipped.append((src[:m.start()].count("\n") + 1, inner.strip()[:60]))
            out.append(src[i:m.end()])
            i = m.end()
            continue

        ctrl_end = find_element_end(src, ctrl_start)
        if ctrl_end == -1:
            skipped.append((src[:m.start()].count("\n") + 1, inner.strip()[:60]))
            out.append(src[i:m.end()])
            i = m.end()
            continue

        props = " ".join([prop] + attrs_to_props(m.group(1) or ""))
        control = src[ctrl_start:ctrl_end]

        out.append(src[i:m.start()])
        out.append(f"<Field {props}>{control}</Field>")
        i = ctrl_end
        done += 1

    out.append(src[i:])
    return "".join(out), done, skipped


IMPORT = 'import { Field } from "@/components/ui/Field";\n'


def add_import(src):
    """Insere o import depois do último import *completo*.

    Um `import {` de várias linhas começa com "import " mas não termina ali: inserir
    logo depois dessa linha cai dentro das chaves e quebra o arquivo. Por isso a
    busca pula até o `} from …` que fecha o bloco.
    """
    if "@/components/ui/Field" in src:
        return src
    lines = src.split("\n")
    last = max(i for i, ln in enumerate(lines) if ln.startswith("import "))
    if lines[last].rstrip().endswith("{"):
        while last < len(lines) and not re.match(r"\}\s+from\s", lines[last].strip()):
            last += 1
    lines.insert(last + 1, IMPORT.rstrip("\n"))
    return "\n".join(lines)


def main():
    apply = "--apply" in sys.argv
    report = json.load(io.open("eslint-a11y.json", encoding="utf-8"))
    targets = sorted({
        f["filePath"] for f in report
        for msg in f["messages"]
        if msg.get("ruleId") == "jsx-a11y/label-has-associated-control"
    })

    total_done = 0
    total_skipped = []
    changed = 0

    for path in targets:
        src = io.open(path, encoding="utf-8").read()
        new, done, skipped = transform(src)
        total_done += done
        total_skipped += [(path, ln, txt) for ln, txt in skipped]
        if done and apply:
            io.open(path, "w", encoding="utf-8", newline="\n").write(add_import(new))
            changed += 1

    print(f"{'aplicado' if apply else 'seco'}: {total_done} rótulos ligados em {changed or len(targets)} arquivos")
    print(f"deixados para revisão manual: {len(total_skipped)}")
    for path, ln, txt in total_skipped[:40]:
        print(f"   {path.split('TCC')[-1]}:{ln}  {txt}")


if __name__ == "__main__":
    main()
