/**
 * Top 500 stocks by market cap
 * Source: S&P 500 + major tech stocks
 * Updated: 2024
 */
export const TOP_500_STOCKS = [
  // Mega cap (>$1T)
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',

  // Large cap tech
  'AVGO', 'ORCL', 'ADBE', 'CRM', 'CSCO', 'ACN', 'AMD', 'INTC', 'IBM', 'QCOM',
  'TXN', 'INTU', 'NOW', 'AMAT', 'MU', 'ADI', 'LRCX', 'KLAC', 'SNPS', 'CDNS',
  'MRVL', 'FTNT', 'PANW', 'CRWD', 'WDAY', 'TEAM', 'DDOG', 'NET', 'SNOW', 'PLTR',

  // Finance
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS', 'BLK', 'SCHW', 'C',
  'AXP', 'SPGI', 'CB', 'PGR', 'MMC', 'AON', 'TFC', 'USB', 'PNC', 'BK',

  // Healthcare
  'LLY', 'UNH', 'JNJ', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'PFE', 'BMY',
  'AMGN', 'CVS', 'CI', 'MDT', 'GILD', 'REGN', 'VRTX', 'ISRG', 'BSX', 'SYK',

  // Consumer
  'WMT', 'HD', 'PG', 'KO', 'PEP', 'COST', 'MCD', 'NKE', 'DIS', 'CMCSA',
  'NFLX', 'SBUX', 'TGT', 'LOW', 'TJX', 'EL', 'MDLZ', 'CL', 'KMB', 'GIS',

  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HES',
  'BKR', 'HAL', 'DVN', 'FANG', 'MRO', 'APA', 'CTRA', 'EQT', 'PR', 'OVV',

  // Industrial
  'CAT', 'BA', 'HON', 'UPS', 'RTX', 'LMT', 'DE', 'UNP', 'GE', 'MMM',
  'ETN', 'ITW', 'EMR', 'CSX', 'NOC', 'FDX', 'NSC', 'WM', 'PH', 'TT',

  // Communication
  'T', 'VZ', 'TMUS', 'CHTR', 'EA', 'NXST', 'TTWO', 'MTCH', 'FOXA', 'PARA',

  // Materials
  'LIN', 'APD', 'SHW', 'ECL', 'NEM', 'FCX', 'DOW', 'DD', 'NUE', 'VMC',

  // Real Estate
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'WELL', 'DLR', 'O', 'SBAC',

  // Utilities
  'NEE', 'SO', 'DUK', 'AEP', 'SRE', 'D', 'EXC', 'XEL', 'ED', 'WEC',

  // Popular meme/retail stocks
  'GME', 'AMC', 'BB', 'NOK', 'PLTR', 'SOFI', 'HOOD', 'COIN', 'RIVN', 'LCID',

  // Crypto-related
  'MSTR', 'COIN', 'SQ', 'PYPL', 'RIOT', 'MARA', 'HUT', 'BITF',

  // Chinese ADRs
  'BABA', 'BIDU', 'JD', 'PDD', 'NIO', 'XPEV', 'LI', 'BILI', 'TME', 'IQ',

  // Emerging tech
  'RBLX', 'U', 'PATH', 'DOCU', 'ZM', 'SPOT', 'SQ', 'SHOP', 'UBER', 'LYFT',
  'ABNB', 'DASH', 'PINS', 'SNAP', 'TWLO', 'ZS', 'OKTA', 'MDB', 'ESTC', 'CFLT',

  // ETFs (popular for analysis)
  'SPY', 'QQQ', 'IWM', 'DIA', 'VOO', 'VTI', 'ARKK', 'ARKG', 'ARKF', 'SQQQ',
  'TQQQ', 'SPXL', 'SPXS', 'TNA', 'TZA', 'UVXY', 'VXX', 'SOXL', 'SOXS', 'FNGU',

  // Additional S&P 500 components
  'ADSK', 'ADM', 'ADP', 'AES', 'AFL', 'AIG', 'AIZ', 'AJG', 'AKAM', 'ALB',
  'ALGN', 'ALL', 'ALLE', 'ANET', 'ANSS', 'ANTM', 'AON', 'AOS', 'APA', 'APH',
  'APTV', 'ARE', 'ATO', 'ATVI', 'AVB', 'AVGO', 'AVY', 'AWK', 'AXP', 'AZO',
  'BAX', 'BBWI', 'BBY', 'BDX', 'BEN', 'BF.B', 'BIIB', 'BIO', 'BKR', 'BLK',
  'BLL', 'BMY', 'BR', 'BRO', 'BSX', 'BWA', 'BXP', 'CAG', 'CAH', 'CARR',
  'CAT', 'CB', 'CBOE', 'CBRE', 'CCI', 'CCL', 'CDAY', 'CDNS', 'CDW', 'CE',
  'CEG', 'CF', 'CFG', 'CHD', 'CHRW', 'CHTR', 'CI', 'CINF', 'CL', 'CLX',
  'CMA', 'CMCSA', 'CME', 'CMG', 'CMI', 'CMS', 'CNC', 'CNP', 'COF', 'COO',
  'COP', 'COST', 'CPB', 'CPRT', 'CPT', 'CRL', 'CRM', 'CSCO', 'CSGP', 'CSX',
  'CTAS', 'CTLT', 'CTRA', 'CTSH', 'CTVA', 'CVS', 'CVX', 'CZR', 'D', 'DAL',
  'DD', 'DE', 'DELL', 'DFS', 'DG', 'DGX', 'DHI', 'DHR', 'DIS', 'DLR',
  'DLTR', 'DOV', 'DOW', 'DPZ', 'DRI', 'DTE', 'DUK', 'DVA', 'DVN', 'DXCM',
  'EA', 'EBAY', 'ECL', 'ED', 'EFX', 'EIX', 'EL', 'EMN', 'EMR', 'ENPH',
  'EOG', 'EPAM', 'EQIX', 'EQR', 'EQT', 'ES', 'ESS', 'ETN', 'ETR', 'ETSY',
  'EVRG', 'EW', 'EXC', 'EXPD', 'EXPE', 'EXR', 'F', 'FANG', 'FAST', 'FCX',
  'FDS', 'FDX', 'FE', 'FFIV', 'FI', 'FICO', 'FIS', 'FISV', 'FITB', 'FLT',
  'FMC', 'FOX', 'FOXA', 'FRC', 'FRT', 'FTNT', 'FTV', 'GD', 'GE', 'GEHC',
  'GEN', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GOOGL', 'GPC', 'GPN',
  'GRMN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN', 'HCA', 'HD', 'HES', 'HIG',
  'HII', 'HLT', 'HOLX', 'HON', 'HPE', 'HPQ', 'HRL', 'HSIC', 'HST', 'HSY',
  'HUBB', 'HUM', 'HWM', 'IBM', 'ICE', 'IDXX', 'IEX', 'IFF', 'ILMN', 'INCY',
  'INTC', 'INTU', 'INVH', 'IP', 'IPG', 'IQV', 'IR', 'IRM', 'ISRG', 'IT',
  'ITW', 'IVZ', 'J', 'JBHT', 'JBL', 'JCI', 'JKHY', 'JNJ', 'JNPR', 'JPM',
  'K', 'KDP', 'KEY', 'KEYS', 'KHC', 'KIM', 'KLAC', 'KMB', 'KMI', 'KMX',
  'KO', 'KR', 'KVUE', 'L', 'LDOS', 'LEN', 'LH', 'LHX', 'LIN', 'LKQ',
  'LLY', 'LMT', 'LNC', 'LNT', 'LOW', 'LRCX', 'LULU', 'LUV', 'LVS', 'LW',
  'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCHP', 'MCK', 'MCO',
  'MDLZ', 'MDT', 'MET', 'META', 'MGM', 'MHK', 'MKC', 'MKTX', 'MLM', 'MMC',
  'MMM', 'MNST', 'MO', 'MOH', 'MOS', 'MPC', 'MPWR', 'MRK', 'MRNA', 'MRO',
];

/**
 * Check if a symbol is in the top stocks list
 */
export function isTopStock(symbol: string): boolean {
  return TOP_500_STOCKS.includes(symbol.toUpperCase());
}

/**
 * Get total number of top stocks
 */
export function getTopStocksCount(): number {
  return TOP_500_STOCKS.length;
}
