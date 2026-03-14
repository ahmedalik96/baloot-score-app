"use client";

import { useMemo, useState } from "react";

type TeamKey = "team1" | "team2" | "";
type RoundType = "hand" | "normal" | "custom" | "";

type Round = {
  winnerTeam: TeamKey;
  type: RoundType;
  customLoserPoints: string;
  customWinnerPoints: string;
};

const PRESET_NAMES = ["الماي الحار", "جماعة الجاقة", "الوحوش", "مخصص"];
const MAX_ROUNDS = 5;
const MAX_LOSER_POINTS_PER_ROUND = 400;
const MIN_WINNER_POINTS_PER_ROUND = -60;

function createEmptyRound(): Round {
  return {
    winnerTeam: "",
    type: "",
    customLoserPoints: "",
    customWinnerPoints: "",
  };
}

function getRoundScore(round: Round) {
  if (!round.winnerTeam || !round.type) {
    return { team1: 0, team2: 0 };
  }

  if (round.type === "hand") {
    return round.winnerTeam === "team1"
      ? { team1: -60, team2: 400 }
      : { team1: 400, team2: -60 };
  }

  if (round.type === "normal") {
    return round.winnerTeam === "team1"
      ? { team1: -30, team2: 200 }
      : { team1: 200, team2: -30 };
  }

  const loserPoints = Number(round.customLoserPoints || 0);
  const winnerPoints = Number(round.customWinnerPoints || 0);

  return round.winnerTeam === "team1"
    ? { team1: winnerPoints, team2: loserPoints }
    : { team1: loserPoints, team2: winnerPoints };
}

