import React from "react";
import "../styles/card.css";

const Card = ({
  title,
  children,
  className = "",
  elevated = false,
  interactive = false,
  icon = null,
  footer = null,
  headerAction = null,
  onClick = null,
}) => {
  return (
    <div
      className={`
        fe-card 
        ${elevated ? "fe-card-elevated" : ""} 
        ${interactive ? "fe-card-interactive" : ""}
        ${className}
      `}
      onClick={interactive && onClick ? onClick : undefined}
    >
      {(title || icon || headerAction) && (
        <div className="fe-card-header">
          <div className="fe-card-header-left">
            {icon && <div className="fe-card-icon">{icon}</div>}
            {title && <h3 className="fe-card-title">{title}</h3>}
          </div>
          {headerAction && (
            <div className="fe-card-header-action">{headerAction}</div>
          )}
        </div>
      )}

      <div className="fe-card-content">{children}</div>

      {footer && <div className="fe-card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
