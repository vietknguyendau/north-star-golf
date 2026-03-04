import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const TOURNAMENT_ID = "tournament-2024";

const DEFAULT_RULES = {
  leagueFormat: `The North Star Amateur Series is a six-event net stroke play league held on Saturdays throughout the 2026 Minnesota golf season. All events are open to registered members who have paid their season dues and submitted a valid handicap index.

Net scoring ensures fair competition across all skill levels. Your net score is calculated by subtracting your course handicap from your gross score. The player with the lowest net score wins the event.

All play is conducted under USGA Rules of Golf. Preferred lies may be granted by the commissioner based on course conditions.`,

  pointsSystem: `Season standings are determined by a points-based system. Points are awarded based on finishing position in each event:

1st – 100 pts · 2nd – 85 pts · 3rd – 75 pts · 4th – 65 pts · 5th – 55 pts · 6th – 50 pts · 7th – 45 pts · 8th – 40 pts · 9th – 36 pts · 10th – 32 pts

Players finishing 11th and beyond receive 5 points for participation.

Best 4 of 6 events count toward your final season total. Your two lowest-scoring events are dropped automatically.

MULTIPLIER EVENTS: Event 4 (North Star Mid-Season Major) awards 2× points. Event 6 (North Star Championship) awards 3× points. These events carry the most weight — show up and play well.`,

  payoutStructure: `Event 3 (Mid-Summer Medal) features a top-4 cash payout funded by optional player buy-ins collected at registration for that event.

Payout split:
1st place – 40% of the pot
2nd place – 27% of the pot
3rd place – 20% of the pot
4th place – 13% of the pot

All other events are points-only. No cash payouts unless announced by the commissioner prior to the event. Payouts are made same-day in cash.`,

  handicapRules: `The North Star Amateur Series uses the World Handicap System (WHS) to calculate and maintain player handicap indexes.

ESTABLISHING A HANDICAP: Players self-report their current GHIN handicap index at registration. This serves as your starting index until league rounds are posted.

LEAGUE ROUNDS: After 3 rounds posted within the league, your handicap index transitions to a league-calculated index based on your differentials. Differential = (Gross Score − Course Rating) × 113 ÷ Slope Rating.

INDEX CALCULATION: Best 8 of your last 20 differentials, averaged and multiplied by 0.96.

MAXIMUM INDEX: 28.0. Any player with a self-reported index above 28 will be capped at 28 for all league play.

COURSE HANDICAP: Your course handicap for each event is calculated as: Handicap Index × (Slope ÷ 113). This determines how many strokes you receive per round.

INTEGRITY: Sandbbagging — intentionally inflating your scores to gain a handicap advantage — is taken seriously and may result in disqualification at the commissioner's discretion.`,

  conductRules: `The North Star Amateur Series is built on competition, camaraderie, and respect. All members are expected to uphold the following:

PACE OF PLAY: Ready golf is expected. Groups should complete 18 holes within 4.5 hours. Slow play may result in score adjustments at the commissioner's discretion.

SPORTSMANSHIP: Treat fellow competitors, course staff, and the golf course with respect. Unsportsmanlike behavior including club throwing, verbal abuse, or intentional course damage may result in disqualification.

SCORING INTEGRITY: All scores must be entered by the player themselves using their personal PIN. Score manipulation, falsifying scores, or entering scores on behalf of another player is strictly prohibited and grounds for disqualification.

PHONES & DEVICES: Phones may be used for GPS and scoring only during rounds. Calls should be kept brief and off the tee box.

DISPUTES: Any scoring disputes must be raised with the commissioner before leaving the course. Post-round disputes will not be accepted.

DUES & FEES: Season dues and event fees must be paid prior to playing. Players with outstanding balances may be withheld from the leaderboard.`,

  ryderCupFormat: `The North Star Ryder Cup Finale is held September 26, 2026 and is open exclusively to the top 12 players in season standings following Event 6.

FORMAT: 36 holes of match play in a single day. The field is split into two teams by the commissioner based on standings and competitive balance.

MORNING SESSION: Team matches (foursomes or four-ball) — format announced the week prior.

AFTERNOON SESSION: Singles matches. Every player competes head-to-head against an opponent from the other team.

SCORING: 1 point per match. Half point for a halved match. The team with the most points wins the Ryder Cup.

HANDICAPS: Adjusted handicaps are used for competitive balance in match play. The commissioner will announce adjustments prior to the event.

This event does not count toward season standings points but carries its own trophy and bragging rights.`,

  scheduleOverview: `2026 NORTH STAR AMATEUR SERIES SCHEDULE

Event 1 – Opening Classic
May 30, 2026 · Net Stroke Play · Rum River Hills

Event 2 – Early Summer Medal
June 20, 2026 · Net Stroke Play · Links at Northfork

Event 3 – Mid-Summer Medal [$]
July 11, 2026 · Net Stroke Play · Top-4 Cash Payout · Oak Marsh / Eagle Valley

Event 4 – North Star Mid-Season Major ⭐ [2× Points]
August 1, 2026 · Net Stroke Play · Keller / Edinburgh

Event 5 – Late-Season Push
August 22, 2026 · Net Stroke Play · Cedar Creek / Fox Hollow

Event 6 – North Star Championship ⭐⭐ [3× Points]
September 12, 2026 · Determines Regular Season Champion · Top-12 Ryder Cup Field · Mystic Lake / Keller

Event 7 – Ryder Cup Finale 🏆
September 26, 2026 · Top 12 Players · 36 Holes Match Play · Championship Venue

Event 8 – Season-Ending Scramble & Banquet 🎉
October 3, 2026 · No Points · Awards, Dinner & Celebration`,
};