export default function Home() {
  const [page, setPage] = useState<"home" | "score">("home");

  const [team1Preset, setTeam1Preset] = useState("الماي الحار");
  const [team2Preset, setTeam2Preset] = useState("جماعة الجاقة");

  const [team1Custom, setTeam1Custom] = useState("");
  const [team2Custom, setTeam2Custom] = useState("");

  const [rounds, setRounds] = useState<Round[]>(
    Array.from({ length: MAX_ROUNDS }, createEmptyRound)
  );

  const team1Name =
    team1Preset === "مخصص" ? team1Custom || "الفريق الأول" : team1Preset;
  const team2Name =
    team2Preset === "مخصص" ? team2Custom || "الفريق الثاني" : team2Preset;

  const roundScores = useMemo(() => {
    return rounds.map((r) => getRoundScore(r));
  }, [rounds]);

  const total1 = useMemo(
    () => roundScores.reduce((sum, r) => sum + r.team1, 0),
    [roundScores]
  );
  const total2 = useMemo(
    () => roundScores.reduce((sum, r) => sum + r.team2, 0),
    [roundScores]
  );

  const roundsPlayed = useMemo(() => {
    return rounds.filter((r) => r.winnerTeam && r.type).length;
  }, [rounds]);

  function updateRound(index: number, patch: Partial<Round>) {
    setRounds((prev) =>
      prev.map((round, i) => (i === index ? { ...round, ...patch } : round))
    );
  }

  function resetAll() {
    setPage("home");
    setTeam1Preset("الماي الحار");
    setTeam2Preset("جماعة الجاقة");
    setTeam1Custom("");
    setTeam2Custom("");
    setRounds(Array.from({ length: MAX_ROUNDS }, createEmptyRound));
  }

  function getWinnerStatus() {
    const roundsLeft = MAX_ROUNDS - roundsPlayed;

    const bestPossible1 = total1 + roundsLeft * MIN_WINNER_POINTS_PER_ROUND;
    const worstPossible1 = total1 + roundsLeft * MAX_LOSER_POINTS_PER_ROUND;

    const bestPossible2 = total2 + roundsLeft * MIN_WINNER_POINTS_PER_ROUND;
    const worstPossible2 = total2 + roundsLeft * MAX_LOSER_POINTS_PER_ROUND;

    if (worstPossible1 < bestPossible2) {
      return {
        winner: team1Name,
        loser: team2Name,
        message: `${team1Name} فاز`,
        subMessage: `${team2Name} توكل`,
      };
    }

    if (worstPossible2 < bestPossible1) {
      return {
        winner: team2Name,
        loser: team1Name,
        message: `${team2Name} فاز`,
        subMessage: `${team1Name} توكل`,
      };
    }

    return null;
  }

  const earlyWinner = getWinnerStatus();

  let finalMessage = "";
  let finalSubMessage = "";

  if (earlyWinner) {
    finalMessage = earlyWinner.message;
    finalSubMessage = earlyWinner.subMessage;
  } else if (roundsPlayed === MAX_ROUNDS) {
    if (total1 < total2) {
      finalMessage = `${team1Name} فاز`;
      finalSubMessage = `${team2Name} توكل`;
    } else if (total2 < total1) {
      finalMessage = `${team2Name} فاز`;
      finalSubMessage = `${team1Name} توكل`;
    } else {
      finalMessage = "تعادل";
      finalSubMessage = "النتيجة متساوية";
    }
  }

  if (page === "home") {
    return (
      <div style={styles.homeWrap} dir="rtl">
        <div style={styles.homeOverlay}></div>

        <div style={styles.homeCard}>
          <div style={styles.heroContent}>
            <div style={styles.heroText}>
              <div style={styles.badge}>بلوت • تسجيل النقاط</div>
              <h1 style={styles.title}>هلا بالربع</h1>
              <p style={styles.subtitle}>نلعب لو يجي واحد بعد ؟؟!!</p>

              <button style={styles.mainButton} onClick={() => setPage("score")}>
                يله نبلش
              </button>
            </div>

            <div style={styles.heroImageWrap}>
              <div style={styles.cardsArea}>
                <div style={{ ...styles.gameCard, ...styles.card1 }}>♠ A</div>
                <div style={{ ...styles.gameCard, ...styles.card2 }}>♥ K</div>
                <div style={{ ...styles.gameCard, ...styles.card3 }}>♦ Q</div>
              </div>
              <div style={styles.emojiChip}>🎴</div>
            </div>
          </div>

          <div style={styles.footerText}>By: Ahmed Ali</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.pageTitle}>حاسبة البلوت</h2>
            <p style={styles.pageSubTitle}>واجهة أوضح ومريحة للموبايل</p>
          </div>

          <button style={styles.secondaryButton} onClick={resetAll}>
            إعادة الكل
          </button>
        </div>

        <div style={styles.teamsGrid}>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>الفريق الأول</h3>
            <select
              style={styles.select}
              value={team1Preset}
              onChange={(e) => setTeam1Preset(e.target.value)}
            >
              {PRESET_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {team1Preset === "مخصص" && (
              <input
                style={styles.input}
                value={team1Custom}
                onChange={(e) => setTeam1Custom(e.target.value)}
                placeholder="اكتب اسم الفريق"
              />
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>الفريق الثاني</h3>
            <select
              style={styles.select}
              value={team2Preset}
              onChange={(e) => setTeam2Preset(e.target.value)}
            >
              {PRESET_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {team2Preset === "مخصص" && (
              <input
                style={styles.input}
                value={team2Custom}
                onChange={(e) => setTeam2Custom(e.target.value)}
                placeholder="اكتب اسم الفريق"
              />
            )}
          </div>
        </div>

        <div style={styles.scoreSummary}>
          <div style={{ ...styles.summaryBox, ...styles.summaryBox1 }}>
            <div style={styles.summaryTeam}>{team1Name}</div>
            <div style={styles.summaryScore}>{total1}</div>
          </div>

          <div style={{ ...styles.summaryBox, ...styles.summaryBox2 }}>
            <div style={styles.summaryTeam}>{team2Name}</div>
            <div style={styles.summaryScore}>{total2}</div>
          </div>
        </div>

        <div style={styles.roundsWrap}>
          {rounds.map((round, index) => {
            const score = roundScores[index];

            return (
              <div key={index} style={styles.roundCard}>
                <div style={styles.roundHeader}>
                  <span style={styles.roundBadge}>الجولة {index + 1}</span>
                  <span style={styles.roundMiniScore}>
                    {team1Name}: {score.team1} | {team2Name}: {score.team2}
                  </span>
                </div>

                <div style={styles.roundGrid}>
                  <div>
                    <label style={styles.label}>الفريق الفائز</label>
                    <select
                      style={styles.select}
                      value={round.winnerTeam}
                      onChange={(e) =>
                        updateRound(index, {
                          winnerTeam: e.target.value as TeamKey,
                        })
                      }
                    >
                      <option value="">اختر الفريق</option>
                      <option value="team1">{team1Name}</option>
                      <option value="team2">{team2Name}</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>نوع الجولة</label>
                    <select
                      style={styles.select}
                      value={round.type}
                      onChange={(e) =>
                        updateRound(index, {
                          type: e.target.value as RoundType,
                        })
                      }
                    >
                      <option value="">اختر النوع</option>
                      <option value="hand">هاند</option>
                      <option value="normal">عادي</option>
                      <option value="custom">مخصص / مو كامل</option>
                    </select>
                  </div>
                </div>

                {round.type === "custom" && (
                  <div style={styles.roundGrid}>
                    <div>
                      <label style={styles.label}>نقاط الفائز</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={round.customWinnerPoints}
                        onChange={(e) =>
                          updateRound(index, {
                            customWinnerPoints: e.target.value,
                          })
                        }
                        placeholder="مثال -20"
                      />
                    </div>

                    <div>
                      <label style={styles.label}>نقاط الخاسر</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={round.customLoserPoints}
                        onChange={(e) =>
                          updateRound(index, {
                            customLoserPoints: e.target.value,
                          })
                        }
                        placeholder="مثال 150"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>حالة اللعب</h3>
            <p style={styles.infoText}>
              الجولات المدخلة: {roundsPlayed} / {MAX_ROUNDS}
            </p>
            <p style={styles.infoText}>الفريق الفائز هو الأقل نقاطًا</p>
          </div>

          <div style={{ ...styles.card, ...styles.resultCard }}>
            <h3 style={styles.sectionTitle}>النتيجة</h3>
            {finalMessage ? (
              <>
                <p style={styles.winText}>{finalMessage}</p>
                <p style={styles.loseText}>{finalSubMessage}</p>
              </>
            ) : (
              <p style={styles.infoText}>ما زال اللعب مستمر</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button style={styles.secondaryButton} onClick={() => setPage("home")}>
            رجوع للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  homeWrap: {
    minHeight: "100vh",
    padding: "16px",
    background:
      "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 45%, #f59e0b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  homeOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.14), transparent 28%)",
  },
  homeCard: {
    width: "100%",
    maxWidth: "1000px",
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(10px)",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },
  heroContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    alignItems: "center",
  },
  heroText: {
    textAlign: "right",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    color: "#ffffff",
    fontSize: "14px",
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 12px 0",
    color: "#ffffff",
    fontSize: "clamp(34px, 8vw, 64px)",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "0 0 24px 0",
    color: "#fef3c7",
    fontSize: "clamp(20px, 4vw, 28px)",
    lineHeight: 1.8,
  },
  mainButton: {
    width: "100%",
    padding: "16px 20px",
    border: "none",
    borderRadius: "18px",
    fontSize: "22px",
    fontWeight: 700,
    color: "#ffffff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ef4444, #f59e0b)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
  },
  heroImageWrap: {
    minHeight: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardsArea: {
    position: "relative",
    width: "240px",
    height: "220px",
  },
  gameCard: {
    position: "absolute",
    width: "120px",
    height: "170px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: 700,
    color: "#111827",
    boxShadow: "0 18px 30px rgba(0,0,0,0.2)",
    border: "3px solid rgba(255,255,255,0.6)",
  },
  card1: {
    right: "10px",
    top: "20px",
    transform: "rotate(12deg)",
  },
  card2: {
    right: "60px",
    top: "0px",
    transform: "rotate(-2deg)",
  },
  card3: {
    right: "110px",
    top: "24px",
    transform: "rotate(-16deg)",
  },
  emojiChip: {
    position: "absolute",
    bottom: "10px",
    left: "24px",
    fontSize: "54px",
  },
  footerText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#ffffff",
    fontSize: "13px",
    opacity: 0.9,
  },
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #eff6ff 0%, #f5f3ff 55%, #fff7ed 100%)",
    padding: "14px",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  pageTitle: {
    margin: 0,
    color: "#1f2937",
  },
  pageSubTitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
  },
  secondaryButton: {
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
  },
  teamsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },
  card: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    border: "1px solid rgba(255,255,255,0.7)",
  },
  sectionTitle: {
    marginTop: 0,
    color: "#1f2937",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: "16px",
    marginTop: "10px",
    boxSizing: "border-box",
  },
  scoreSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  summaryBox: {
    borderRadius: "18px",
    padding: "16px",
    color: "#ffffff",
    boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
  },
  summaryBox1: {
    background: "linear-gradient(135deg, #0f766e, #14b8a6)",
  },
  summaryBox2: {
    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
  },
  summaryTeam: {
    fontSize: "18px",
    marginBottom: "8px",
  },
  summaryScore: {
    fontSize: "34px",
    fontWeight: 800,
  },
  roundsWrap: {
    display: "grid",
    gap: "12px",
  },
  roundCard: {
    background: "rgba(255,255,255,0.94)",
    borderRadius: "18px",
    padding: "14px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },
  roundHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  roundBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "14px",
  },
  roundMiniScore: {
    color: "#475569",
    fontSize: "14px",
  },
  roundGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#475569",
    fontSize: "14px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  },
  resultCard: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(254,249,195,0.96))",
  },
  infoText: {
    color: "#374151",
    lineHeight: 1.8,
  },
  winText: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#15803d",
    marginBottom: "8px",
  },
  loseText: {
    fontSize: "22px",
    color: "#374151",
  },
};