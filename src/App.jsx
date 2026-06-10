import { useState, useMemo, createContext, useContext } from "react";

const StudyCtx = createContext({ studyMode: false });
const FONT = "Plus Jakarta Sans, sans-serif";

const EXCH = {
  lac_semi:   { prot:8,  lip:4, hc:12 },
  carne_baja: { prot:7,  lip:2, hc:0  },
  carne_mod:  { prot:7,  lip:5, hc:0  },
  carne_alta: { prot:7,  lip:8, hc:0  },
  legum:      { prot:7,  lip:1, hc:15 },
  cereal:     { prot:2,  lip:1, hc:15 },
  verdura:    { prot:2,  lip:0, hc:5  },
  fruta:      { prot:0,  lip:0, hc:15 },
  grasa:      { prot:0,  lip:5, hc:0  },
  acces:      { prot:0,  lip:0, hc:10 },
};

const GROUPS_ES = [
  {key:"lac_semi",   label:"Lacteos semidescremados",   cat:"Lacteos"},
  {key:"carne_baja", label:"Carnes bajas en grasa",     cat:"Carnes"},
  {key:"carne_mod",  label:"Carnes moderadas en grasa", cat:"Carnes"},
  {key:"carne_alta", label:"Carnes altas en grasa",     cat:"Carnes"},
  {key:"legum",      label:"Leguminosas",               cat:"Leguminosas"},
  {key:"cereal",     label:"Cereales",                  cat:"Cereales"},
  {key:"verdura",    label:"Verduras",                  cat:"Verduras"},
  {key:"fruta",      label:"Frutas",                    cat:"Frutas"},
  {key:"grasa",      label:"Grasas",                    cat:"Grasas"},
  {key:"acces",      label:"Accesorios",                cat:"Accesorios"},
];
const GROUPS_EN = [
  {key:"lac_semi",   label:"Semi-skimmed dairy",  cat:"Dairy"},
  {key:"carne_baja", label:"Lean meats",          cat:"Meats"},
  {key:"carne_mod",  label:"Medium-fat meats",    cat:"Meats"},
  {key:"carne_alta", label:"High-fat meats",      cat:"Meats"},
  {key:"legum",      label:"Legumes",             cat:"Legumes"},
  {key:"cereal",     label:"Cereals",             cat:"Cereals"},
  {key:"verdura",    label:"Vegetables",          cat:"Vegetables"},
  {key:"fruta",      label:"Fruits",              cat:"Fruits"},
  {key:"grasa",      label:"Fats",                cat:"Fats"},
  {key:"acces",      label:"Accessories",         cat:"Accessories"},
];

const CAT_COLOR = {
  Lacteos:{bg:"#D4E3FF",tx:"#0C447C"},   Dairy:{bg:"#D4E3FF",tx:"#0C447C"},
  Carnes:{bg:"#FAEEDA",tx:"#633806"},    Meats:{bg:"#FAEEDA",tx:"#633806"},
  Leguminosas:{bg:"#E1F5EE",tx:"#085041"}, Legumes:{bg:"#E1F5EE",tx:"#085041"},
  Cereales:{bg:"#FEF9E7",tx:"#7D3C98"}, Cereals:{bg:"#FEF9E7",tx:"#7D3C98"},
  Verduras:{bg:"#EAF3DE",tx:"#27500A"}, Vegetables:{bg:"#EAF3DE",tx:"#27500A"},
  Frutas:{bg:"#FBEAF0",tx:"#72243E"},   Fruits:{bg:"#FBEAF0",tx:"#72243E"},
  Grasas:{bg:"#FCEBEB",tx:"#A32D2D"},   Fats:{bg:"#FCEBEB",tx:"#A32D2D"},
  Accesorios:{bg:"#F5F7FF",tx:"#3A5BA0"}, Accessories:{bg:"#F5F7FF",tx:"#3A5BA0"},
};

const MEAL_COLOR = {
  D:{bg:"#EFF6FF",tx:"#1E2D4E"},
  A:{bg:"#D4E3FF",tx:"#0C447C"},
  C:{bg:"#FAEEDA",tx:"#633806"},
  M:{bg:"#FBEAF0",tx:"#72243E"},
  M2:{bg:"#E1F5EE",tx:"#085041"},
};

