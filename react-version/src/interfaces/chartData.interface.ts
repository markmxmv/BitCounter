export interface IChartData {
  prices: number[][]
  market_caps: number[][]
  total_volumes: number[][]
}

export interface IChartDataConverted {
    time: string;
    value: number;
}