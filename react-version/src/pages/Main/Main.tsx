import axios from "axios";
import CoinPlate from "../../components/CoinPlate/CoinPlate";
import styles from "./Main.module.css";

const loadList = async () => {
  const { data } = await axios.get(`/src/assets/coinList.json`);
  console.log(data);
};

function Main() {
  loadList();

  return (
    <div className={styles["main-page"]}>
      <div className={styles["currency-chart"]}>
        <CoinPlate />
      </div>
      <div></div>
    </div>
  );
}

export default Main;
