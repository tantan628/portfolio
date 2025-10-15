import "../hero.css";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Background layers */}
      <div className="hero-bg absolute inset-0 pointer-events-none">
        <div className="hero-haze"></div>
        <div className="hero-horizon"></div>

        {/* changed: wrap the floor so perspective is on the parent */}
        <div className="hero-floor-wrap">
          <div className="hero-floor"></div>
        </div>

        <div className="hero-fog"></div>
        <div className="hero-vignette"></div>
      </div>

      {/* Title */}
      <h1 className="hero-title">Tanis.dev</h1>
    </section>
  );
}
