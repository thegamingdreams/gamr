export default function Panel({ title, eyebrow, children, className = '' }) {
  return <section className={`panel ${className}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h2>{title}</h2>}{children}</section>;
}
