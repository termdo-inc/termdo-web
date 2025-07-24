import { Terminal } from "./components/Terminal.tsx";
import styles from "./styles/App.module.css";
import "./styles/index.css";

export function App() {
  return (
    <div className={styles["main"]}>
      <div>
        <h1 className={styles["title"]}>termdo</h1>
        <p className={styles["subtitle"]}>
          Task management in your terminal
        </p>
      </div>
      <div className={styles["terminalWrapper"]}>
        <Terminal />
      </div>
    </div>
  );
}
