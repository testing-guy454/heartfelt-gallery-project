import type { ReactNode } from "react";

export function Corkboard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`corkboard relative rounded-md ${className}`}
      style={{
        border: "14px solid transparent",
        borderImage:
          "linear-gradient(135deg, #6b3f1c, #a4693a 30%, #6b3f1c 60%, #8b562b) 1",
        boxShadow:
          "0 40px 80px -30px rgba(30,15,5,0.55), 0 12px 26px -12px rgba(30,15,5,0.4)",
      }}
    >
      {children}
    </div>
  );
}
