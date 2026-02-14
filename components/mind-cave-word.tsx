import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 70.366" {...props}>
    <text
      xmlSpace="preserve"
      x={256}
      y={291.442}
      style={{
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: 700,
        fontStretch: "normal",
        fontSize: "94.078px",
        fontFamily: "var(--font-space-mono), monospace",
        textAlign: "center",
        writingMode: "horizontal-tb",
        direction: "ltr",
        textAnchor: "middle",
        fill: "currentColor",
        strokeWidth: 0.490761,
      }}
      transform="matrix(1.00541 0 0 .99462 0 -220.817)"
    >
      <tspan
        x={256}
        y={291.442}
        style={{
          fontStyle: "normal",
          fontVariant: "normal",
          fontWeight: 700,
          fontStretch: "normal",
          fontSize: "94.078px",
          fontFamily: "var(--font-space-mono), monospace",
          strokeWidth: 0.490762,
        }}
      >
        {"DevAtlas"}
      </tspan>
    </text>
  </svg>
);
export default SvgComponent;