const DEFAULT_EXC = {
  lac_semi:   {total:1, D:1,A:0,C:0,M:0,M2:0},
  carne_baja: {total:3, D:0,A:2,C:1,M:0,M2:0},
  carne_mod:  {total:1, D:0,A:1,C:0,M:0,M2:0},
  carne_alta: {total:0, D:0,A:0,C:0,M:0,M2:0},
  legum:      {total:1, D:0,A:1,C:0,M:0,M2:0},
  cereal:     {total:6, D:2,A:2,C:2,M:0,M2:0},
  verdura:    {total:3, D:0,A:2,C:1,M:0,M2:0},
  fruta:      {total:5, D:1,A:1,C:1,M:2,M2:0},
  grasa:      {total:6, D:2,A:3,C:1,M:0,M2:0},
  acces:      {total:0, D:0,A:0,C:0,M:0,M2:0},
};

const DEFAULT_PATIENT = {
  caseName:"", sex:"F", weightLb:145, heightIn:67, age:28, goal:"mantener",
  condition:"none", protPct:17, lipPct:30, hcPct:53, mealTimes:4,
  protG:67, lipG:53, hcG:210, vet:1582,
};

function adecColor(pct) {
  if (pct >= 90 && pct <= 110) return { bg:"#EFF6FF", tx:"#2563EB" };
  if (pct >= 75) return { bg:"#FAEEDA", tx:"#854F0B" };
  return { bg:"#FCEBEB", tx:"#A32D2D" };
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function NumButton({ value, onChange }) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:3, justifyContent:"center"}}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{width:20, height:20, borderRadius:4, border:"0.5px solid #D4E3FF", background:"#F5F7FF", color:"#2563EB", fontSize:14, fontWeight:600, cursor:"pointer", padding:0, lineHeight:1}}
      >-</button>
      <div style={{width:30, height:26, background:"#EFF6FF", border:"1px solid #2563EB", borderRadius:5, fontWeight:600, fontSize:12, color:"#1E2D4E", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT}}>
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        style={{width:20, height:20, borderRadius:4, border:"0.5px solid #D4E3FF", background:"#F5F7FF", color:"#2563EB", fontSize:14, fontWeight:600, cursor:"pointer", padding:0, lineHeight:1}}
      >+</button>
    </div>
  );
}

function CalcCell({ value, unit, highlight }) {
  return (
    <div style={{
      background: highlight ? "#EFF6FF" : "#FEF9E7",
      border: `0.5px solid ${highlight ? "#93C5FD" : "#e8d89a"}`,
      borderRadius:5, padding:"3px 8px", fontFamily:FONT, fontWeight:500,
      fontSize:12, color: highlight ? "#1E2D4E" : "#7D3C98",
      textAlign:"center", minWidth:36, display:"inline-block",
    }}>
      {value}{unit && <span style={{fontSize:10, marginLeft:2}}>{unit}</span>}
    </div>
  );
}

function KpiCard({ label, value, unit, sub, ok }) {
  return (
    <div style={{background:"#1E2D4E", border:"0.5px solid #2D4270", borderRadius:10, padding:"11px 14px"}}>
      <div style={{fontSize:9, fontWeight:500, color:"#93C5FD", textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:FONT, marginBottom:5}}>{label}</div>
      <div style={{display:"flex", alignItems:"baseline", gap:4}}>
        <span style={{fontSize:20, fontWeight:500, color:"#E2E8F0", fontFamily:FONT}}>{value}</span>
        {unit && <span style={{fontSize:10, color:"#93C5FD", fontFamily:FONT}}>{unit}</span>}
      </div>
      {sub && <div style={{fontSize:10, color: ok ? "#4ade80" : "#93C5FD", marginTop:3, fontFamily:FONT}}>{sub}</div>}
    </div>
  );
}

