import { AppConfig } from "../app/config/AppConfig";
import logoDarkUrl from "../assets/logo-dark.png";
import styles from "../styles/Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className={styles["footer-container"]}>
        <p>
          © {year} termdo Inc. — {AppConfig.ENV} ({AppConfig.VER})
        </p>
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
