import { useSelector } from "react-redux";
import styles from "./CoinPlate.module.css";
import cn from "classnames";
import { RootState } from "../../store/store";

function CoinPlate() {
  const coinList = useSelector((state: RootState) => state.coinList);

  function getNegativeOrPositivePercentage(change: number) {
    if (change < 0) {
      return "negative";
    }
    return "positive";
  }

  return (
    <>
      <div className={styles["chart__title__wrapper"]}>
        <div className={styles["chart__title"]}>
          <div className={styles["currency-pair"]}>
            <div className={styles["currency-logo__wrapper"]}>
              <img
                className={styles["currency-logo"]}
                src="${coinData.image}"
              />
            </div>
            <div className={styles["currency-pair__name"]}>BTC/USD</div>
          </div>
          <div className={styles["currency-price__wrapper"]}>
            <div className={styles["currency-price"]}>$74000</div>
            <div
              className={cn(
                styles["currency-price__24h"],
                getNegativeOrPositivePercentage(1)
              )}
            >
              <img
                className={styles["icon__24h"]}
                src={`/src/assets/24h-${getNegativeOrPositivePercentage(1)}.svg`}
              />
              2%
            </div>
          </div>
          <div className={styles["chart__title__info"]}>
            <div className={styles["chart__title__info__market-cap"]}>
              Market Cap: <span>$6755585</span>
            </div>
            <div className={styles["chart__title__info__volume-24h"]}>
              Volume 24h: <span>$64464646</span>
            </div>
            <div className={styles["chart__title__info__website"]}>
              Website:{" "}
              <a
                className={styles["chart__title__info__website__link"]}
                href="bitcoin.org"
                target="_blank"
              >
                website
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CoinPlate;
