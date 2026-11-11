function Button({ variant = "primary", size = "medium", block = false, onClick, type = "button", disabled, children }) {
  const className = `btn btn-${variant} btn-${size}${block ? " btn-block" : ""}`;
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
