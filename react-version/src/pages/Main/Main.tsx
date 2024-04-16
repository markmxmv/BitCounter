import { useEffect } from "react";
import CoinPlate from "../../components/CoinPlate/CoinPlate";
import styles from "./Main.module.css";
import { loadList } from "../../store/coinList.slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import CoinList from "../../components/CoinList/CoinList";
import { loadCoinWebsite } from "../../store/chosenCoin.slice";

function Main() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(loadList());
    dispatch(loadCoinWebsite());
  }, [dispatch]);

  return (
    <div className={styles["main-page"]}>
      <div className={styles["top"]}>
        <CoinPlate />
        <div className={styles.test}></div>
      </div>
      <div className={styles["bottom"]}>
        <CoinList />
      </div>
    </div>
  );
}

export default Main;
