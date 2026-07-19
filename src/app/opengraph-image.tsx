import { ImageResponse } from "next/og";

export const alt =
  "Migajas — Aprende a contar carbohidratos con comida real de tu país";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const playfairMedium = fetch(
  "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vUDQ.ttf",
).then((res) => res.arrayBuffer());

const dmSansRegular = fetch(
  "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf",
).then((res) => res.arrayBuffer());

const PILLARS = [
  { icon: "E", title: "Educativo", subtitle: "Basado en conocimiento" },
  { icon: "A", title: "Amable", subtitle: "Aprendizaje sin juicios" },
  { icon: "C", title: "Cercano", subtitle: "Enfocado en las personas" },
  { icon: "R", title: "Confiable", subtitle: "Rigor y claridad" },
] as const;

export default async function Image() {
  const [playfair, dmSans] = await Promise.all([playfairMedium, dmSansRegular]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#f9f7f1",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "#b8c9af",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            right: 180,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "#e8b5a3",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 320,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "#d4dfd0",
            opacity: 0.5,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            position: "relative",
            maxWidth: 900,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="88" height="52" viewBox="0 0 120 72">
              <ellipse
                cx="40"
                cy="34"
                rx="30"
                ry="23"
                fill="#6b7f62"
                transform="rotate(-14 40 34)"
              />
              <ellipse
                cx="74"
                cy="30"
                rx="26"
                ry="20"
                fill="#b8c9af"
                transform="rotate(16 74 30)"
              />
              <circle cx="56" cy="50" r="9" fill="#e8b5a3" />
              <circle cx="90" cy="54" r="5.5" fill="#e8b5a3" />
            </svg>
            <div
              style={{
                fontFamily: "Playfair Display",
                fontSize: 56,
                fontWeight: 500,
                color: "#6b7f62",
                letterSpacing: -1,
              }}
            >
              migajas
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: "Playfair Display",
                fontSize: 52,
                fontWeight: 500,
                color: "#3d3429",
                lineHeight: 1.15,
              }}
            >
              Aprende contando carbohidratos.
            </div>
            <div
              style={{
                fontFamily: "DM Sans",
                fontSize: 26,
                color: "#6b635a",
                lineHeight: 1.45,
                maxWidth: 820,
              }}
            >
              Un curso guiado para relacionar gramos, carbohidratos y raciones
              con comida real de tu país.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            position: "relative",
          }}
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "rgba(255,255,255,0.72)",
                borderRadius: 20,
                padding: "18px 20px",
                width: 250,
                border: "1px solid #e8e2d8",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#e3ebe0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#6b7f62",
                }}
              >
                {pillar.icon}
              </div>
              <div
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#3d3429",
                }}
              >
                {pillar.title}
              </div>
              <div
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 15,
                  color: "#6b635a",
                  lineHeight: 1.35,
                }}
              >
                {pillar.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Playfair Display",
          data: playfair,
          style: "normal",
          weight: 500,
        },
        {
          name: "DM Sans",
          data: dmSans,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
