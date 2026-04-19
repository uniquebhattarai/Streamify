import { useNavigate } from "react-router-dom";
import { MdHome, MdSearchOff } from "react-icons/md";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{ background: "var(--background)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,127,255,0.08) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(171,199,255,0.05) 0%, transparent 70%)",
          bottom: "15%",
          right: "20%",
          pointerEvents: "none",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Icon container */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(171,199,255,0.12)",
            borderRadius: "50%",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
            boxShadow: "0 0 40px rgba(0,127,255,0.15)",
          }}
        >
          <MdSearchOff size={52} style={{ color: "#448fff" }} />
        </div>

        <h1
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: "7rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            background: "linear-gradient(135deg, #abc7ff 0%, #448fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
            userSelect: "none",
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--on-bg)",
            letterSpacing: "-0.01em",
            marginBottom: "0.75rem",
          }}
        >
          Page not found
        </h2>

     
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.9rem",
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
            maxWidth: 360,
          }}
        >
          Page Does not Exist
        </p>

     
        <div
          style={{
            width: 48,
            height: 2,
            background: "linear-gradient(90deg, transparent, #448fff, transparent)",
            borderRadius: 2,
            marginBottom: "2.5rem",
          }}
        />

        
        <button
          onClick={() => navigate("/")}
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0.75rem 2rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #abc7ff 0%, #448fff 100%)",
            color: "#00315e",
            border: "none",
            cursor: "pointer",
            transition: "opacity 200ms ease, transform 200ms ease, box-shadow 200ms ease",
            boxShadow: "0 0 0px rgba(68,143,255,0)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.92";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(68,143,255,0.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0px rgba(68,143,255,0)";
          }}
        >
          <MdHome size={18} />
          Back to Streamify
        </button>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.75rem",
            color: "var(--muted)",
            marginTop: "1.5rem",
            opacity: 0.5,
          }}
        >
          Error code: 404 · Page not found
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;