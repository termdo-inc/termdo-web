import logoDarkUrl from "../assets/logo-dark.png";
import styles from "../styles/Footer.module.css";

export function Footer() {
  return (
    <footer>
      <div className={styles["footer-container"]}>
        <p>© 2025 termdo Inc.</p>
        <img
          className={styles["footer-logo"]}
          src={logoDarkUrl}
          alt="termdo's logo"
        />
        <p>Emrecan Karaçayır</p>
      </div>
    </footer>
  );
}
