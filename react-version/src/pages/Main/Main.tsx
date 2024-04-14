import { useEffect } from "react";
import CoinPlate from "../../components/CoinPlate/CoinPlate";
import styles from "./Main.module.css";
import { loadList } from "../../store/coinList.slice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

function Main() {
  const list = useSelector((state: RootState) => state.coinList.list);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(loadList());
  }, [dispatch]);

  return (
    <div className={styles["main-page"]}>
      <div className={styles["currency-chart"]}>
        <CoinPlate />
      </div>
      <div>{JSON.stringify(list)}</div>
    </div>
  );
}

export default Main;
