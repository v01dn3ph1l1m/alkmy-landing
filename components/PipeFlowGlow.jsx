"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  BarChart,
  FileText,
  Database,
  Code,
  Lightbulb,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// A map of icons to use for the animation
const ICONS = {
  brain: (props) => <Brain {...props} />,
  chart: (props) => <BarChart {...props} />,
  file: (props) => <FileText {...props} />,
  db: (props) => <Database {...props} />,
  code: (props) => <Code {...props} />,
};

// Map of colors for easy reference
const COLOR_MAP = {
  purple: { bg: "bg-purple-500", glow: "shadow-purple-500/70", hex: "#a855f7" },
  blue: { bg: "bg-blue-500", glow: "shadow-blue-500/70", hex: "#3b82f6" },
  green: { bg: "bg-green-500", glow: "shadow-green-500/70", hex: "#22c55e" },
  yellow: { bg: "bg-yellow-500", glow: "shadow-yellow-500/70", hex: "#eab308" },
  red: { bg: "bg-red-500", glow: "shadow-red-500/70", hex: "#ef4444" },
};

// Define the static paths
const staticPaths = [
  {
    id: "path-1",
    d: "M 0 50 Q 350 100 500 250",
    icon: "brain",
    colorKey: "purple",
  },
  {
    id: "path-2",
    d: "M 0 150 Q 350 150 500 250",
    icon: "chart",
    colorKey: "blue",
  },
  {
    id: "path-3",
    d: "M 0 250 Q 350 250 500 250",
    icon: "file",
    colorKey: "green",
  },
  {
    id: "path-4",
    d: "M 0 350 Q 350 350 500 250",
    icon: "db",
    colorKey: "yellow",
  },
  {
    id: "path-5",
    d: "M 0 450 Q 350 400 500 250",
    icon: "code",
    colorKey: "red",
  },
];

// Path for the outgoing "insight"
const insightPath = {
  id: "path-insight",
  d: "M 526 250 L 1000 250", // Simple straight line out
};

/**
 * Main App Component
 * This component renders the entire animation.
 */
