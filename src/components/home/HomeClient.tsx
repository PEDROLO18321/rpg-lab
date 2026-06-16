"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

// ── Data pools ────────────────────────────────────────────────────────────────

const CHARACTERS = [
  { name: "Thorin Ferreiro",    subtitle: "Guerreiro · Nível 8 · Anão",    ac: 18, hp: 72, hpMax: 86,  stats: [{ abbr:"FOR", score:20, mod:"+5" },{ abbr:"DES", score:14, mod:"+2" },{ abbr:"CON", score:18, mod:"+4" }], skills:[{ name:"Atletismo",     mod:"+9", prof:true  },{ name:"Percepção",  mod:"+4", prof:false },{ name:"Intimidação", mod:"+7", prof:true  }], badge:"Campeão",            hpColor:"#22c55e" },
  { name: "Lyraniel Starblade", subtitle: "Mago · Nível 5 · Elfo",         ac: 13, hp: 28, hpMax: 28,  stats: [{ abbr:"INT", score:20, mod:"+5" },{ abbr:"DES", score:16, mod:"+3" },{ abbr:"SAB", score:14, mod:"+2" }], skills:[{ name:"Arcanismo",     mod:"+8", prof:true  },{ name:"História",    mod:"+8", prof:true  },{ name:"Percepção",   mod:"+4", prof:false }], badge:"Escola da Evocação",  hpColor:"#22c55e" },
  { name: "Katara da Luz",      subtitle: "Clérigo · Nível 3 · Humana",    ac: 16, hp: 21, hpMax: 24,  stats: [{ abbr:"SAB", score:18, mod:"+4" },{ abbr:"CON", score:14, mod:"+2" },{ abbr:"CAR", score:13, mod:"+1" }], skills:[{ name:"Medicina",      mod:"+6", prof:true  },{ name:"Religião",    mod:"+4", prof:true  },{ name:"Persuasão",   mod:"+3", prof:false }], badge:"Domínio da Vida",     hpColor:"#22c55e" },
  { name: "Vex Sombrático",     subtitle: "Ladino · Nível 6 · Meio-Elfo",  ac: 15, hp: 18, hpMax: 39,  stats: [{ abbr:"DES", score:20, mod:"+5" },{ abbr:"INT", score:15, mod:"+2" },{ abbr:"CAR", score:16, mod:"+3" }], skills:[{ name:"Furtividade",   mod:"+8", prof:true  },{ name:"Enganação",   mod:"+6", prof:true  },{ name:"Percepção",   mod:"+5", prof:true  }], badge:"Arquétipo Ladrão",    hpColor:"#f59e0b" },
  { name: "Zara Sombrachama",   subtitle: "Bruxo · Nível 4 · Tiefling",    ac: 13, hp:  9, hpMax: 26,  stats: [{ abbr:"CAR", score:18, mod:"+4" },{ abbr:"CON", score:14, mod:"+2" },{ abbr:"DES", score:14, mod:"+2" }], skills:[{ name:"Arcanismo",     mod:"+6", prof:true  },{ name:"Enganação",   mod:"+6", prof:true  },{ name:"Intimidação", mod:"+6", prof:true  }], badge:"O Grande Antigo",     hpColor:"#ef4444" },
  { name: "Bram Alegrote",      subtitle: "Bardo · Nível 7 · Humano",      ac: 15, hp: 50, hpMax: 52,  stats: [{ abbr:"CAR", score:20, mod:"+5" },{ abbr:"DES", score:16, mod:"+3" },{ abbr:"SAB", score:12, mod:"+1" }], skills:[{ name:"Atuação",       mod:"+8", prof:true  },{ name:"Persuasão",   mod:"+8", prof:true  },{ name:"Percepção",   mod:"+4", prof:true  }], badge:"Colégio do Saber",    hpColor:"#22c55e" },
  { name: "Hrunk Trovão",       subtitle: "Bárbaro · Nível 2 · Meio-Orc",  ac: 14, hp: 30, hpMax: 30,  stats: [{ abbr:"FOR", score:20, mod:"+5" },{ abbr:"CON", score:18, mod:"+4" },{ abbr:"DES", score:12, mod:"+1" }], skills:[{ name:"Atletismo",     mod:"+7", prof:true  },{ name:"Intimidação", mod:"+4", prof:true  },{ name:"Sobrevivência",mod:"+2",prof:false }], badge:"Caminho Berserker",   hpColor:"#22c55e" },
  { name: "Sylva Verdeflor",    subtitle: "Druida · Nível 4 · Halfling",   ac: 14, hp: 15, hpMax: 28,  stats: [{ abbr:"SAB", score:18, mod:"+4" },{ abbr:"CON", score:14, mod:"+2" },{ abbr:"INT", score:13, mod:"+1" }], skills:[{ name:"Natureza",      mod:"+5", prof:true  },{ name:"Medicina",    mod:"+6", prof:true  },{ name:"Percepção",   mod:"+6", prof:true  }], badge:"Círculo da Lua",      hpColor:"#f59e0b" },
];

