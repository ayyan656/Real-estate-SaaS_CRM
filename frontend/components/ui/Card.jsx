import React from "react";

export const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <div
      className={`bg-surface dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-200 ${className}`}
    >
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
};
