import { useState, useEffect } from "react";

const COMMUNITY_IMAGES = [
  "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1400&h=900&fit=crop&q=80&fm=webp",
  "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1400&h=900&fit=crop&q=80&fm=webp",
  "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1400&h=900&fit=crop&q=80&fm=webp",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&h=900&fit=crop&q=80&fm=webp",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1400&h=900&fit=crop&q=80&fm=webp",
];

export default function CommunityBackgroundGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % COMMUNITY_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 0,
      overflow: "hidden",
    }}>
      {COMMUNITY_IMAGES.map((img, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url('${img}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: idx === activeIndex ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            willChange: "opacity",
          }}
        />
      ))}

      {/* Overlay escuro gradiente */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(160deg, rgba(5, 25, 65, 0.80) 0%, rgba(8, 35, 80, 0.88) 100%)",
        zIndex: 1,
      }} />

      {/* Dots de navegação */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        zIndex: 2,
      }}>
        {COMMUNITY_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            style={{
              width: idx === activeIndex ? 24 : 7,
              height: 7,
              borderRadius: 999,
              background: idx === activeIndex ? "#00AEEF" : "rgba(255,255,255,0.35)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.4s ease",
              padding: 0,
            }}
            aria-label={`Foto ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}