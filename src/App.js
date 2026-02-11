import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Brain,
  AlertTriangle,
  Clock,
  RefreshCw,
  Activity,
  Eye,
  Zap,
  VolumeX,
  Wind,
  CheckCircle,
  Syringe,
  AlertOctagon,
  FileText,
  Monitor,
  Bell,
  Mail,
  Coffee,
  Users,
  Target,
  Heart,
  Lock,
  MessageCircle,
  HelpCircle,
  Video,
} from "lucide-react";

// --- CSS GLOBAL ---
const styles = `
  body, html { overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; background-color: #f0f4f8; }

  /* TREMOR */
  @keyframes shake {
    0% { transform: translate(1px, 1px); } 25% { transform: translate(-2px, 2px); }
    50% { transform: translate(2px, -2px); } 75% { transform: translate(-2px, -2px); }
  }
  .shake-element { animation: shake 0.08s infinite; }

  /* FADIGA PESADA */
  @keyframes blink-heavy {
    0%, 10% { height: 0%; opacity: 0; } 15%, 35% { height: 95%; opacity: 1; }
    40% { height: 20%; opacity: 0.5; } 50%, 65% { height: 100%; opacity: 1; }
    70% { height: 0%; opacity: 0; } 85% { height: 70%; opacity: 0.9; } 100% { height: 0%; opacity: 0; }
  }
  .eyelid-top { position: fixed; top: 0; left: 0; width: 100%; background: black; z-index: 50; animation: blink-heavy 4.5s infinite linear; }
  .eyelid-bottom { position: fixed; bottom: 0; left: 0; width: 100%; background: black; z-index: 50; animation: blink-heavy 4.5s infinite linear; }
  
  /* DIPLOPIA (VISÃO DUPLA - CAMADA FANTASMA) */
  .diplopia-layer { 
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
    opacity: 0.5; transform: translate(6px, 6px); pointer-events: none; 
    filter: blur(0.8px); color: rgba(0,0,200,0.5); z-index: 20;
  }

  /* AURA ENXAQUECA (GIGANTE) */
  @keyframes aura-spin { 0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); } 50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.5); } 100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); } }
  .migraine-aura {
    position: absolute; width: 500px; height: 500px; 
    background: repeating-conic-gradient(rgba(255,255,255,1) 0 15deg, rgba(0,0,0,0.5) 15deg 30deg);
    filter: blur(2px) contrast(300%); border-radius: 50%; 
    animation: aura-spin 8s infinite linear; pointer-events: none; z-index: 45;
    mix-blend-mode: exclusion;
    left: 50%; top: 45%; 
  }

  /* FLACON / SCREEN REF */
  .ref-box {
    border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px; margin-bottom: 16px; border-radius: 8px; text-align: center; position: relative; overflow: hidden;
  }
  .ref-label { font-family: monospace; font-weight: bold; letter-spacing: 1px; color: #334155; }
`;