const CLASS_CYCLE = ["Guerreiro","Mago","Ladino","Bardo","Druida","Paladino","Clérigo","Bárbaro","Bruxo","Monge"];

const FLAVOR_TEXTS = [
  "Os dados são lançados. O destino aguarda.",
  "A dungeon não vai explorar a si mesma.",
  "Cada rolo de dados escreve uma nova lenda.",
  "O mundo precisa de heróis. Você está pronto?",
  "A masmorra chama. Os monstros tremem.",
  "Forje lendas. Um personagem de cada vez.",
  "Que os dados te sejam sempre favoráveis.",
  "A taverna está cheia. Sua próxima aventura, não.",
  "Heróis não nascem. São criados rolo a rolo.",
  "O Dungeon Master sorri. Tema-o.",
];

const STATUS_POOL = [
  { label:"Inspirado",    color:"#4fc3f7", bg:"rgba(79,195,247,0.12)"  },
  { label:"Em Combate",   color:"#ef4444", bg:"rgba(239,68,68,0.12)"   },
  { label:"Aura Arcana",  color:"#a855f7", bg:"rgba(168,85,247,0.12)"  },
  { label:"Em Guarda",    color:"#22c55e", bg:"rgba(34,197,94,0.12)"   },
  { label:"Concentrado",  color:"#e8b84b", bg:"rgba(232,184,75,0.12)"  },
  { label:"Ardente",      color:"#f97316", bg:"rgba(249,115,22,0.12)"  },
  { label:"Amaldiçoado",  color:"#c084fc", bg:"rgba(192,132,252,0.12)" },
  { label:"Resistente",   color:"#94a3b8", bg:"rgba(148,163,184,0.12)" },
  { label:"Proficiente",  color:"#fbbf24", bg:"rgba(251,191,36,0.12)"  },
  { label:"Estudando",    color:"#38bdf8", bg:"rgba(56,189,248,0.12)"  },
  { label:"Com Vantagem", color:"#34d399", bg:"rgba(52,211,153,0.12)"  },
  { label:"Alerta",       color:"#fb923c", bg:"rgba(251,146,60,0.12)"  },
];

const QUESTS = [
  { type:"MISSÃO PRINCIPAL", title:"Escolher Campanha", desc:"Selecione o sistema de RPG, escolha seu papel e inicie sua aventura criando um novo personagem.", reward:"A jornada começa aqui", href:"/dashboard", diff:3, accent:true },
];

const FEATURES = [
  { title:"Mecânicas Automáticas",  desc:"Modificadores, proficiências e bônus calculados em tempo real. Zero cálculo manual."          },
  { title:"D&D 5e Completo",        desc:"12 classes, 9 raças, subclasses, magias, antecedentes e ficha interativa de jogo."            },
  { title:"Compartilhamento",       desc:"Gere um link único para sua ficha e compartilhe com o mestre ou grupo na hora."               },
  { title:"Salvo na Nuvem",         desc:"Seus dados sincronizados e seguros. Acesse de qualquer dispositivo sem perder nada."          },
  { title:"Modo de Jogo",           desc:"Ficha interativa com rolagem de dados, controle de HP, condições e espaços de magia."         },
  { title:"Multi-sistema",          desc:"D&D 5e disponível agora. Call of Cthulhu e Tormenta 20 chegando em breve."                   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

type Char = typeof CHARACTERS[number];

function getTimeData(): { greeting: string; period: string } {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { greeting:"O amanhecer traz novos desafios",          period:"Manhã"     };
  if (h >= 12 && h < 17) return { greeting:"O sol do meio-dia brilha em sua armadura", period:"Tarde"     };
  if (h >= 17 && h < 21) return { greeting:"O crepúsculo convida à taverna",           period:"Anoitecer" };
  return                         { greeting:"A noite é perigosa para os despreparados", period:"Noite"     };
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 32, delay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(timer); setDone(true); }
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(start);
  }, [text, speed, delay]);
  return { displayed, done };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props { session: Session | null }

// ── Main ──────────────────────────────────────────────────────────────────────

