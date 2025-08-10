import logoUrl from "../assets/logo.png";
import styles from "../styles/Branding.module.css";

export function Branding() {
  return (
    <section className={styles["branding-container"]}>
      <img className={styles["logo"]} src={logoUrl} alt="termdo's logo" />
      <div className={styles["branding-text"]}>
        <h1 className={styles["title"]}>termdo</h1>
        <h2 className={styles["subtitle"]}>task management in terminal</h2>
      </div>
    </section>
  );
}
