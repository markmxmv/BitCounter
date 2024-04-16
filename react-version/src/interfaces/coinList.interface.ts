import { coinData } from "./coinData.interface";

export interface ICoinList {
  isLoading: boolean;
  list: coinData[];
  error: null;
}
