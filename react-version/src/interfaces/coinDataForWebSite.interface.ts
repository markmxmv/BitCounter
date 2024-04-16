export interface ICoinDataForWebSite {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: any;
  platforms: Platforms;
  detail_platforms: DetailPlatforms;
  block_time_in_minutes: number;
  hashing_algorithm: string;
  categories: string[];
  preview_listing: boolean;
  public_notice: any;
  additional_notices: any[];
  description: Description;
  links: Links;
  image: Image;
  country_origin: string;
  genesis_date: string;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  watchlist_portfolio_users: number;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  public_interest_stats: PublicInterestStats;
  status_updates: any[];
  last_updated: string;
}

export interface Platforms {
  "": string;
}

export interface DetailPlatforms {
  "": GeneratedType;
}

export interface GeneratedType {
  decimal_place: any;
  contract_address: string;
}

export interface Description {
  en: string;
}

export interface Links {
  homepage: string[];
  blockchain_site: string[];
  official_forum_url: string[];
  chat_url: string[];
  announcement_url: string[];
  twitter_screen_name: string;
  facebook_username: string;
  bitcointalk_thread_identifier: any;
  telegram_channel_identifier: string;
  subreddit_url: string;
  repos_url: ReposUrl;
}

export interface ReposUrl {
  github: string[];
  bitbucket: any[];
}

export interface Image {
  thumb: string;
  small: string;
  large: string;
}

export interface PublicInterestStats {
  alexa_rank: number;
  bing_matches: any;
}
