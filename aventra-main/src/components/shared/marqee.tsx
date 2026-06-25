import React from "react";
import Marquee from "react-fast-marquee";

function Marqee({ children }: { children: React.ReactNode }) {
  return (
    <Marquee pauseOnHover loop={0} play={true} speed={100}>
      {children}
    </Marquee>
  );
}

export default Marqee;