const SECTIONS = [
  { key:"leagueFormat",    icon:"⛳", title:"League Format & Scoring" },
  { key:"pointsSystem",    icon:"⭐", title:"Points System & Multipliers" },
  { key:"payoutStructure", icon:"💰", title:"Payout Structure" },
  { key:"handicapRules",   icon:"📊", title:"Handicap Rules" },
  { key:"conductRules",    icon:"🤝", title:"Code of Conduct" },
  { key:"ryderCupFormat",  icon:"🏆", title:"Ryder Cup Format" },
  { key:"scheduleOverview",icon:"📅", title:"2026 Schedule" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
.rules-wrap { font-family:'Cormorant Garamond',Georgia,serif; max-width:860px; margin:0 auto; }
.rules-fade { animation:rFade .4s ease; }
@keyframes rFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.rules-label { font-family:'Bebas Neue'; letter-spacing:3px; font-size:11px; color:var(--green); margin-bottom:10px; }
.rules-section { border:1px solid var(--border); border-radius:6px; overflow:hidden; margin-bottom:16px; }
.rules-section-header { padding:16px 22px; background:var(--bg2); display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:background .15s; user-select:none; }
.rules-section-header:hover { background:var(--bg3); }
.rules-section-header.open { border-bottom:1px solid var(--border); }
.rules-body { padding:22px 24px; background:var(--bg2); white-space:pre-wrap; font-size:15px; line-height:1.85; color:var(--text2); }
.rules-body textarea { width:100%; background:var(--bg3); border:1px solid var(--border2); color:var(--text); padding:14px; font-family:'Cormorant Garamond',Georgia,serif; font-size:15px; line-height:1.85; resize:vertical; border-radius:3px; outline:none; box-sizing:border-box; }
.rules-body textarea:focus { border-color:var(--gold); }
.rules-edit-bar { display:flex; gap:8px; padding:12px 24px; background:var(--bg3); border-top:1px solid var(--border); }
.rules-hero { text-align:center; padding:32px 20px 28px; margin-bottom:28px; border-bottom:1px solid var(--border); }
.toc-item { padding:8px 16px; font-size:14px; color:var(--text2); cursor:pointer; border-left:2px solid transparent; transition:all .15s; }
.toc-item:hover { color:var(--gold); border-left-color:var(--gold-dim); background:var(--bg2); }
.last-updated { font-family:'DM Mono'; font-size:11px; color:var(--text3); }
`;

export default function RulesPage({ adminUnlocked }) {
  const [rules, setRules]         = useState(null);
  const [openSection, setOpen]    = useState("leagueFormat");
  const [editingKey, setEditing]  = useState(null);
  const [draftText, setDraft]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db,"tournaments",TOURNAMENT_ID,"settings","rules"), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setRules(data.sections || DEFAULT_RULES);
        setLastUpdated(data.updatedAt || null);
      } else {
        setRules(DEFAULT_RULES);
      }
    });
    return () => unsub();
  }, []);

  const startEdit = (key) => {
    setEditing(key);
    setDraft(rules[key] || "");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const saveSection = async (key) => {
    setSaving(true);
    const updated = { ...rules, [key]: draftText };
    await setDoc(doc(db,"tournaments",TOURNAMENT_ID,"settings","rules"), {
      sections: updated,
      updatedAt: new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
    });
    setRules(updated);
    setEditing(null);
    setSaving(false);
  };

  const cancelEdit = () => { setEditing(null); setDraft(""); };

  if (!rules) return (
    <div style={{textAlign:"center",padding:60,color:"var(--text3)",fontFamily:"'Bebas Neue'",letterSpacing:3}}>
      LOADING RULES…
    </div>
  );

  return (
    <div className="rules-wrap rules-fade">
      <style>{CSS}</style>

      {/* Hero */}
      <div className="rules-hero">
        <div style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:5,color:"var(--green)",marginBottom:8}}>
          OFFICIAL LEAGUE DOCUMENT
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:3,color:"var(--text)",marginBottom:6}}>
          NORTH STAR AMATEUR SERIES
        </div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:3,color:"var(--gold)",marginBottom:12}}>
          RULES, FORMAT & REGULATIONS · 2026
        </div>
        <div style={{fontSize:14,color:"var(--text3)",fontStyle:"italic",maxWidth:480,margin:"0 auto",lineHeight:1.7}}>
          All members are expected to read and understand these rules before participating. 
          Questions? Contact the commissioner.
        </div>
        {lastUpdated && (
          <div className="last-updated" style={{marginTop:12}}>Last updated: {lastUpdated}</div>
        )}
      </div>

      {/* Table of contents */}
      <div className="rules-label">── TABLE OF CONTENTS</div>
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:6,overflow:"hidden",marginBottom:28}}>
        {SECTIONS.map((s,i) => (
          <div key={s.key} className="toc-item" style={{borderBottom:i<SECTIONS.length-1?"1px solid var(--border)":"none"}}
            onClick={()=>{ setOpen(s.key); setTimeout(()=>document.getElementById("section-"+s.key)?.scrollIntoView({behavior:"smooth",block:"start"}),50); }}>
            <span style={{marginRight:10}}>{s.icon}</span>
            <span style={{fontFamily:"'Bebas Neue'",letterSpacing:1,fontSize:13}}>{i+1}.</span>
            {" "}{s.title}
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="rules-label">── FULL RULES</div>
      {SECTIONS.map((s,i) => {
        const isOpen = openSection === s.key;
        const isEditing = editingKey === s.key;
        return (
          <div key={s.key} id={"section-"+s.key} className="rules-section">
            <div className={`rules-section-header ${isOpen?"open":""}`} onClick={()=>setOpen(isOpen?null:s.key)}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:3,color:"var(--green)"}}>SECTION {i+1}</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:2,color:isOpen?"var(--gold)":"var(--text)"}}>{s.title}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {adminUnlocked && isOpen && !isEditing && (
                  <button onClick={e=>{ e.stopPropagation(); startEdit(s.key); }}
                    className="btn-ghost" style={{fontSize:11,padding:"4px 12px"}}
                    >✏️ EDIT</button>
                )}
                <span style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"var(--text3)",transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
              </div>
            </div>

            {isOpen && (
              <div className="rules-body">
                {isEditing ? (
                  <>
                    <textarea ref={textareaRef} value={draftText} onChange={e=>setDraft(e.target.value)}
                      rows={Math.max(8, draftText.split("\n").length + 2)}/>
                    <div className="rules-edit-bar">
                      <button className="btn-gold" style={{fontSize:12}} onClick={()=>saveSection(s.key)} disabled={saving}>
                        {saving?"SAVING…":"SAVE CHANGES"}
                      </button>
                      <button className="btn-ghost" style={{fontSize:12}} onClick={cancelEdit}>CANCEL</button>
                      <span style={{fontSize:11,color:"var(--text3)",fontStyle:"italic",marginLeft:8,alignSelf:"center"}}>
                        Plain text. Line breaks are preserved.
                      </span>
                    </div>
                  </>
                ) : (
                  rules[s.key] || DEFAULT_RULES[s.key]
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div style={{textAlign:"center",padding:"32px 0 16px",borderTop:"1px solid var(--border)",marginTop:28}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:3,color:"var(--text3)"}}>
          NORTH STAR AMATEUR SERIES · MINNEAPOLIS, MN · 2026
        </div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:6,fontStyle:"italic"}}>
          Rules subject to commissioner discretion. Good golf, good company.
        </div>
      </div>
    </div>
  );
}
