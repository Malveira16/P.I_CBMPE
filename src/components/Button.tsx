type ButtonProps = {
  text: string | React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  style?: React.CSSProperties;
};

export function Button({ text, onClick, type = "button", variant = "primary", style }: ButtonProps) {
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
    },
    secondary: {
      backgroundColor: "#f1f5f9",
      color: "#334155",
      border: "1px solid #cbd5e1",
    },
    danger: {
      backgroundColor: "#dc2625",
      color: "#fff",
      border: "none",
    },
  };

  const base: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    ...variants[variant],
    ...style,
  };

  return (
    <button type={type} onClick={onClick} style={base}>
      {text}
    </button>
  );
}