function NatureCard({ isES, exchanges, totals }) {
  const lacProt   = EXCH.lac_semi.prot   * exchanges.lac_semi.total;
  const cbProt    = EXCH.carne_baja.prot * exchanges.carne_baja.total;
  const cmProt    = EXCH.carne_mod.prot  * (exchanges.carne_mod?.total || 0);
  const caProt    = EXCH.carne_alta.prot * (exchanges.carne_alta?.total || 0);
  const animalPct = totals.prot > 0 ? Math.round((lacProt + cbProt + cmProt + caProt) / totals.prot * 100) : 0;
  const vegFatPct = totals.lip  > 0 ? Math.round((EXCH.grasa.lip * exchanges.grasa.total) / totals.lip * 100) : 0;
  const sugarKcal = EXCH.acces.hc * exchanges.acces.total * 4;
  const sugarPct  = totals.kcal > 0 ? Math.round(sugarKcal / totals.kcal * 100) : 0;

  const stats = [
    { label: isES ? "Proteina animal"   : "Animal protein",  value: animalPct, sub: isES ? "del total proteico" : "of total protein", color:"#2563EB" },
    { label: isES ? "Grasa vegetal"     : "Vegetable fat",   value: vegFatPct, sub: isES ? "del total lipidos"  : "of total lipids",  color:"#3A5BA0" },
    { label: isES ? "Azucares simples"  : "Simple sugars",   value: sugarPct,  sub: isES ? "del VET"            : "of TDEE",          color: sugarPct === 0 ? "#22c55e" : "#A32D2D" },
  ];

  return (
    <div style={{background:"#fff", border:"0.5px solid #D4E3FF", borderRadius:12, padding:"16px 18px"}}>
      <div style={{fontSize:13, fontWeight:500, color:"#1E2D4E", marginBottom:14, fontFamily:FONT}}>
        {isES ? "Naturaleza de los nutrimentos" : "Nutrient origin"}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10}}>
        {stats.map(stat => (
          <div key={stat.label} style={{background:"#F5F7FF", border:"0.5px solid #D4E3FF", borderRadius:10, padding:"13px 14px"}}>
            <div style={{fontSize:9, fontWeight:500, color:"#3A5BA0", textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:FONT, marginBottom:6}}>{stat.label}</div>
            <div style={{fontSize:24, fontWeight:500, color:stat.color, fontFamily:FONT}}>
              {stat.value}<span style={{fontSize:12, color:"#3A5BA0", marginLeft:2}}>%</span>
            </div>
            <div style={{fontSize:10, color:"#3A5BA0", marginTop:3, fontFamily:FONT}}>{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertBox({ level, badge, explain, studyMode }) {
  const isError = level === "error";
  return (
    <div style={{
      padding:"10px 14px", borderRadius:8, display:"flex", alignItems:"flex-start", gap:10,
      background: isError ? "#FCEBEB" : "#FAEEDA",
      border: `0.5px solid ${isError ? "#F09595" : "#EF9F27"}`,
    }}>
      <span style={{fontSize:16, flexShrink:0}}>{isError ? "⚠" : "!"}</span>
      <div>
        <span style={{
          display:"inline-block", fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:20,
          background: isError ? "#FCEBEB" : "#FAEEDA",
          color: isError ? "#A32D2D" : "#854F0B",
          border: `0.5px solid ${isError ? "#F09595" : "#EF9F27"}`,
          fontFamily:FONT,
        }}>{badge}</span>
        {studyMode && explain && (
          <p style={{margin:"5px 0 0", fontSize:11, color: isError ? "#7F1D1D" : "#78350F", fontFamily:FONT, lineHeight:1.6}}>
            {explain}
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [patient]    = useState(() => ({ ...DEFAULT_PATIENT, ...loadFromStorage("nl_patient_v1", {}) }));
  const [studyMode]  = useState(() => loadFromStorage("nl_study_v1", false));
  const [lang, setLang] = useState("ES");
  const [exchanges, setExchanges] = useState(() => {
    const saved = patient.exchanges || loadFromStorage("nl_exc_v1", null);
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT_EXC));
    const migrated = {};
    Object.keys(DEFAULT_EXC).forEach(key => {
      migrated[key] = { M2:0, ...DEFAULT_EXC[key], ...saved[key] };
    });
    return migrated;
  });

  const isES   = lang === "ES";
  const groups = isES ? GROUPS_ES : GROUPS_EN;
  const has5meals = (patient.mealTimes || 4) >= 5;
  const mealKeys  = has5meals ? ["D","A","C","M","M2"] : ["D","A","C","M"];
  const mealLabel = { D: isES?"Desayuno":"Breakfast", A: isES?"Almuerzo":"Lunch", C: isES?"Cena":"Dinner", M: isES?"Merienda":"Snack", M2: isES?"Merienda 2":"Snack 2" };

  function updateExchange(groupKey, field, newVal) {
    setExchanges(prev => {
      const updated = { ...prev[groupKey], [field]: newVal };
      if (field !== "total") {
        updated.total = mealKeys.reduce((sum, mk) => sum + (updated[mk] || 0), 0);
      }
      const next = { ...prev, [groupKey]: updated };
      try { localStorage.setItem("nl_exc_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const totals = useMemo(() => {
    let prot = 0, lip = 0, hc = 0;
    GROUPS_ES.forEach(group => {
      const ev = EXCH[group.key];
      if (!ev) return;
      const qty = (exchanges[group.key]?.total) || 0;
      prot += qty * ev.prot;
      lip  += qty * ev.lip;
      hc   += qty * ev.hc;
    });
    return { prot, lip, hc, kcal: prot*4 + lip*9 + hc*4 };
  }, [exchanges]);

  function getMealKcal(mealKey) {
    let total = 0;
    GROUPS_ES.forEach(group => {
      const ev = EXCH[group.key];
      if (!ev) return;
      const qty = (exchanges[group.key]?.[mealKey]) || 0;
      total += qty * (ev.prot*4 + ev.lip*9 + ev.hc*4);
    });
    return total;
  }

  const meta = {
    prot: patient.protG || 67,
    lip:  patient.lipG  || 53,
    hc:   patient.hcG   || 210,
    kcal: patient.vet   || 1582,
  };
  const adecProt = Math.round(totals.prot / meta.prot * 100);
  const adecLip  = Math.round(totals.lip  / meta.lip  * 100);
  const adecHC   = Math.round(totals.hc   / meta.hc   * 100);
  const vetMin   = patient.sex === "F" ? 1200 : 1500;
  const totalExchanges = Object.values(exchanges).reduce((sum, ex) => sum + ex.total, 0);

  const thStyle = { padding:"7px 12px", fontSize:10, fontWeight:500, color:"#3A5BA0", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"0.5px solid #D4E3FF", fontFamily:FONT };
  const tdCenter = { padding:"8px 12px", textAlign:"center", fontFamily:FONT };

  return (
    <StudyCtx.Provider value={{ studyMode }}>
      <div style={{fontFamily:FONT, background:"#F5F7FF", minHeight:"100vh"}}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>

        {/* Topbar */}
        <div style={{background:"#1E2D4E", height:44, display:"flex", alignItems:"center", padding:"0 20px", gap:12, borderBottom:"0.5px solid #2D4270", position:"sticky", top:0, zIndex:100}}>
          <div style={{width:8, height:8, borderRadius:"50%", background:"#2563EB"}}/>
          <span style={{fontSize:14, fontWeight:600, color:"#E2E8F0", fontFamily:FONT}}>
            nutrionally <span style={{fontWeight:400, color:"#93C5FD", fontSize:12}}>learn</span>
          </span>
          <span style={{fontSize:10, padding:"2px 10px", borderRadius:20, background:"#2563EB22", color:"#93C5FD", border:"0.5px solid #2563EB", fontFamily:FONT}}>
            {isES ? "Plan de intercambios" : "Exchange plan"}
          </span>
          {studyMode && (
            <span style={{fontSize:10, padding:"2px 8px", borderRadius:20, background:"#7C3AED22", color:"#A78BFA", border:"0.5px solid #7C3AED", fontFamily:FONT}}>◎ Study Mode</span>
          )}
          <div style={{marginLeft:"auto", display:"flex", gap:4}}>
            {["ES","EN"].map(lng => (
              <button key={lng} onClick={() => setLang(lng)} style={{padding:"3px 9px", fontSize:11, fontWeight:500, cursor:"pointer", background: lang===lng ? "#2563EB" : "transparent", color: lang===lng ? "#fff" : "#93C5FD", border:"0.5px solid #3A5BA0", borderRadius:4, fontFamily:FONT}}>{lng}</button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{maxWidth:1140, margin:"0 auto", padding:"22px 24px"}}>

          {/* Header */}
          <div style={{marginBottom:16}}>
            <h1 style={{fontSize:22, fontWeight:500, color:"#1E2D4E", margin:"0 0 4px", fontFamily:FONT}}>
              {isES ? "Plan de intercambios" : "Exchange plan"}
            </h1>
            <p style={{fontSize:13, color:"#3A5BA0", margin:0, fontFamily:FONT}}>
              {patient.caseName || "—"} · VET {(patient.vet||1582).toLocaleString()} kcal · {patient.condition==="dm2" ? "DM2" : patient.condition==="obesity" ? (isES?"Obesidad":"Obesity") : (isES?"Sin condicion":"No condition")}
            </p>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 270px", gap:14}}>
            <div style={{display:"flex", flexDirection:"column", gap:12}}>

              {/* Groups table */}
              <div style={{background:"#fff", border:"0.5px solid #D4E3FF", borderRadius:12, overflow:"hidden"}}>
                <div style={{padding:"12px 16px", borderBottom:"0.5px solid #D4E3FF"}}>
                  <span style={{fontSize:13, fontWeight:500, color:"#1E2D4E", fontFamily:FONT}}>{isES ? "Grupos de alimentos" : "Food groups"}</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontFamily:FONT}}>
                    <thead>
                      <tr style={{background:"#F5F7FF"}}>
                        <th style={{...thStyle, textAlign:"left"}}>{isES ? "Grupo" : "Group"}</th>
                        <th style={{...thStyle, textAlign:"center"}}>{isES ? "Interc." : "Exch."}</th>
                        <th style={{...thStyle, textAlign:"center"}}>Prot</th>
                        <th style={{...thStyle, textAlign:"center"}}>{isES ? "Lip" : "Fat"}</th>
                        <th style={{...thStyle, textAlign:"center"}}>HC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(group => {
                        const ev  = EXCH[group.key];
                        const qty = exchanges[group.key].total;
                        const cs  = CAT_COLOR[group.cat] || { bg:"#F5F7FF", tx:"#3A5BA0" };
                        return (
                          <tr key={group.key} style={{borderBottom:"0.5px solid #F0F4FF"}}>
                            <td style={{padding:"8px 12px"}}>
                              <span style={{display:"inline-block", fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:20, background:cs.bg, color:cs.tx}}>
                                {group.label}
                              </span>
                            </td>
                            <td style={tdCenter}><NumButton value={qty} onChange={val => updateExchange(group.key, "total", val)}/></td>
                            <td style={tdCenter}><CalcCell value={qty * ev.prot}/></td>
                            <td style={tdCenter}><CalcCell value={qty * ev.lip}/></td>
                            <td style={tdCenter}><CalcCell value={qty * ev.hc}/></td>
                          </tr>
                        );
                      })}
                      <tr style={{background:"#F5F7FF", borderTop:"0.5px solid #D4E3FF"}}>
                        <td style={{padding:"9px 12px", fontWeight:600, color:"#1E2D4E", fontSize:13}}>Total</td>
                        <td style={{...tdCenter, fontWeight:600, color:"#1E2D4E"}}>{totalExchanges}</td>
                        <td style={tdCenter}><CalcCell value={totals.prot} highlight/></td>
                        <td style={tdCenter}><CalcCell value={totals.lip}  highlight/></td>
                        <td style={tdCenter}><CalcCell value={totals.hc}   highlight/></td>
                      </tr>
                      <tr style={{background:"#EFF6FF", borderTop:"0.5px solid #D4E3FF"}}>
                        <td style={{padding:"7px 12px", fontSize:11, color:"#2563EB", fontWeight:500}}>{isES ? "Meta" : "Goal"}</td>
                        <td/>
                        {[meta.prot, meta.lip, meta.hc].map((val, idx) => (
                          <td key={idx} style={{...tdCenter, fontSize:12, fontWeight:600, color:"#2563EB"}}>{Math.round(val)}</td>
                        ))}
                      </tr>
                      <tr style={{borderTop:"0.5px solid #D4E3FF"}}>
                        <td style={{padding:"7px 12px", fontSize:11, color:"#3A5BA0"}}>% {isES ? "Adec." : "Adec."}</td>
                        <td/>
                        {[adecProt, adecLip, adecHC].map((val, idx) => {
                          const col = adecColor(val);
                          return (
                            <td key={idx} style={tdCenter}>
                              <span style={{display:"inline-block", padding:"2px 7px", borderRadius:20, fontSize:11, fontWeight:600, background:col.bg, color:col.tx}}>
                                {val}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Meals table */}
              <div style={{background:"#fff", border:"0.5px solid #D4E3FF", borderRadius:12, overflow:"hidden"}}>
                <div style={{padding:"12px 16px", borderBottom:"0.5px solid #D4E3FF", display:"flex", alignItems:"center", gap:8}}>
                  <span style={{fontSize:13, fontWeight:500, color:"#1E2D4E", fontFamily:FONT}}>{isES ? "Distribucion por tiempo de comida" : "Meal time distribution"}</span>
                  {has5meals && <span style={{fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:"#EFF6FF", color:"#2563EB", border:"0.5px solid #2563EB", fontFamily:FONT}}>DM2 · 5 tiempos</span>}
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontFamily:FONT}}>
                    <thead>
                      <tr style={{background:"#F5F7FF"}}>
                        <th style={{...thStyle, textAlign:"left"}}>{isES ? "Grupo" : "Group"}</th>
                        {mealKeys.map(mk => {
                          const mc = MEAL_COLOR[mk];
                          return (
                            <th key={mk} style={{...thStyle, textAlign:"center"}}>
                              <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:4}}>
                                <div style={{width:20, height:20, borderRadius:"50%", background:mc.bg, color:mc.tx, fontSize:9, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center"}}>{mk}</div>
                                <span style={{fontSize:10, color:"#3A5BA0"}}>{mealLabel[mk]}</span>
                              </div>
                            </th>
                          );
                        })}
                        <th style={{...thStyle, textAlign:"center"}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(group => {
                        const row = exchanges[group.key];
                        const cs  = CAT_COLOR[group.cat] || { bg:"#F5F7FF", tx:"#3A5BA0" };
                        const mealSum = mealKeys.reduce((sum, mk) => sum + (row[mk] || 0), 0);
                        return (
                          <tr key={group.key} style={{borderBottom:"0.5px solid #F0F4FF"}}>
                            <td style={{padding:"7px 12px"}}>
                              <span style={{display:"inline-block", fontSize:11, fontWeight:500, padding:"2px 8px", borderRadius:20, background:cs.bg, color:cs.tx}}>
                                {group.label}
                              </span>
                            </td>
                            {mealKeys.map(mk => (
                              <td key={mk} style={tdCenter}>
                                <NumButton value={row[mk] || 0} onChange={val => updateExchange(group.key, mk, val)}/>
                              </td>
                            ))}
                            <td style={tdCenter}><CalcCell value={mealSum} highlight={mealSum === row.total}/></td>
                          </tr>
                        );
                      })}
                      <tr style={{background:"#F5F7FF", borderTop:"0.5px solid #D4E3FF"}}>
                        <td style={{padding:"8px 12px", fontWeight:600, color:"#1E2D4E", fontSize:11}}>~kcal</td>
                        {mealKeys.map(mk => (
                          <td key={mk} style={{...tdCenter, fontSize:12, fontWeight:500, color:"#1E2D4E"}}>{getMealKcal(mk)}</td>
                        ))}
                        <td style={{...tdCenter, fontSize:12, fontWeight:600, color:"#1E2D4E"}}>{totals.kcal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerts */}
              {adecProt < 75 && (
                <AlertBox level="error" badge={isES ? "Proteinas < 75%" : "Proteins < 75%"} studyMode={studyMode}
                  explain={isES ? "Adecuacion proteica baja. Riesgo de catabolismo muscular. Revisar carnes y lacteos." : "Low protein adequacy. Risk of muscle catabolism. Review meats and dairy."}/>
              )}
              {totals.kcal < vetMin && (
                <AlertBox level="error" badge={isES ? `VET < ${vetMin} kcal` : `TDEE < ${vetMin} kcal`} studyMode={studyMode}
                  explain={isES ? `VET (${totals.kcal} kcal) por debajo del minimo (${vetMin} kcal).` : `TDEE (${totals.kcal} kcal) below minimum (${vetMin} kcal).`}/>
              )}
              {patient.condition === "dm2" && adecHC > 110 && (
                <AlertBox level="warning" badge={isES ? "HC > 110% en DM2" : "CHO > 110% in T2D"} studyMode={studyMode}
                  explain={isES ? `HC al ${adecHC}%. Riesgo de hiperglucemia postprandial.` : `CHO at ${adecHC}%. Risk of postprandial hyperglycemia.`}/>
              )}

              {/* Nature */}
              <NatureCard isES={isES} exchanges={exchanges} totals={totals}/>

            </div>

            {/* Right panel */}
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <KpiCard label={isES ? "Energia total" : "Total energy"} value={totals.kcal.toLocaleString()} unit="kcal/dia" sub={`${Math.round(totals.kcal / (patient.vet||1582) * 100)}% VET`} ok={true}/>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                <KpiCard label="Prot" value={totals.prot} unit="g" sub={`${adecProt}%`} ok={adecProt >= 90}/>
                <KpiCard label={isES ? "Lip" : "Fat"} value={totals.lip} unit="g" sub={`${adecLip}%`} ok={adecLip >= 90}/>
              </div>
              <KpiCard label="HC" value={totals.hc} unit="g" sub={`${adecHC}%`} ok={adecHC >= 90}/>

              {/* Meal kcal bars */}
              <div style={{background:"#fff", border:"0.5px solid #D4E3FF", borderRadius:12, padding:"14px"}}>
                <div style={{fontSize:11, fontWeight:500, color:"#1E2D4E", marginBottom:12, fontFamily:FONT}}>
                  {isES ? "Kcal por tiempo" : "Kcal by meal"}
                </div>
                {mealKeys.map(mk => {
                  const kcal = getMealKcal(mk);
                  const pct  = totals.kcal > 0 ? Math.round(kcal / totals.kcal * 100) : 0;
                  const mc   = MEAL_COLOR[mk];
                  return (
                    <div key={mk} style={{marginBottom:10}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:3, alignItems:"center"}}>
                        <div style={{display:"flex", alignItems:"center", gap:5}}>
                          <div style={{width:20, height:20, borderRadius:"50%", background:mc.bg, color:mc.tx, fontSize:9, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center"}}>{mk}</div>
                          <span style={{fontSize:11, color:"#2D4270", fontFamily:FONT}}>{mealLabel[mk]}</span>
                        </div>
                        <span style={{fontSize:11, fontWeight:500, color:"#1E2D4E", fontFamily:FONT}}>{kcal} kcal</span>
                      </div>
                      <div style={{height:6, background:"#D4E3FF", borderRadius:3, overflow:"hidden"}}>
                        <div style={{height:"100%", width:`${pct}%`, background:"#2563EB", borderRadius:3, transition:"width 0.3s"}}/>
                      </div>
                      <div style={{fontSize:9, color:"#3A5BA0", marginTop:1, textAlign:"right", fontFamily:FONT}}>{pct}% VET</div>
                    </div>
                  );
                })}
              </div>

              {/* PDF buttons */}
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                <button
                  style={{padding:"10px 0", borderRadius:8, background:"#EFF6FF", color:"#2563EB", fontSize:12, fontWeight:500, border:"0.5px solid #2563EB", cursor:"pointer", fontFamily:FONT}}
                >
                  ↓ {isES ? "Descargar PDF" : "Download PDF"}
                </button>
                <button
                  style={{padding:"10px 0", borderRadius:8, background: studyMode ? "#F3E8FF" : "#F5F7FF", color: studyMode ? "#7C3AED" : "#3A5BA0", fontSize:12, fontWeight:500, border: studyMode ? "0.5px solid #7C3AED" : "0.5px solid #D4E3FF", cursor:"pointer", fontFamily:FONT}}
                >
                  {studyMode ? "◎ PDF Study" : "PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudyCtx.Provider>
  );
}
