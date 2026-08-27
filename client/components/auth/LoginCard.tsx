"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

import LoginForm from "./LoginForm";

gsap.registerPlugin(Draggable);

interface Props {
  onLogin: (
    email: string,
    password: string
  ) => Promise<void>;
}

export default function LoginCard({
  onLogin,
}: Props) {
  const [isOn, setIsOn] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<SVGCircleElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const hitRef = useRef<SVGCircleElement>(null);

  const isOnRef = useRef(false);

  useEffect(() => {
    const bead = beadRef.current;
    const line = lineRef.current;
    const hit = hitRef.current;

    if (!bead || !line || !hit) return;

    const clickSound = new Audio(
      "https://assets.codepen.io/605876/click.mp3"
    );

    const toggleLamp = () => {
      const next = !isOnRef.current;

      isOnRef.current = next;
      setIsOn(next);

      clickSound.currentTime = 0;
      clickSound.play().catch(() => {});

      if (next) {
        gsap.to(document.body, {
          backgroundColor: "#1c1f24",
          duration: 0.6,
        });
      } else {
        gsap.to(document.body, {
          backgroundColor: "#121417",
          duration: 0.6,
        });
      }
    };

    const draggable = Draggable.create(hit, {
      type: "y",

      bounds: {
        minY: 0,
        maxY: 60,
      },

      onDrag() {
        gsap.set(bead, {
          y: this.y,
        });

        gsap.set(line, {
          attr: {
            y2: 180 + this.y,
          },
        });
      },

      onRelease() {
        if (this.y > 30) {
          toggleLamp();
        }

        gsap.to([bead, hit], {
          y: 0,
          duration: 0.5,
          ease: "back.out(2.5)",
        });

        gsap.to(line, {
          attr: {
            y2: 180,
          },
          duration: 0.5,
          ease: "back.out(2.5)",
        });
      },
    });

    return () => {
      draggable[0]?.kill();

      clickSound.pause();
      clickSound.src = "";
    };
  }, []);

  return (
    <div
      className="
        flex
        w-full
        max-w-[1000px]
        items-center
        justify-center
        gap-[8vmin]
        flex-wrap
      "
    >
      {/* ================= LAMP ================= */}

      <div
        className="
          relative
          flex
          h-[400px]
          w-[280px]
          justify-center
        "
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 200 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Original inner glow */}
          <ellipse
            className={`
              fill-[#ffdb8a]
              blur-[15px]
              transition-opacity
              duration-500
              ${
                isOn
                  ? "opacity-60"
                  : "opacity-0"
              }
            `}
            cx="100"
            cy="110"
            rx="60"
            ry="30"
          />

          {/* Original lamp base */}
          <rect
            className="fill-[#d1ccc2]"
            x="92"
            y="100"
            width="16"
            height="160"
            rx="8"
          />

          <rect
            className="fill-[#d1ccc2]"
            x="60"
            y="250"
            width="80"
            height="12"
            rx="6"
          />

          {/* ================= PULL CORD ================= */}

          <g className="pull-cord">
            <line
              ref={lineRef}
              className="stroke-[#555]"
              strokeWidth="2"
              x1="130"
              y1="110"
              x2="130"
              y2="180"
            />

            <circle
              ref={beadRef}
              className="fill-[#d4a373]"
              cx="130"
              cy="190"
              r="6"
            />

            <circle
              ref={hitRef}
              cx="130"
              cy="190"
              r="25"
              fill="transparent"
              className="cursor-pointer"
            />
          </g>

          {/* ================= LAMP SHADE ================= */}

          <path
            className={`
              transition-all
              duration-500
              ${
                isOn
                  ? "fill-white [filter:drop-shadow(0_0_30px_rgba(255,255,200,0.4))]"
                  : "fill-[#f5f0e6]"
              }
            `}
            d="
              M30 110
              C30 50, 170 50, 170 110
              C170 125, 30 125, 30 110
              Z
            "
          />
        </svg>
      </div>

      {/* ================= LOGIN FORM ================= */}

      <div
        ref={cardRef}
        className={`
          w-[340px]
          max-w-full
          rounded-[30px]
          border
          border-white/10
          bg-white/[0.05]
          p-10
          backdrop-blur-[20px]
          shadow-[0_20px_40px_rgba(0,0,0,0.3)]
          transition-all
          duration-700
          ${
            isOn
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-[30px] opacity-0"
          }
        `}
      >
        <h2 className="mb-6 text-center text-2xl font-medium text-white">
          Welcome
        </h2>

        <LoginForm
          onLogin={onLogin}
        />
      </div>
    </div>
  );
}