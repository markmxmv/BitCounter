import { useEffect } from "react";
import CoinPlate from "../../components/CoinPlate/CoinPlate";
import styles from "./Main.module.css";
import { loadList } from "../../store/coinList.slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { loadCoinWebsite } from "../../store/chosenCoin.slice";
import CoinList from "../../components/CoinList/CoinList";
import Chart from "../../components/Chart/Chart";
import SearchAndFavorites from "../../components/Search/SearchAndFavorites";

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
        <Chart/>
      </div>
      <div className={styles["bottom"]}>
        <SearchAndFavorites/>
        <CoinList/>
      </div>
    </div>
  );
}

export default Main;