export function HomeClient({ session }: Props) {
  const isAuthed = !!session?.user;
  const userName = session?.user?.name ?? session?.user?.email ?? "Aventureiro";

  const [char,         setChar]         = useState<Char | null>(null);
  const [classIdx,     setClassIdx]     = useState(0);
  const [classVisible, setClassVisible] = useState(true);
  const [statuses,     setStatuses]     = useState<typeof STATUS_POOL>([]);
  const [flavor,       setFlavor]       = useState("");
  const [timeData,     setTimeData]     = useState(getTimeData());

  useEffect(() => {
    setChar(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]);
    setStatuses(pickRandom(STATUS_POOL, 3));
    setFlavor(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)]);
    setTimeData(getTimeData());
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setClassVisible(false);
      setTimeout(() => { setClassIdx((i) => (i + 1) % CLASS_CYCLE.length); setClassVisible(true); }, 280);
    }, 2400);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"transparent", overflowX:"hidden" }}>
      <TopNav isAuthed={isAuthed} userName={userName} />

      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
        <Background isAuthed={isAuthed} />

        <div style={{ maxWidth:1160, margin:"0 auto", width:"100%", padding:"120px 28px 80px", display:"grid", gridTemplateColumns:"1fr auto", gap:56, alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:0, maxWidth:600 }}>
            {isAuthed ? (
              <AuthedHero
                name={userName}
                classText={CLASS_CYCLE[classIdx]}
                classVisible={classVisible}
                statuses={statuses}
                flavor={flavor}
                timeData={timeData}
              />
            ) : (
              <PublicContent classText={CLASS_CYCLE[classIdx]} classVisible={classVisible} />
            )}
          </div>

          <div className="hidden lg:flex" style={{ justifyContent:"center", flexShrink:0, position:"relative" }}>
            {char && (
              <>
                <SheetCard char={char} />
              </>
            )}
          </div>
        </div>

        <div aria-hidden style={{ position:"absolute", bottom:0, left:0, right:0, height:160, pointerEvents:"none", background:"linear-gradient(to bottom, transparent, var(--bg))" }} />
      </section>

      {isAuthed && <QuestBoard />}

      {!isAuthed && (
        <>
          <StatsStrip />
          <FeaturesSection />
          <SystemsSection />
          <CtaSection />
        </>
      )}

      <SiteFooter isAuthed={isAuthed} />
    </div>
  );
}

// ── Background ────────────────────────────────────────────────────────────────

function Background({ isAuthed }: { isAuthed?: boolean }) {
  return (
    <>
      <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:"70%", height:"70%", top:"10%", left:"-10%", borderRadius:"50%", background:`radial-gradient(ellipse, ${isAuthed ? "rgba(168,85,247,0.07)" : "rgba(201,148,31,0.07)"} 0%, transparent 70%)`, animation:"orb-a 22s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:"60%", height:"60%", top:"20%", right:"-15%", borderRadius:"50%", background:`radial-gradient(ellipse, ${isAuthed ? "rgba(201,148,31,0.06)" : "rgba(59,130,246,0.045)"} 0%, transparent 65%)`, animation:"orb-b 28s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:"50%", height:"50%", bottom:"5%", left:"30%", borderRadius:"50%", background:`radial-gradient(ellipse, ${isAuthed ? "rgba(59,130,246,0.05)" : "rgba(139,92,246,0.035)"} 0%, transparent 60%)`, animation:"orb-c 19s ease-in-out infinite" }} />
      </div>
      <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0.016, backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize:"72px 72px" }} />
    </>
  );
}

// ── Authed hero ───────────────────────────────────────────────────────────────

function AuthedHero({ name, classText, classVisible, statuses, flavor, timeData }: {
  name: string; classText: string; classVisible: boolean;
  statuses: typeof STATUS_POOL; flavor: string;
  timeData: { greeting: string; period: string };
}) {
  const firstName = name.split(" ")[0];
  const title = `${firstName}, é hora de aventurar.`;
  const { displayed, done } = useTypewriter(title, 36, 300);

  return (
    <>
      <div className="anim-fade-up" style={{ animationDelay:"0s", display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.28)", borderRadius:"var(--radius-full)", alignSelf:"flex-start", marginBottom:22 }}>
        <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#c084fc", letterSpacing:"0.06em" }}>{timeData.period} · {timeData.greeting}</span>
      </div>

      <h1 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"clamp(2rem,4vw,3.4rem)", fontWeight:700, lineHeight:1.1, letterSpacing:"-0.01em", color:"var(--text)", marginBottom:6, minHeight:"3.8rem" }}>
        {displayed}
        {!done && (
          <span style={{ display:"inline-block", width:3, height:"1em", background:"var(--accent)", marginLeft:2, verticalAlign:"text-bottom", animation:"cursor-blink 0.8s step-end infinite" }} />
        )}
      </h1>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, height:34, overflow:"hidden" }}>
        <span style={{ fontSize:"0.95rem", color:"var(--text-muted)" }}>Hoje você é um</span>
        <span style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"1rem", fontWeight:700, color:"var(--accent-light)", transition:"opacity 0.26s, transform 0.26s", opacity:classVisible?1:0, transform:classVisible?"translateY(0)":"translateY(-8px)", display:"inline-block" }}>
          {classText}
        </span>
      </div>

      {flavor && (
        <p className="anim-fade-up" style={{ animationDelay:"0.6s", fontSize:"0.9rem", color:"var(--text-muted)", fontStyle:"italic", marginBottom:24, borderLeft:"2px solid var(--accent)", paddingLeft:12, lineHeight:1.6, maxWidth:400 }}>
          &ldquo;{flavor}&rdquo;
        </p>
      )}

      <div className="anim-fade-up" style={{ animationDelay:"0.8s", display:"flex", flexWrap:"wrap", gap:7, marginBottom:28 }}>
        {statuses.map((s) => (
          <span key={s.label} style={{ display:"inline-flex", alignItems:"center", padding:"4px 12px", borderRadius:"var(--radius-full)", background:s.bg, border:`1px solid ${s.color}44`, fontSize:"0.72rem", fontWeight:700, color:s.color, letterSpacing:"0.04em" }}>
            {s.label}
          </span>
        ))}
      </div>

      <div className="anim-fade-up" style={{ animationDelay:"1s", display:"flex", flexWrap:"wrap", gap:12 }}>
        <GoldBtn href="/dashboard">Laboratório</GoldBtn>
        <GhostBtn href="/dashboard/dnd/jogador">Meus Personagens</GhostBtn>
      </div>
    </>
  );
}

