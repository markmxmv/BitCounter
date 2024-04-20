import { useSelector } from "react-redux";
import styles from "./CoinPlate.module.css";
import cn from "classnames";
import { RootState } from "../../store/store";

function CoinPlate() {
  const chosenCoin = useSelector((state: RootState) => state.chosenCoin);
  const coinList = useSelector((state: RootState) => state.coinList.list);
  const coinData = coinList.find((el) => el.symbol === chosenCoin.symbol);
  if (!coinData) {
    return <div>Loading...</div>;
  }

  function getNegativeOrPositivePercentage(change: number) {
    if (change < 0) {
      return "negative";
    }
    return "positive";
  }

  function getChosenCoinWebsite(url: string) {
    const arrUrl = url.split("/");
    return arrUrl[2];
  }

  return (
    <>
      <div className={styles["chart__title__wrapper"]}>
        <div className={styles["chart__title"]}>
          <div className={styles["currency-pair"]}>
            <div className={styles["currency-logo__wrapper"]}>
              <img className={styles["currency-logo"]} src={coinData.image} />
            </div>
            <div className={styles["currency-pair__name"]}>
              {coinData.symbol.toUpperCase()}/USD
            </div>
          </div>
          <div className={styles["currency-price__wrapper"]}>
            <div className={styles["currency-price"]}>
              ${coinData.current_price}
            </div>
            <div
              className={cn(
                styles["currency-price__24h"],
                getNegativeOrPositivePercentage(
                  Number(coinData.price_change_percentage_24h.toFixed(1))
                )
              )}
            >
              <img
                className={styles["icon__24h"]}
                src={`/src/assets/24h-${getNegativeOrPositivePercentage(Number(coinData.price_change_percentage_24h.toFixed(1)))}.svg`}
              />
              {Number(coinData.price_change_percentage_24h.toFixed(1))}%
            </div>
          </div>
          <div className={styles["chart__title__info"]}>
            <div className={styles["chart__title__info__market-cap"]}>
              Market Cap:{" "}
              <span className={styles["market-cap"]}>
                ${coinData.market_cap}
              </span>
            </div>
            <div className={styles["chart__title__info__volume-24h"]}>
              Volume 24h:{" "}
              <span className={styles["volume-24h"]}>
                ${coinData.total_volume}
              </span>
            </div>
            <div className={styles["chart__title__info__website"]}>
              Website:{" "}
              <a
                className={styles["chart__title__info__website__link"]}
                href={chosenCoin.website}
                target="_blank"
              >
                {getChosenCoinWebsite(chosenCoin.website)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CoinPlate;
