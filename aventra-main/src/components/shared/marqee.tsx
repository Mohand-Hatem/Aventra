"use client";

import React from "react";
import Marquee from "react-fast-marquee";

function Marqee({ children }: { children: React.ReactNode }) {
  return (
    // Force LTR so transform-based scroll isn't flipped by page dir="rtl"
    <div dir="ltr" className="overflow-hidden">
      <Marquee
        pauseOnHover
        loop={0}
        play
        speed={100}
        autoFill
        direction="left"
        gradient={false}
      >
        {children}
      </Marquee>
    </div>
  );
}

export default Marqee;