// ── Public hero ───────────────────────────────────────────────────────────────

function PublicContent({ classText, classVisible }: { classText: string; classVisible: boolean }) {
  return (
    <>
      <div className="anim-fade-up" style={{ animationDelay:"0.05s", display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--accent-dim)", border:"1px solid var(--border-accent)", borderRadius:"var(--radius-full)", alignSelf:"flex-start", marginBottom:28 }}>
        <span style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--accent-light)", letterSpacing:"0.06em" }}>D&amp;D 5e · Call of Cthulhu · Tormenta 20</span>
      </div>

      <h1 className="anim-fade-up" style={{ animationDelay:"0.12s", fontFamily:"var(--font-cinzel), serif", fontSize:"clamp(2.4rem,4.8vw,4rem)", fontWeight:700, lineHeight:1.08, letterSpacing:"-0.01em", color:"var(--text)", marginBottom:20 }}>
        Forje o seu<br />
        <span className="text-shimmer">Personagem.</span>
      </h1>

      <div className="anim-fade-up" style={{ animationDelay:"0.2s", display:"flex", alignItems:"center", gap:10, marginBottom:22, height:36, overflow:"hidden" }}>
        <span style={{ fontSize:"1rem", color:"var(--text-muted)" }}>Você é um</span>
        <span style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"1.1rem", fontWeight:700, color:"var(--accent-light)", transition:"opacity 0.28s, transform 0.28s", opacity:classVisible?1:0, transform:classVisible?"translateY(0)":"translateY(-8px)", display:"inline-block" }}>
          {classText}
        </span>
      </div>

      <p className="anim-fade-up" style={{ animationDelay:"0.28s", fontSize:"clamp(0.95rem,1.6vw,1.05rem)", color:"var(--text-muted)", lineHeight:1.8, maxWidth:480, marginBottom:36 }}>
        Crie e gerencie fichas de personagem para os principais sistemas de RPG.
        Mecânicas calculadas automaticamente, modo interativo de jogo e tudo salvo na nuvem.
      </p>

      <div className="anim-fade-up" style={{ animationDelay:"0.36s", display:"flex", flexWrap:"wrap", gap:12, marginBottom:20 }}>
        <GoldBtn href="/register">Começar gratuitamente</GoldBtn>
        <GhostBtn href="#features">Ver recursos</GhostBtn>
      </div>

      <p className="anim-fade-up" style={{ animationDelay:"0.42s", fontSize:"0.76rem", color:"var(--text-subtle)" }}>
        Gratuito · Sem cartão de crédito · Qualquer dispositivo
      </p>
    </>
  );
}

// ── Floating character card ───────────────────────────────────────────────────

