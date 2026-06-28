import React from "react";
import { OXMark } from "../brand/OXMark.jsx";

/**
 * OXCredential — the membership credential. `physical` = oxidized copper plate;
 * `digital` = on-chain (Ink + Oxide glow). The only component permitted the
 * card radius + gradient. `verified` shows the on-chain live indicator.
 */
export function OXCredential({ material = "digital", memberNumber, fields = [], strip, verified = false, style, ...rest }) {
  return (
    <div className={"ox-cred ox-cred--" + material} style={style} {...rest}>
      {material === "digital" && verified && <span className="ox-cred__live">Verified on-chain</span>}
      <div className="ox-cred__head">
        <div className="ox-cred__doctype">
          OX Member of Record
          <span className="sub">{material === "physical" ? "Soulbound · non-transferable" : "ERC-721 · Base L2 · soulbound"}</span>
        </div>
        <OXMark as="flag" size={26} color="currentColor" />
      </div>
      <div className="ox-cred__body">
        <div className="ox-cred__num">{memberNumber}</div>
        <div className="ox-cred__fields">
          {fields.map((f, i) => (
            <div className="r" key={i}>
              <span className="l">{f.label}</span>
              <span className="v">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
      {strip && <div className="ox-cred__strip">{strip}</div>}
    </div>
  );
}
