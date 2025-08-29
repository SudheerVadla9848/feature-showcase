import { useEffect, useMemo, useRef, useState } from "react";
import { FEATURES } from "./features";
import "./styles.css";

import React from "react";

export function FeatureItem({ item }) {
  return (
    <section className="feature">
      <div className="feature-left featureText">
        <span className="eyebrow">{item.eyebrow}</span>
        <h2 className="title">{item.title}</h2>
        <ul className="bullets">
          {item.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="feature-right">
        <img src={item.image} alt={item.title} />
      </div>
    </section>
  );
}

export default function FeatureShowcase() {
  const [index, setIndex] = useState(0);
  const total = FEATURES.length;
  const active = useMemo(() => FEATURES[index], [index]);

  const sectionRef = useRef(null);
  const isSticky = useRef(false);
  const wheelLocked = useRef(false);
  const released = useRef(false);
  const touchStartY = useRef(null);

  // Mark sticky when in view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (inView && !released.current) {
          el.classList.add("sticky");
          isSticky.current = true;
        } else {
          isSticky.current = false;
        }
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Wheel / touch to auto-advance 1→5; then release page
  useEffect(() => {
    const onWheel = (e) => {
      if (!isSticky.current || released.current) return;
      e.preventDefault();
      if (wheelLocked.current) return;
      wheelLocked.current = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      advance(dir);
      setTimeout(() => (wheelLocked.current = false), 420);
    };

    const onTouchStart = (e) => {
      if (!isSticky.current || released.current) return;
      touchStartY.current = e.touches?.[0]?.clientY ?? null;
    };

    const onTouchMove = (e) => {
      if (!isSticky.current || released.current) return;
      if (touchStartY.current == null) return;
      const currentY = e.touches?.[0]?.clientY;
      if (currentY == null) return;
      const dy = touchStartY.current - currentY;
      if (Math.abs(dy) < 24) return;
      e.preventDefault();
      if (wheelLocked.current) return;
      wheelLocked.current = true;
      advance(dy > 0 ? 1 : -1);
      setTimeout(() => (wheelLocked.current = false), 420);
      touchStartY.current = currentY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const advance = (dir) => {
    setIndex((prev) => {
      const next = Math.min(Math.max(prev + dir, 0), total - 1);

      // Release when trying to scroll past boundaries
      if (next === prev) {
        if (prev === total - 1 && dir > 0) {
          releaseSticky(); // release after last
        }
        if (prev === 0 && dir < 0) {
          releaseSticky(); // release before first
        }
        return prev;
      }

      return next;
    });
  };

  const releaseSticky = () => {
    if (released.current) return;
    released.current = true;
    const el = sectionRef.current;
    if (!el) return;
    el.classList.remove("sticky");
    el.classList.add("released");
  };

  return (
    <section ref={sectionRef} className="feature-section">
      {/* Left column */}
      <div className="left">
        <div className="eyebrow">
          <span className="key">{active.eyebrow}</span>
        </div>
        <h2 className="title">{active.title}</h2>

        <ul className="bullets" aria-live="polite">
          {active.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        <div className="nav">
          <button
            className="arrow"
            aria-label="Previous feature"
            onClick={() => setIndex((v) => Math.max(v - 1, 0))}
            disabled={index === 0}
          >
            ←
          </button>
          <div className="midline" />
          <button
            className="arrow"
            aria-label="Next feature"
            onClick={() => setIndex((v) => Math.min(v + 1, total - 1))}
            disabled={index === total - 1}
          >
            →
          </button>
        </div>
      </div>

      {/* Phone in center */}
      <div className="device">
        <div className="phone">
          <img
            key={active.image}
            src={active.image}
            alt={`Feature ${active.id}`}
            className="screen"
          />
          <div className="notch" aria-hidden />

          {/* Progress Dots */}
          <div className="progress-dots">
            {FEATURES.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === index ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right column - points */}
      <div className="right">
        <div className="right-title">Feature Showcase</div>
        <ol className="points" role="tablist">
          {FEATURES.map((f, i) => {
            const isActive = i === index;
            return (
              <li key={f.id} role="presentation">
                <button
                  role="tab"
                  aria-selected={isActive}
                  className={`point ${isActive ? "active" : ""}`}
                  onClick={() => setIndex(i)}
                >
                  <span className="bar" />
                  <span className="label">
                    Feature {f.id}: <strong>{f.title}</strong>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