function SheetCard({ char }: { char: Char }) {
  const pct = Math.round((char.hp / char.hpMax) * 100);
  return (
    <div className="float anim-scale-in" style={{ animationDelay:"0.4s", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:"24px", width:320, boxShadow:"0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 50px rgba(201,148,31,0.08)", backdropFilter:"blur(8px)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.98rem", fontWeight:700, color:"var(--text)" }}>{char.name}</div>
          <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:2 }}>{char.subtitle}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"0.6rem", color:"var(--text-subtle)", marginBottom:3 }}>CA</div>
          <div style={{ width:36, height:36, background:"var(--accent-dim)", border:"1px solid var(--border-accent)", borderRadius:"var(--radius)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.88rem", fontWeight:700, color:"var(--accent-light)" }}>{char.ac}</div>
        </div>
      </div>

      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:"0.68rem", color:"var(--text-subtle)", fontWeight:600, letterSpacing:"0.06em" }}>PONTOS DE VIDA</span>
          <span style={{ fontSize:"0.76rem", fontWeight:700, color:char.hpColor }}>{char.hp} / {char.hpMax}</span>
        </div>
        <div style={{ height:5, background:"var(--surface-3)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${char.hpColor}, ${char.hpColor}cc)`, borderRadius:3, transition:"width 0.5s ease" }} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:18 }}>
        {char.stats.map((s) => (
          <div key={s.abbr} style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"10px 0", textAlign:"center" }}>
            <div style={{ fontSize:"0.58rem", color:"var(--text-subtle)", letterSpacing:"0.08em", marginBottom:3 }}>{s.abbr}</div>
            <div style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"1.15rem", fontWeight:700, color:"var(--text)", lineHeight:1 }}>{s.score}</div>
            <div style={{ fontSize:"0.7rem", color:"var(--accent-light)", fontWeight:600, marginTop:2 }}>{s.mod}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
        {char.skills.map((sk) => (
          <div key={sk.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:sk.prof?"var(--accent)":"var(--surface-3)", border:sk.prof?"none":"1px solid var(--border)", flexShrink:0 }} />
              <span style={{ fontSize:"0.76rem", color:"var(--text-muted)" }}>{sk.name}</span>
            </div>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:sk.prof?"var(--accent-light)":"var(--text-muted)" }}>{sk.mod}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop:"1px solid var(--border)", paddingTop:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"0.66rem", color:"var(--text-subtle)" }}>D&amp;D 5e</span>
        <div style={{ padding:"3px 10px", background:"var(--accent-dim)", border:"1px solid var(--border-accent)", borderRadius:"var(--radius-full)", fontSize:"0.62rem", fontWeight:700, color:"var(--accent-light)", letterSpacing:"0.05em" }}>{char.badge}</div>
      </div>
    </div>
  );
}

// ── Floating d20 (authed only) ────────────────────────────────────────────────