// --- BANCO DE NÍVEIS REFINADO ---
const LEVELS = [
  // VISÃO
  {
    id: 1,
    type: "blur",
    title: "Cataracte (Vision Floue)",
    question: "Validez le N° de Lot sur le flacon.",
    desc: "Maintenez votre doigt appuyé sur le flacon pour voir le lot.",
    hasReference: true,
    refIcon: <Syringe />,
    refText: "LOT: AB-9920-X",
    correct: 2,
    options: ["AB-8820-X", "AB-9920-Y", "AB-9920-X", "AB-6620-X"],
  },
  {
    id: 2,
    type: "photophobia",
    title: "Photophobie",
    question: "Lisez l'écran de contrôle.",
    desc: "Lumière intense. Contraste réduit.",
    hasReference: true,
    refIcon: <Activity />,
    refText: "TEMP: 24°C",
    correct: 1,
    options: ["21°C", "24°C", "28°C", "ERR"],
  },
  {
    id: 3,
    type: "tunnel",
    title: "Glaucome (Tunnel)",
    question: 'Trouvez le bouton "ARRÊT D\'URGENCE".',
    desc: "Vision périphérique perdue.",
    correct: 3,
    options: ["MENU", "PAUSE", "START", "ARRÊT URGENCE"],
  },
  {
    id: 4,
    type: "diplopia",
    title: "Diplopie (Vision Double)",
    question: 'Sélectionnez "CONFORME".',
    desc: "Tout est vu en double.",
    correct: 0,
    options: ["CONFORME", "NON-CONFORME", "REBUT", "RETEST"],
  },

  // COGNITIVO & SENSORIAL
  {
    id: 5,
    type: "dyslexia",
    title: "Dyslexie",
    question: "Quelle est la procédure correcte ?",
    desc: "Les lettres flottent.",
    correct: 1,
    options: [
      "Lvaer les manls",
      "Laver les mains",
      "Valer les mians",
      "Lver las mian",
    ],
  },
  {
    id: 6,
    type: "discalculia",
    title: "Dyscalculie",
    question: "Production: 10 boîtes x 5 ampoules = ?",
    desc: "Les chiffres n'ont pas de sens.",
    correct: 2,
    options: ["15 ampoules", "105 ampoules", "50 ampoules", "500 ampoules"],
  },
  {
    id: 7,
    type: "confusion",
    title: "Burnout (Rapide)",
    question: 'Appuyez sur "START".',
    desc: "Les boutons bougent vite !",
    isShuffle: true,
    correct: 0,
    options: ["START", "STOP", "RESET", "PAUSE"],
  },
  {
    id: 8,
    type: "memory",
    title: "Perte de Mémoire",
    question: "Entrez le code qui vient de flasher.",
    desc: "Mémoire à court terme affectée.",
    isMemory: true,
    memoryCode: "4821",
    correct: 1,
    options: ["1284", "4821", "8412", "4218"],
  },
  {
    id: 9,
    type: "tinnitus",
    title: "Acouphènes",
    question: 'Complétez l\'ordre vocal: "Ouvrir la ___"',
    desc: "Un sifflement constant.",
    correct: 0,
    options: ["Vanne", "Canne", "Banane", "Panne"],
  },

  // CORES & AURA
  {
    id: 10,
    type: "daltonism",
    title: "Daltonisme (Rouge/Vert)",
    question: "Le voyant est ROUGE (Alerte). Cliquez dessus.",
    desc: "Confusion couleurs sécurité.",
    isColor: true,
    correct: 0,
    options: [
      { text: "ALERTE", c: "#968936" },
      { text: "OK", c: "#8F8434" },
      { text: "INFO", c: "#A0A0A0" },
      { text: "STANDBY", c: "#666666" },
    ],
  },
  {
    id: 11,
    type: "tritanopia",
    title: "Tritanopie (Bleu/Jaune)",
    question: "Suivre la ligne JAUNE (Gaz).",
    desc: "Le jaune paraît rose/gris.",
    isColor: true,
    correct: 1,
    options: [
      { text: "EAU (Bleu)", c: "#3B97DE" },
      { text: "GAZ (Jaune)", c: "#FFD1DC" },
      { text: "AIR (Gris)", c: "#CCCCCC" },
      { text: "VAPEUR (Rouge)", c: "#E6553F" },
    ],
  },
  {
    id: 12,
    type: "aura",
    title: "Aura Migraineuse",
    question: "Lisez le texte caché par l'aura.",
    desc: "Flash visuel central géant.",
    hasReference: true,
    refIcon: <Eye />,
    refText: "CODE: B-12",
    correct: 0,
    options: ["CODE: B-12", "CODE: D-12", "CODE: 8-12", "CODE: R-12"],
  },

  // MOTOR & PSIQUIÁTRICO
  {
    id: 13,
    type: "tremor",
    title: "Parkinson (Tremblements)",
    question: "Validez la signature électronique.",
    desc: "Le bouton fuit sous le doigt.",
    correct: 1,
    options: ["EFFACER", "SIGNER", "RETOUR", "EDITER"],
  },
  {
    id: 14,
    type: "fatigue",
    title: "Narcolepsie",
    question: "SURVEILLANCE: Le niveau de remplissage baisse !",
    desc: "Yeux lourds. Ne ratez pas l'alerte.",
    correct: 0,
    options: ["CORRIGER", "DORMIR", "IGNORER", "RÊVER"],
  },
  {
    id: 15,
    type: "anxiety",
    title: "Crise d'Angoisse",
    question: 'OBJECTIF : Cliquez sur le bouton "VALIDER" !',
    desc: "Fermez les pop-ups pour accéder au bouton.",
    isPopup: true,
    correct: 0,
    options: ["OK"],
  },
  {
    id: 16,
    type: "adhd",
    title: "TDAH (Extrême)",
    question: 'Concentrez-vous sur le bouton "PRODUCTION".',
    desc: "Distractions visuelles intenses.",
    correct: 2,
    options: ["EMAIL", "NOTIFICATION", "PRODUCTION", "PAUSE CAFÉ"],
  },
];