export default function AppHero() {
  // We use state to store paths with random delays/durations
  // This is crucial for avoiding React hydration errors
  const [animatedPaths, setAnimatedPaths] = useState([]);

  useEffect(() => {
    // Generate random durations and delays only on the client
    const newPaths = staticPaths.map((path) => ({
      ...path,
      duration: 4 + Math.random() * 3, // Duration: 4s to 7s
      delay: Math.random() * 5, // Delay: 0s to 5s
      color: COLOR_MAP[path.colorKey],
    }));
    setAnimatedPaths(newPaths);
  }, []); // Empty dependency array ensures this runs once on mount

  // Define all static keyframes and animation classes
  const keyframeStyles = `
    /* Animation for the "pulse" effect on the lines */
    @keyframes slideMask {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Base class for all mask rectangles */
    .mask-rect {
      animation: slideMask 4s ease-in-out infinite;
    }

    /* Animation for the incoming icons (maintains color) */
    @keyframes move-on-path {
      0% {
        offset-distance: 0%;
        opacity: 0;
        transform: scale(1);
      }
      10% {
        opacity: 1;
      }
      95% {
        offset-distance: 100%;
        transform: scale(0.5);
        opacity: 0;
      }
      100% {
        offset-distance: 100%;
        opacity: 0;
        transform: scale(0);
      }
    }

    /* Animation for the outgoing "insight" */
    @keyframes move-insight {
      0% {
        offset-distance: 0%;
        opacity: 0;
        transform: scale(0.5);
      }
      10%, 80% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        offset-distance: 100%;
        opacity: 0;
        transform: scale(0.5);
      }
    }

    /* Class for the insight particle */
    .particle-insight {
      offset-path: path("${insightPath.d}");
      animation: move-insight 5s ease-in-out infinite;
      animation-delay: 2.5s; /* Start after others have arrived */
    }
  `;

  // Generate dynamic styles based on the randomized state
  const dynamicStyles = animatedPaths
    .map(
      (path) => `
    /* Particle class for ${path.id} */
    .particle-${path.id} {
      /* This CSS property makes the div follow the SVG path */
      offset-path: path("${path.d}");
      /* Apply random duration and delay */
      animation: move-on-path ${path.duration}s ease-in-out infinite;
      animation-delay: ${path.delay}s;
    }
  `
    )
    .join("\n");

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden text-white">
      {/* Inject all styles */}
      <style>{keyframeStyles + dynamicStyles}</style>

      {/* Main container for the visualization */}
      <div className="relative w-[1000px] h-[500px]">
        {/* 1. The SVG container for VISIBLE paths */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute top-0 left-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Single white pulse gradient used by all masks */}
            <linearGradient
              id="pulse-gradient"
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="60%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Generate one mask PER path, each with a custom delay */}
            {animatedPaths.map((path) => (
              <mask key={`mask-${path.id}`} id={`pulse-mask-${path.id}`}>
                <rect
                  className="mask-rect"
                  style={{ animationDelay: `${path.delay}s` }}
                  x="0"
                  y="0"
                  width="1000"
                  height="500"
                  fill="url(#pulse-gradient)"
                />
              </mask>
            ))}

            {/* Mask for the yellow insight pulse */}
            <mask id="pulse-mask-insight">
              <rect
                className="mask-rect"
                style={{ animationDelay: "2.5s" }}
                x="0"
                y="0"
                width="1000"
                height="500"
                fill="url(#pulse-gradient)"
              />
            </mask>
          </defs>

          {/* Group 1: Static background paths (dim white) */}
          <g>
            {animatedPaths.map((path) => (
              <path
                key={`bg-${path.id}`}
                d={path.d}
                stroke="white"
                strokeWidth="1.5"
                strokeOpacity="0.1"
              />
            ))}
            <path
              d={insightPath.d}
              stroke="white"
              strokeWidth="1.5"
              strokeOpacity="0.1"
            />
          </g>

          {/* Group 2: Colored, masked pulse lines */}
          <g>
            {animatedPaths.map((path) => (
              <path
                key={`pulse-${path.id}`}
                d={path.d}
                stroke={path.color.hex}
                strokeWidth="1.5"
                strokeOpacity="0.8"
                mask={`url(#pulse-mask-${path.id})`}
              />
            ))}
            {/* The yellow insight pulse */}
            <path
              d={insightPath.d}
              stroke="#fde047" // yellow-300
              strokeWidth="1.5"
              strokeOpacity="0.8"
              mask="url(#pulse-mask-insight)"
            />
          </g>
        </svg>

        {/* 2. The Animated Particles (HTML divs) */}
        {animatedPaths.map((path) => {
          const Icon = ICONS[path.icon];
          return (
            <div
              key={path.id}
              className={`particle-${path.id} absolute w-7 h-7 ${path.color.bg} ${path.color.glow}
                          flex items-center justify-center rounded-full 
                          shadow-lg opacity-0`}
              style={{ top: 0, left: 0 }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
          );
        })}

        {/* The outgoing "Insight" particle */}
        <div
          className="particle-insight absolute w-5 h-5 bg-yellow-300 
                     rounded-full shadow-lg shadow-yellow-300/70
                     flex items-center justify-center opacity-0"
          style={{ top: 0, left: 0 }}
        >
          <Sparkles className="w-3 h-3 text-yellow-900" />
        </div>

        {/* 3. The Central Box */}
        <div
          className="absolute z-10 border rounded-xl 
                     border-white/20 bg-gray-800/50 backdrop-blur-md
                     shadow-2xl
                     flex items-center justify-center"
          style={{
            top: "224px",
            left: "474px",
            width: "52px",
            height: "52px",
          }}
        >
          <Lightbulb className="w-7 h-7 text-yellow-300" />
        </div>
      </div>
    </div>
  );
}
