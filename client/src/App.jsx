import { useEffect, useMemo, useState } from "react";
import carImage from "./assets/500.png";

const WS_URL = "ws://localhost:3001";
const API_URL = "http://localhost:3001";

function Card({ title, value, unit }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>{title}</div>
            <div style={styles.cardValue}>
                {value} <span style={styles.unit}>{unit}</span>
            </div>
        </div>
    );
}

export default function App() {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("connecting");

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => setStatus("connected");
        ws.onclose = () => setStatus("disconnected");
        ws.onerror = () => setStatus("error");

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "live") {
                setData(message.payload);
            }

            if (message.type === "dtc_cleared") {
                setData(message.payload);
            }
        };

        return () => ws.close();
    }, []);

    const dtcText = useMemo(() => {
        if (!data?.dtc?.length) return "Nessun errore";
        return data.dtc.map((item) => `${item.error} - ${item.descr}`).join(", ");
    }, [data]);

    async function clearDtc() {
        await fetch(`${API_URL}/api/dtc/clear`, {
            method: "POST"
        });
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>OBD Simulator Dashboard</h1>
                    <p style={styles.subtitle}>
                        Stato connessione: <strong>{status}</strong>
                    </p>
                    <p style={styles.subtitle}>
                        Timestamp: <strong>{data?.timestamp ?? "-"}</strong>
                    </p>
                </div>
                <button style={styles.button} onClick={clearDtc}>
                    Clear DTC
                </button>
            </div>

            <div style={styles.heroCard}>
                <div style={styles.heroInfo}>
                    <div style={styles.badge}>Vehicle Overview</div>
                    <h2 style={styles.heroTitle}>Fiat 500</h2>
                    <p style={styles.heroSubtitle}>1.0 Hybrid</p>

                    <div style={styles.heroSpecs}>
                        <div style={styles.specItem}>
                            <span style={styles.specLabel}>Fuel</span>
                            <span style={styles.specValue}>Hybrid</span>
                        </div>
                        <div style={styles.specItem}>
                            <span style={styles.specLabel}>Transmission</span>
                            <span style={styles.specValue}>Manual</span>
                        </div>
                        <div style={styles.specItem}>
                            <span style={styles.specLabel}>Status</span>
                            <span style={styles.specValue}>Connected</span>
                        </div>
                    </div>
                </div>

                <div style={styles.heroImageWrapper}>
                    <img style={styles.heroImage} src={carImage} alt="Fiat 500" />
                </div>
            </div>

            <div style={styles.grid}>
                <Card title="RPM" value={data?.rpm ?? "-"} unit="rpm" />
                <Card title="Speed" value={data?.speed ?? "-"} unit="km/h" />
                <Card title="Coolant Temp" value={data?.coolantTemp ?? "-"} unit="°C" />
                <Card title="Throttle" value={data?.throttle ?? "-"} unit="%" />
                <Card title="Fuel Level" value={data?.fuelLevel ?? "-"} unit="%" />
                <Card title="Battery" value={data?.batteryVoltage ?? "-"} unit="V" />
            </div>

            <div style={styles.panel}>
                <h2 style={styles.panelTitle}>DTC attivi</h2>
                <div style={styles.dtcBox}>{dtcText}</div>
            </div>

            <div style={styles.panel}>
                <h2 style={styles.panelTitle}>Payload live</h2>
                <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    );
}

const styles = {
    page: {
        fontFamily: "Arial, sans-serif",
        padding: 24,
        background: "#111827",
        color: "#f9fafb",
        minHeight: "100vh"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 24
    },
    title: {
        margin: 0,
        fontSize: 28
    },
    subtitle: {
        margin: "8px 0 0",
        color: "#cbd5e1"
    },
    button: {
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "10px 14px",
        cursor: "pointer"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 24
    },
    card: {
        background: "#1f2937",
        borderRadius: 12,
        padding: 16
    },
    cardTitle: {
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 8
    },
    cardValue: {
        fontSize: 28,
        fontWeight: 700
    },
    unit: {
        fontSize: 14,
        color: "#cbd5e1"
    },
    panel: {
        background: "#1f2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
    },
    panelTitle: {
        marginTop: 0
    },
    dtcBox: {
        background: "#0f172a",
        borderRadius: 8,
        padding: 12,
        color: "#fca5a5",
        fontFamily: "monospace"
    },
    pre: {
        background: "#0f172a",
        borderRadius: 8,
        padding: 12,
        overflow: "auto"
    },
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1f2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16

    },
    containerImage: {
        width: "30%"
    },
    heroCard: {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  alignItems: "center",
  gap: 24,
  background: "#1f2937",
  borderRadius: 16,
  padding: 24,
  marginBottom: 24,
  border: "1px solid rgba(255,255,255,0.06)"
},
heroInfo: {
  display: "flex",
  flexDirection: "column",
  gap: 10
},
badge: {
  alignSelf: "flex-start",
  background: "#2563eb",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.4px",
  padding: "6px 10px",
  borderRadius: 999
},
heroTitle: {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.1
},
heroSubtitle: {
  margin: 0,
  color: "#cbd5e1",
  fontSize: 18
},
heroSpecs: {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 8
},
specItem: {
  background: "#111827",
  borderRadius: 12,
  padding: "12px 14px",
  minWidth: 120,
  display: "flex",
  flexDirection: "column",
  gap: 4
},
specLabel: {
  fontSize: 12,
  color: "#94a3b8"
},
specValue: {
  fontSize: 15,
  fontWeight: 700,
  color: "#f9fafb"
},
heroImageWrapper: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
},
heroImage: {
  width: "100%",
  maxWidth: 420,
  height: "auto",
  objectFit: "contain",
  filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.35))"
}
};