// --- COMPONENTES AUXILIARES ---
const Scramble = ({ text }) => (
  <span className="inline-block relative">
    {text.split("").map((c, i) => (
      <span
        key={i}
        style={{
          animation: `float ${0.2 + Math.random()}s infinite alternate`,
          display: "inline-block",
          transform: `rotate(${Math.random() * 4 - 2}deg)`,
        }}
      >
        {c}
      </span>
    ))}
    <style>{`@keyframes float { 0% {transform:translateY(0)} 100% {transform:translateY(-1px) translateX(0.5px)} }`}</style>
  </span>
);

export default function App() {
  const [gameState, setGameState] = useState("landing");
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [touchPos, setTouchPos] = useState({ x: -100, y: -100 });

  // States Dinâmicos
  const [popups, setPopups] = useState([]);
  const [tremorOffset, setTremorOffset] = useState({ x: 0, y: 0 });
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [showMemory, setShowMemory] = useState(false);
  const [adhdItems, setAdhdItems] = useState([]);

  // Timer Global
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((p) => p - 1), 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0) setGameState("finished");
  }, [timeLeft, gameState]);

  // Gerenciamento de Efeitos por Nível
  useEffect(() => {
    const lvl = LEVELS[levelIdx];
    if (gameState !== "playing" || !lvl) return;

    // Reset States
    setPopups([]);
    setTremorOffset({ x: 0, y: 0 });
    setShuffledOpts([]);
    setShowMemory(false);
    setAdhdItems([]);

    let interval;
    if (lvl.type === "anxiety") {
      interval = setInterval(
        () =>
          setPopups((p) => {
            if (p.length > 20) return p;
            return [
              ...p,
              {
                id: Date.now(),
                x: Math.random() * 80,
                y: Math.random() * 80,
                type: Math.floor(Math.random() * 3),
              },
            ];
          }),
        700
      );
    } else if (lvl.isShuffle) {
      setShuffledOpts(lvl.options.map((t, i) => ({ t, i })));
      interval = setInterval(
        () => setShuffledOpts((p) => [...p].sort(() => Math.random() - 0.5)),
        900
      );
    } else if (lvl.isMemory) {
      setShowMemory(true);
      setTimeout(() => setShowMemory(false), 2500);
    } else if (lvl.type === "adhd") {
      interval = setInterval(
        () =>
          setAdhdItems((d) => {
            const next = [
              ...d,
              {
                id: Date.now(),
                x: Math.random() * 90,
                y: Math.random() * 90,
                icon: Math.floor(Math.random() * 6),
                scale: 0.8 + Math.random(),
                rot: Math.random() * 360,
              },
            ];
            return next.slice(-20);
          }),
        150
      );
    }
    return () => clearInterval(interval);
  }, [levelIdx, gameState]);

  const handleTouch = (e) => {
    const t = e.touches ? e.touches[0] : e;
    setTouchPos({ x: t.clientX, y: t.clientY });
  };
  const handleAnswer = (idx) => processAnswer(idx);
  const processAnswer = (idx) => {
    const lvl = LEVELS[levelIdx];
    if (idx === lvl.correct) setScore((s) => s + 1);
    if (levelIdx < LEVELS.length - 1) setLevelIdx((l) => l + 1);
    else setGameState("finished");
  };
  const handleTremorAction = (e) => {
    if (LEVELS[levelIdx].type === "tremor" && Math.random() > 0.3) {
      if (e.cancelable) e.preventDefault();
      setTremorOffset({
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 150,
      });
    }
  };

  // 1. TELA DE LANDING
  const renderLanding = () => (
    <div className="h-screen w-full bg-[#f8fafc] overflow-y-auto p-6 flex flex-col items-center">
      <style>{styles}</style>
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-bold text-[#001965] mb-2 flex items-center justify-center">
          <Activity className="mr-2 text-[#E6553F]" /> L'INVISIBLE
        </h1>
        <p className="text-[#3B97DE] font-semibold tracking-wider text-sm uppercase">
          Campagne de Sensibilisation
        </p>
      </div>
      <div className="w-full max-w-lg grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#001965] text-white p-4 rounded-xl text-center shadow-lg">
          <div className="text-4xl font-bold mb-1 text-[#E6553F]">18%</div>
          <div className="text-xs text-slate-300 leading-tight">
            des Français sont en situation de handicap
          </div>
        </div>
        <div className="bg-white text-[#001965] p-4 rounded-xl text-center shadow-lg border border-slate-200">
          <div className="text-4xl font-bold mb-1 text-[#3B97DE]">80%</div>
          <div className="text-xs text-slate-500 leading-tight">
            sont des handicaps invisibles
          </div>
        </div>
      </div>
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-md border border-slate-100 mb-8">
        <h3 className="text-[#001965] font-bold mb-4 flex items-center">
          <AlertTriangle size={18} className="mr-2 text-[#E6553F]" /> La Réalité
          du Site
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <Lock size={20} className="text-red-600" />
            </div>
            <div>
              <span className="font-bold text-[#001965]">75%</span>
              <p className="text-xs text-slate-500">
                Se sentent peu ou pas informés.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <MessageCircle size={20} className="text-orange-600" />
            </div>
            <div>
              <span className="font-bold text-[#001965]">57%</span>
              <p className="text-xs text-slate-500">
                Disent que c'est un sujet tabou.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <Heart size={20} className="text-yellow-600" />
            </div>
            <div>
              <span className="font-bold text-[#001965]">43%</span>
              <p className="text-xs text-slate-500">
                Ressentent de la stigmatisation.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-lg bg-[#3B97DE]/10 p-6 rounded-2xl border border-[#3B97DE]/30 mb-10 text-center">
        <div className="flex justify-center mb-2">
          <Target className="text-[#001965]" />
        </div>
        <h3 className="text-[#001965] font-bold text-lg mb-2">
          Notre Objectif
        </h3>
        <p className="text-sm text-[#001965]/80 mb-4">
          Aujourd'hui, <strong>3%</strong> du site déclare un handicap.
          <br />
          Notre but est d'atteindre <strong>6%</strong>.
        </p>
        <p className="text-xs text-slate-500 italic">
          "Ce jeu a pour but de sensibiliser à la réalité de vos collègues et
          d'adapter notre environnement pour être plus inclusifs."
        </p>
      </div>
      <button
        onClick={() => setGameState("intro")}
        className="w-full max-w-xs bg-[#E6553F] hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-xl transition-all transform hover:scale-105 flex items-center justify-center text-lg mb-8"
      >
        <Play size={24} className="mr-2" fill="currentColor" /> COMPRENDRE LA
        RÉALITÉ
      </button>
    </div>
  );

  // 2. INTRO DO JOGO
  const renderIntro = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-[#001965] text-white p-6 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #3B97DE 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>
      <Activity size={80} className="text-[#E6553F] mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold mb-2">PRÊT ?</h1>
      <p className="text-sm text-slate-300 max-w-xs mb-10">
        Vous allez vivre 5 minutes de production avec les barrières invisibles
        que certains affrontent chaque jour.
      </p>
      <button
        onClick={() => setGameState("playing")}
        className="w-full max-w-xs bg-[#E6553F] hover:bg-red-500 text-white py-5 rounded-full font-bold text-xl shadow-xl transform transition hover:scale-105 flex items-center justify-center"
      >
        <Play className="mr-3" fill="currentColor" /> COMMENCER
      </button>
    </div>
  );

  // 3. JOGO (RENDER)
  const renderGame = () => {
    const lvl = LEVELS[levelIdx];
    const type = lvl.type;
    let bg = "bg-[#f0f4f8]";
    if (type === "photophobia") bg = "bg-white";
    if (type === "tunnel") bg = "bg-black";
    if (type === "anxiety") bg = "bg-red-50";

    return (
      <div
        className={`w-full h-screen flex flex-col ${bg} overflow-hidden relative`}
        onTouchMove={handleTouch}
        onMouseMove={handleTouch}
        onTouchStart={handleTouch}
      >
        <style>{styles}</style>
        <div
          className={`flex justify-between p-4 z-50 transition-colors duration-300 ${
            type === "photophobia"
              ? "text-gray-400"
              : "text-[#001965] bg-white/60 backdrop-blur-md shadow-sm"
          }`}
        >
          <div className="font-bold flex items-center font-mono text-lg">
            <Clock size={20} className="mr-2" /> {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
          <div className="font-bold text-sm bg-black/5 px-2 py-1 rounded">
            NIV {levelIdx + 1}/{LEVELS.length}
          </div>
        </div>
        {type === "tunnel" && (
          <div
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              background: `radial-gradient(circle 90px at ${touchPos.x}px ${
                touchPos.y - 60
              }px, transparent 0%, black 100%)`,
            }}
          />
        )}
        {type === "photophobia" && (
          <div
            className="absolute inset-0 pointer-events-none z-40 mix-blend-lighten"
            style={{
              background: `radial-gradient(circle 180px at ${touchPos.x}px ${touchPos.y}px, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 100%)`,
            }}
          />
        )}
        {type === "fatigue" && (
          <>
            <div className="eyelid-top" />
            <div className="eyelid-bottom" />
          </>
        )}
        {type === "aura" && <div className="migraine-aura" />}
        {type === "adhd" &&
          adhdItems.map((d) => (
            <div
              key={d.id}
              className="absolute z-50 animate-bounce pointer-events-none drop-shadow-xl"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                fontSize: `${30 + Math.random() * 40}px`,
                opacity: 0.9,
                transition: "all 0.3s",
                transform: `scale(${d.scale}) rotate(${d.rot}deg)`,
              }}
            >
              {["📩", "⚡", "🔔", "☕", "📞", "⚠️"][d.icon]}
            </div>
          ))}
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div
            className={`w-full max-w-md p-6 rounded-xl shadow-xl transition-all relative
            ${
              type === "photophobia"
                ? "bg-white border border-gray-100 shadow-none"
                : "bg-white"
            }
            ${type === "tremor" ? "shake-element" : ""}
          `}
          >
            {type === "diplopia" && (
              <div className="diplopia-layer p-6 rounded-xl bg-white border border-blue-200">
                <div className="mb-4 pb-2 border-b">
                  <h2 className="font-bold flex items-center text-blue-300">
                    {lvl.title}
                  </h2>
                </div>
                <div className="text-xl font-bold mb-6 text-center text-blue-300">
                  {lvl.question}
                </div>
                <div className="space-y-3">
                  {lvl.options.map((o, i) => (
                    <div
                      key={i}
                      className="w-full p-4 border rounded-lg text-lg text-center text-blue-300 border-blue-200"
                    >
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-4 border-b pb-2 border-slate-100 relative z-30">
              <h2
                className={`font-bold flex items-center ${
                  type === "photophobia" ? "text-[#94a3b8]" : "text-[#E6553F]"
                }`}
              >
                <AlertTriangle size={20} className="mr-2" /> {lvl.title}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {lvl.desc}
              </p>
            </div>
            {lvl.hasReference && (
              <div
                className={`ref-box ${
                  type === "blur"
                    ? "blur-[6px] active:blur-[1px] transition duration-500"
                    : ""
                }`}
              >
                <div className="text-3xl mb-1 text-[#3B97DE] flex justify-center">
                  {lvl.refIcon}
                </div>
                <div
                  className={`ref-label ${
                    type === "photophobia" ? "text-[#cbd5e1]" : "text-[#334155]"
                  }`}
                >
                  {lvl.refText}
                </div>
              </div>
            )}
            {lvl.isMemory && showMemory ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 mb-2">
                  Mémorisez ce code :
                </p>
                <div className="text-5xl font-mono font-bold animate-pulse text-[#001965] tracking-widest">
                  {lvl.memoryCode}
                </div>
              </div>
            ) : (
              <>
                <h3
                  className={`text-xl font-bold mb-6 text-center leading-tight relative
                   ${
                     type === "photophobia"
                       ? "text-[#cbd5e1]"
                       : "text-[#001965]"
                   }
                   ${
                     type === "blur"
                       ? "blur-[6px] active:blur-[1px] transition duration-500"
                       : ""
                   }
                   ${
                     type === "anxiety"
                       ? "z-50 bg-white/95 p-3 rounded shadow-md border border-red-100"
                       : ""
                   } 
                `}
                >
                  {type === "dyslexia" ? (
                    <Scramble text={lvl.question} />
                  ) : (
                    lvl.question
                  )}
                </h3>
                <div className="space-y-3 relative">
                  {(lvl.isShuffle
                    ? shuffledOpts
                    : lvl.options && !lvl.isPopup
                    ? lvl.options
                    : []
                  ).map((opt, idx) => {
                    const realIdx = lvl.isShuffle ? opt.i : idx;
                    const label = lvl.isShuffle ? opt.t : opt.text || opt;
                    const isTremorTarget =
                      type === "tremor" && realIdx === lvl.correct;
                    const style = isTremorTarget
                      ? {
                          transform: `translate(${tremorOffset.x}px, ${tremorOffset.y}px)`,
                          transition: "transform 0.08s",
                        }
                      : {};
                    let bg = opt.c || "#FFF";
                    let txt = type === "photophobia" ? "#cbd5e1" : "#001965";
                    let border = "#e2e8f0";
                    return (
                      <button
                        key={idx}
                        onTouchStart={(e) =>
                          isTremorTarget ? handleTremorAction(e) : null
                        }
                        onClick={() => handleAnswer(realIdx)}
                        className={`w-full p-4 border-2 rounded-lg font-bold text-lg shadow-sm active:scale-95 transition-all flex items-center justify-center`}
                        style={{
                          backgroundColor: bg,
                          color: txt,
                          borderColor: border,
                          ...style,
                        }}
                      >
                        {type === "dyslexia" ? (
                          <Scramble text={label} />
                        ) : (
                          label
                        )}
                      </button>
                    );
                  })}
                  {lvl.isPopup && (
                    <div className="relative h-64 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                          onClick={() => handleAnswer(0)}
                          className="bg-[#3F9C35] text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:bg-green-600 transition"
                        >
                          VALIDER
                        </button>
                      </div>
                      {popups.map((p) => (
                        <div
                          key={p.id}
                          className="absolute bg-white border-2 border-red-500 shadow-xl rounded p-2 flex flex-col items-center text-center animate-bounce z-20"
                          style={{
                            width: 140,
                            top: `${p.y}%`,
                            left: `${p.x}%`,
                          }}
                        >
                          <AlertOctagon
                            size={24}
                            className="text-red-500 mb-1"
                          />
                          <p className="font-bold text-red-600 text-[10px] mb-1 leading-tight">
                            ERREUR FATALE
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPopups((prev) =>
                                prev.filter((x) => x.id !== p.id)
                              );
                            }}
                            className="bg-gray-800 text-white w-full py-1 rounded text-[10px]"
                          >
                            FERMER
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 4. TELA SCORE
  const renderScore = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-[#E9EBED] p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-[#001965]">
        <CheckCircle size={64} className="mx-auto text-[#3F9C35] mb-4" />
        <h2 className="text-3xl font-bold text-[#001965] mb-2">
          SESSION TERMINÉE
        </h2>
        <div className="my-6 py-4 bg-slate-50 rounded-lg">
          <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">
            SCORE FINAL
          </p>
          <p className="text-5xl font-bold text-[#001965]">
            {score}
            <span className="text-2xl text-gray-400">/{LEVELS.length}</span>
          </p>
        </div>
        <p className="text-sm text-slate-500 mb-8 italic">
          "L'inclusion commence par la compréhension."
        </p>
        <button
          onClick={() => setGameState("debrief")}
          className="w-full bg-[#001965] text-white py-4 rounded-xl font-bold flex justify-center items-center shadow-lg active:scale-95 transition"
        >
          ALLER AU DÉBRIEFING <Play size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );

  // 5. TELA DEBRIEFING (ATUALIZADA)
  const renderDebrief = () => (
    <div className="h-screen w-full bg-[#f8fafc] overflow-y-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="bg-[#001965] text-white p-6 rounded-2xl shadow-lg mb-8 text-center">
          <Brain size={48} className="mx-auto text-[#E6553F] mb-4" />
          <h2 className="text-3xl font-bold mb-2">DÉBRIEFING & ACTION</h2>
          <p className="text-sm opacity-80">
            Que pouvons-nous faire maintenant ?
          </p>
        </div>

        {/* Estatística Chave */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-[#3B97DE] mb-8 flex items-start">
          <Users className="text-[#3B97DE] min-w-[32px] mt-1 mr-4" size={32} />
          <div>
            <h3 className="font-bold text-[#001965] text-lg mb-1">
              Le saviez-vous ?
            </h3>
            <p className="text-[#334155]">
              Dans une équipe de <strong>18 personnes</strong>, les statistiques
              indiquent que <strong>3 collègues</strong> vivent une situation de
              handicap (souvent invisible).
            </p>
          </div>
        </div>

        {/* Vídeo Relato */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group cursor-pointer mb-10 border-4 border-white">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-white font-bold text-xl flex items-center">
              <Play className="mr-2 fill-white" /> Témoignage d'un collègue
            </h3>
            <p className="text-gray-300 text-sm">
              Découvrez comment l'adaptation a changé son quotidien.
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Play size={32} className="fill-white text-white" />
            </div>
          </div>
        </div>

        {/* 3 Perguntas de Ação (ATUALIZADAS) */}
        <div className="space-y-4 mb-10">
          <h3 className="text-xl font-bold text-[#001965] flex items-center mb-4">
            <HelpCircle className="mr-2 text-[#E6553F]" /> 3 Questions pour
            inclure :
          </h3>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-start">
              <span className="bg-[#E6553F] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </span>
              <div>
                <p className="text-[#001965] font-bold mb-1">
                  PROCESSUS & ROUTINES
                </p>
                <p className="text-[#334155] text-sm">
                  Quelles routines de production (ex: contrôle visuel, alarmes)
                  sont peu inclusives et comment les adapteriez-vous ?
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-start">
              <span className="bg-[#3B97DE] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </span>
              <div>
                <p className="text-[#001965] font-bold mb-1">
                  ACCUEIL & SÉCURITÉ
                </p>
                <p className="text-[#334155] text-sm">
                  Si un collègue daltonien rejoint l'équipe demain, que
                  changeriez-vous sur la ligne pour garantir sa sécurité ?
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-start">
              <span className="bg-[#3F9C35] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </span>
              <div>
                <p className="text-[#001965] font-bold mb-1">
                  CULTURE D'INCLUSION
                </p>
                <p className="text-[#334155] text-sm">
                  Comment pouvons-nous créer un environnement de production où
                  chacun se sent à l'aise de signaler une difficulté ?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Reiniciar */}
        <button
          onClick={() => {
            setGameState("intro");
            setLevelIdx(0);
            setScore(0);
            setTimeLeft(300);
          }}
          className="w-full bg-[#E9EBED] hover:bg-[#cbd5e1] text-[#001965] font-bold py-4 rounded-xl transition flex items-center justify-center"
        >
          <RefreshCw className="mr-2" size={20} /> Recommencer pour le groupe
          suivant
        </button>
      </div>
    </div>
  );

  // ROUTER
  if (gameState === "landing") return renderLanding();
  if (gameState === "intro") return renderIntro();
  if (gameState === "finished") return renderScore();
  if (gameState === "debrief") return renderDebrief();
  return renderGame();
}