function FloatingDice() {
  const [value, setValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  function roll() {
    if (rolling) return;
    setRolling(true);
    setValue(null);
    let ticks = 0;
    const max = 14 + Math.floor(Math.random() * 8);
    const timer = setInterval(() => {
      setValue(Math.floor(Math.random() * 20) + 1);
      ticks++;
      if (ticks >= max) {
        clearInterval(timer);
        setValue(Math.floor(Math.random() * 20) + 1);
        setRolling(false);
      }
    }, 80);
  }

  const isCrit   = value === 20;
  const isFumble = value === 1;

  return (
    <div style={{ position:"absolute", top:-20, right:-60, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <button
        onClick={roll}
        title="Clicar para rolar d20"
        style={{
          width:64, height:64, borderRadius:"var(--radius-lg)",
          background: isCrit ? "rgba(201,148,31,0.2)" : isFumble ? "rgba(239,68,68,0.15)" : "var(--surface-2)",
          border: `2px solid ${isCrit ? "var(--accent)" : isFumble ? "#ef4444" : "var(--border)"}`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
          cursor:"pointer",
          boxShadow: isCrit ? "0 0 24px var(--accent-glow)" : isFumble ? "0 0 16px rgba(239,68,68,0.3)" : "0 4px 16px rgba(0,0,0,0.4)",
          transition:"transform 0.15s, box-shadow 0.15s",
          animation: rolling ? "dice-shake 0.08s linear infinite" : "float 4s ease-in-out infinite",
        }}
        onMouseEnter={(e) => { if (!rolling) e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { if (!rolling) e.currentTarget.style.transform = ""; }}
      >
        <span style={{ fontSize:"0.5rem", fontWeight:700, color:"var(--text-subtle)", letterSpacing:"0.12em" }}>D20</span>
        <span style={{ fontFamily:"var(--font-cinzel), serif", fontSize: value !== null ? "1.3rem" : "0.95rem", fontWeight:900, color: isCrit ? "var(--accent-light)" : isFumble ? "#ef4444" : value !== null ? "var(--text)" : "var(--text-subtle)", lineHeight:1 }}>
          {value !== null ? value : "—"}
        </span>
      </button>
      <p style={{ fontSize:"0.6rem", fontWeight:700, color: isCrit ? "var(--accent)" : isFumble ? "#ef4444" : "var(--text-subtle)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
        {isCrit ? "Crítico" : isFumble ? "Falha" : "rolar"}
      </p>
    </div>
  );
}

// ── Quest board (authed) ──────────────────────────────────────────────────────

function QuestBoard() {
  return (
    <section style={{ maxWidth:1060, margin:"0 auto", padding:"0 28px 100px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <div style={{ flex:1, height:1, background:"linear-gradient(to right, transparent, var(--border))" }} />
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 20px", background:"var(--surface)", border:"1px solid var(--border-accent)", borderRadius:"var(--radius-full)" }}>
          <span style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.78rem", fontWeight:700, color:"var(--accent-light)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Quadro de Missões</span>
        </div>
        <div style={{ flex:1, height:1, background:"linear-gradient(to left, transparent, var(--border))" }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"minmax(290px, 520px)", gap:20, justifyContent:"center" }}>
        {QUESTS.map((q) => <QuestCard key={q.title} quest={q} />)}
      </div>

      <p style={{ textAlign:"center", fontSize:"0.72rem", color:"var(--text-subtle)", marginTop:32, fontStyle:"italic" }}>
        Toda grande jornada começa com o primeiro rolo de dados. — Livro dos Aventureiros, Cap. 1
      </p>
    </section>
  );
}

function QuestCard({ quest }: { quest: typeof QUESTS[number] }) {
  const [hovered, setHovered] = useState(false);
  const diffStars = Array.from({ length: 3 }, (_, i) => i < quest.diff);

  return (
    <Link
      href={quest.href}
      style={{ textDecoration:"none", display:"block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position:"relative", padding:"26px 22px 22px",
        background: quest.accent
          ? "linear-gradient(135deg, rgba(201,148,31,0.12) 0%, rgba(201,148,31,0.04) 100%)"
          : "linear-gradient(135deg, rgba(21,28,40,1) 0%, rgba(16,21,31,1) 100%)",
        border: `1px solid ${quest.accent ? "rgba(201,148,31,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius:"var(--radius-xl)",
        boxShadow: hovered
          ? quest.accent ? "0 20px 48px rgba(0,0,0,0.5), 0 0 32px rgba(201,148,31,0.18)" : "0 20px 48px rgba(0,0,0,0.5)"
          : quest.accent ? "0 8px 24px rgba(0,0,0,0.3), 0 0 20px rgba(201,148,31,0.1)"   : "0 4px 16px rgba(0,0,0,0.25)",
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        transition:"all 0.22s cubic-bezier(0.16,1,0.3,1)",
        cursor:"pointer", overflow:"hidden",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:"0.6rem", fontWeight:700, color: quest.accent ? "var(--accent)" : "var(--text-subtle)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            {quest.type}
          </span>
          <div style={{ display:"flex", gap:3 }}>
            {diffStars.map((filled, i) => (
              <span key={i} style={{ fontSize:"0.7rem", color: filled ? "var(--accent)" : "var(--surface-3)" }}>★</span>
            ))}
          </div>
        </div>

        <h3 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.95rem", fontWeight:700, color: quest.accent ? "var(--accent-light)" : "var(--text)", lineHeight:1.2, marginBottom:12 }}>
          {quest.title}
        </h3>

        <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", lineHeight:1.65, marginBottom:18 }}>
          {quest.desc}
        </p>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:14, borderTop:`1px solid ${quest.accent ? "rgba(201,148,31,0.2)" : "var(--border)"}` }}>
          <span style={{ fontSize:"0.68rem", color:"var(--text-subtle)" }}>{quest.reward}</span>
          <span style={{ fontSize:"0.78rem", fontWeight:700, color: quest.accent ? "var(--accent-light)" : "var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
            Aceitar
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip() {
  const stats = [
    { value:"12", label:"Classes D&D 5e"   },
    { value:"9",  label:"Raças disponíveis" },
    { value:"∞",  label:"Personagens"       },
    { value:"0",  label:"Reais por mês"     },
  ];
  return (
    <div style={{ borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", background:"var(--surface)", padding:"32px 28px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"2rem", fontWeight:700, color:"var(--accent-light)", lineHeight:1 }}>{s.value}</p>
            <p style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginTop:6 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" style={{ padding:"100px 28px" }}>
      <div style={{ maxWidth:1060, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <p className="section-label" style={{ marginBottom:12 }}>Recursos</p>
          <h2 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:700, color:"var(--text)" }}>
            Tudo que um aventureiro precisa
          </h2>
          <p style={{ fontSize:"0.95rem", color:"var(--text-muted)", marginTop:12, maxWidth:440, margin:"12px auto 0" }}>
            Desenvolvido do zero para jogadores reais, com as regras que importam.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20 }}>
          {FEATURES.map((f) => (
            <div key={f.title}
              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:"28px 24px", display:"flex", flexDirection:"column", gap:12, transition:"border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={(e) => { const el=e.currentTarget; el.style.borderColor="var(--border-accent)"; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 16px 40px rgba(0,0,0,0.3)"; }}
              onMouseLeave={(e) => { const el=e.currentTarget; el.style.borderColor="var(--border)"; el.style.transform="translateY(0)"; el.style.boxShadow="none"; }}>
              <h3 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.92rem", fontWeight:700, color:"var(--text)" }}>{f.title}</h3>
              <p style={{ fontSize:"0.84rem", color:"var(--text-muted)", lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Systems ───────────────────────────────────────────────────────────────────

function SystemsSection() {
  const systems = [
    { name:"D&D 5e",          status:"Disponível", statusColor:"#4ade80"             },
    { name:"Call of Cthulhu", status:"Em breve",   statusColor:"var(--accent-light)" },
    { name:"Tormenta 20",     status:"Em breve",   statusColor:"var(--accent-light)" },
    { name:"Pathfinder 2e",   status:"Planejado",  statusColor:"var(--text-subtle)"  },
  ];
  return (
    <section id="systems" style={{ padding:"80px 28px", background:"var(--bg-alt)" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p className="section-label" style={{ marginBottom:12 }}>Sistemas</p>
          <h2 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"clamp(1.5rem,2.8vw,2.2rem)", fontWeight:700, color:"var(--text)" }}>Multi-sistema</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:16 }}>
          {systems.map((s) => (
            <div key={s.name} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:"24px 20px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <p style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.85rem", fontWeight:700, color:"var(--text)" }}>{s.name}</p>
              <span style={{ fontSize:"0.64rem", fontWeight:700, color:s.statusColor, padding:"2px 10px", borderRadius:"var(--radius-full)", background:`${s.statusColor}15`, border:`1px solid ${s.statusColor}33` }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section style={{ padding:"100px 28px" }}>
      <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
        <p className="section-label">Comece agora</p>
        <h2 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:700, color:"var(--text)", lineHeight:1.15 }}>
          Sua próxima aventura<br />começa aqui.
        </h2>
        <p style={{ fontSize:"0.95rem", color:"var(--text-muted)", lineHeight:1.7, maxWidth:420 }}>
          Crie sua primeira ficha em minutos, totalmente grátis.
        </p>
        <GoldBtn href="/register" large>Criar conta gratuita</GoldBtn>
        <p style={{ fontSize:"0.74rem", color:"var(--text-subtle)" }}>
          Já tem conta?{" "}<Link href="/login" style={{ color:"var(--accent-light)", textDecoration:"none" }}>Entrar</Link>
        </p>
      </div>
    </section>
  );
}

// ── Top Navbar ────────────────────────────────────────────────────────────────

function TopNav({ isAuthed, userName }: { isAuthed: boolean; userName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, transition:"background 0.3s, backdrop-filter 0.3s, border-color 0.3s", background:scrolled?"rgba(7,9,15,0.9)":"transparent", backdropFilter:scrolled?"blur(20px)":"none", WebkitBackdropFilter:scrolled?"blur(20px)":"none", borderBottom:`1px solid ${scrolled?"var(--border)":"transparent"}` }}>
      <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 28px", height:66, display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
          <div style={{ width:34, height:34, background:"var(--accent-dim)", border:"1px solid var(--border-accent)", borderRadius:"var(--radius)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <span style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.92rem", fontWeight:700, color:"var(--text)", letterSpacing:"0.06em" }}>RPG Lab</span>
        </Link>

        {!isAuthed && (
          <nav style={{ display:"flex", gap:2, flex:1, justifyContent:"center" }}>
            {[["Recursos","#features"],["Sistemas","#systems"]].map(([label, href]) => (
              <a key={label} href={href} style={{ padding:"6px 15px", fontSize:"0.865rem", color:"var(--text-muted)", textDecoration:"none", borderRadius:"var(--radius)", transition:"color 0.15s, background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color="var(--text)"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="transparent"; }}>
                {label}
              </a>
            ))}
          </nav>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {isAuthed ? (
            <>
              <Link href="/dashboard"
                style={{ padding:"7px 18px", fontSize:"0.865rem", fontWeight:600, color:"#06090f", background:"linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)", textDecoration:"none", borderRadius:"var(--radius)", boxShadow:"0 0 18px var(--accent-glow)", transition:"filter 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.filter="brightness(1.1)"; el.style.transform="translateY(-1px)"; }}
                onMouseLeave={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.filter=""; el.style.transform=""; }}>
                Laboratório
              </Link>

              <div ref={ref} style={{ position:"relative" }}>
                <button onClick={() => setMenuOpen((v) => !v)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px 5px 6px", background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", borderRadius:"var(--radius-full)", cursor:"pointer" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.78rem", fontWeight:700, color:"#06090f" }}>{initial}</div>
                  <span style={{ fontSize:"0.86rem", fontWeight:600, color:"var(--text)" }}>{userName.split(" ")[0]}</span>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color:"var(--text-muted)", transform:menuOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {menuOpen && (
                  <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, minWidth:190, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", boxShadow:"0 16px 40px rgba(0,0,0,0.5)", overflow:"hidden", zIndex:200 }}>
                    <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid var(--border)" }}>
                      <p style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginBottom:2 }}>Aventureiro</p>
                      <p style={{ fontSize:"0.86rem", fontWeight:700, color:"var(--text)" }}>{userName}</p>
                    </div>
                    {[{ href:"/dashboard", label:"Dashboard" },{ href:"/dashboard/dnd/jogador", label:"Meus Personagens" }].map(({ href, label }) => (
                      <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                        style={{ display:"block", padding:"10px 14px", fontSize:"0.86rem", color:"var(--text-muted)", textDecoration:"none", borderBottom:"1px solid var(--border)", transition:"color 0.15s, background 0.15s" }}
                        onMouseEnter={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.color="var(--text)"; el.style.background="rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.color="var(--text-muted)"; el.style.background="transparent"; }}>
                        {label}
                      </Link>
                    ))}
                    <button onClick={() => signOut({ callbackUrl:"/" })}
                      style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", textAlign:"left", fontSize:"0.86rem", color:"#f87171", cursor:"pointer", transition:"background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background="rgba(239,68,68,0.08)"}
                      onMouseLeave={(e) => e.currentTarget.style.background="transparent"}>
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login"
                style={{ padding:"7px 16px", fontSize:"0.865rem", fontWeight:500, color:"var(--text-muted)", textDecoration:"none", borderRadius:"var(--radius)", transition:"color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color="var(--text)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color="var(--text-muted)"}>
                Entrar
              </Link>
              <Link href="/register"
                style={{ padding:"7px 20px", fontSize:"0.865rem", fontWeight:600, color:"#06090f", background:"linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)", textDecoration:"none", borderRadius:"var(--radius)", boxShadow:"0 0 18px var(--accent-glow)", transition:"filter 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.filter="brightness(1.1)"; el.style.transform="translateY(-1px)"; }}
                onMouseLeave={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.filter=""; el.style.transform=""; }}>
                Começar grátis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function SiteFooter({ isAuthed }: { isAuthed: boolean }) {
  return (
    <footer style={{ borderTop:"1px solid var(--border)", padding:"36px 28px" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <span style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"0.82rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.06em" }}>RPG Lab</span>
        <p style={{ fontSize:"0.74rem", color:"var(--text-subtle)" }}>Laboratório de fichas de RPG · D&amp;D 5e · {new Date().getFullYear()}</p>
        {!isAuthed && (
          <div style={{ display:"flex", gap:20 }}>
            <Link href="/login"    style={{ fontSize:"0.76rem", color:"var(--text-subtle)", textDecoration:"none" }}>Entrar</Link>
            <Link href="/register" style={{ fontSize:"0.76rem", color:"var(--text-subtle)", textDecoration:"none" }}>Cadastrar</Link>
          </div>
        )}
      </div>
    </footer>
  );
}

// ── Shared buttons ────────────────────────────────────────────────────────────

function GoldBtn({ href, children, large }: { href: string; children: React.ReactNode; large?: boolean }) {
  return (
    <Link href={href} className="pulse-glow"
      style={{ padding:large?"14px 36px":"12px 28px", fontSize:large?"1rem":"0.925rem", fontWeight:700, color:"#06090f", background:"linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)", textDecoration:"none", borderRadius:"var(--radius)", boxShadow:"0 0 28px var(--accent-glow), 0 4px 14px rgba(0,0,0,0.35)", transition:"filter 0.2s, transform 0.2s", display:"inline-block" }}
      onMouseEnter={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.filter="brightness(1.12)"; el.style.transform="translateY(-2px)"; }}
      onMouseLeave={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.filter=""; el.style.transform=""; }}>
      {children}
    </Link>
  );
}

function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      style={{ padding:"12px 26px", fontSize:"0.925rem", fontWeight:500, color:"var(--text-muted)", border:"1px solid var(--border)", background:"rgba(255,255,255,0.025)", textDecoration:"none", borderRadius:"var(--radius)", transition:"color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s", display:"inline-block" }}
      onMouseEnter={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.color="var(--text)"; el.style.borderColor="var(--border-hover)"; el.style.background="rgba(255,255,255,0.06)"; el.style.transform="translateY(-2px)"; }}
      onMouseLeave={(e) => { const el=e.currentTarget as HTMLAnchorElement; el.style.color="var(--text-muted)"; el.style.borderColor="var(--border)"; el.style.background="rgba(255,255,255,0.025)"; el.style.transform=""; }}>
      {children}
    </a>
  );
}
