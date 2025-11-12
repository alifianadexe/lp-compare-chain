# Historical Prices Data

This folder contains historical price data for the crypto pair comparison dashboard.

## File Format

`historical-prices.json` - Contains historical USD prices for HYPE, SUI, and SOL tokens.

### Structure

```json
{
  "YYYY-MM-DD": {
    "HYPE": 25.5,
    "SUI": 3.2,
    "SOL": 210.0
  }
}
```

## How to Update

1. Open `historical-prices.json`
2. Add a new date entry with the current prices
3. Format: `"YYYY-MM-DD"` (e.g., `"2024-11-12"`)
4. Include all three tokens: HYPE, SUI, SOL
5. Use USD prices (numbers only, no dollar signs)

### Example Entry

```json
{
  "2024-11-12": {
    "HYPE": 38.8,
    "SUI": 2.0,
    "SOL": 155.69
  }
}
```

## Features

- **Auto-matching**: If exact date not found, the closest date will be used
- **No API limits**: All data is stored locally
- **Manual updates**: You control when and what prices to add

## Tips

- Add entries regularly (daily, weekly, or monthly)
- Keep dates in YYYY-MM-DD format
- Prices should be in USD
- More historical data = better insights!
