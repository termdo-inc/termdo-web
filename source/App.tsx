import { Terminal } from "./components/Terminal.tsx";
import styles from "./styles/App.module.css";
import "./styles/index.css";

export function App() {
  return (
    <div className={styles["container"]}>
      <h1 className={styles["title"]}>termdo</h1>
      <div className={styles["terminalWrapper"]}>
        <Terminal />
      </div>
    </div>
  );
}
