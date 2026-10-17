import styles from "./badge.module.css";

/**
 * CSS Modules: `styles.badge` is a generated, unique class name, so this `.badge` can never
 * collide with a `.badge` somewhere else in the app.
 */
export function Badge({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "success" | "danger" }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
