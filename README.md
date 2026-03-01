# Тестовое задание — Blockchain Wallet API

> **Кратко:** нужно заполнить методы в одном файле — [`src/wallet/wallet.service.ts`](src/wallet/wallet.service.ts).
> Весь каркас уже готов: маршруты, провайдеры, Redis, валидация, Swagger — всё подключено и работает.
> Выбираешь любую знакомую тебе сеть, пишешь логику, сдаёшь. Вот и всё.

---

## Быстрый старт

```bash
yarn/pnpm i
cp .env.example .env        # выбрать сеть и вставить ключи (ниже — где их взять)
docker-compose up -d        # поднять Redis
npm run start:dev           # запустить приложение
```

Swagger с документацией всех эндпоинтов: **http://localhost:3000/api**

---

## Выбери сеть

Открой `.env` и установи `NETWORK=` одно из значений:

| Значение | Сеть | Рекомендуемые библиотеки |
|---|---|---|
| `ethereum` | Ethereum Mainnet | ethers.js / viem / web3.js |
| `bnb` | BNB Chain | ethers.js / viem / web3.js |
| `polygon` | Polygon | ethers.js / viem / web3.js |
| `solana` | Solana Mainnet | @solana/web3.js |
| `ton` | TON | @ton/ton |

Все библиотеки **уже установлены** и инициализированы в провайдерах — ключи API и RPC нужны только если хочешь что-то поменять.

---

## Что нужно реализовать

Все методы находятся в [`src/wallet/wallet.service.ts`](src/wallet/wallet.service.ts) и помечены комментарием `// TODO`.
Прямо под каждым TODO — пошаговый алгоритм и точные вызовы библиотек.

### Обязательно (минимум для любой сети)

| Метод | Маршрут | Что делает |
|---|---|---|
| `getBalance` | `GET /wallet/:address/balance` | Получить баланс кошелька, закэшировать на 30 сек |
| `getTransactions` | `GET /wallet/:address/transactions?limit=10` | Последние N транзакций, кэш 60 сек |
| `watchWallet` | `POST /wallets/watch` | Сохранить адрес в watchlist (Redis) |
| `getWatchedWallets` | `GET /wallets/watched` | Вернуть watchlist с актуальными балансами |

### Опционально (приветствуется, но не обязательно)

| Метод | Маршрут | Что делает |
|---|---|---|
| `getAlerts` | `GET /wallets/alerts` | Список алертов об изменении баланса |
| `getTokenBalances` | `GET /wallet/:address/tokens` | ERC-20 / SPL токены через Moralis |
| `getNfts` | `GET /wallet/:address/nfts` | NFT через Moralis (EVM) или Metaplex (Solana) |
| `WalletListener` | — | Обработчик события `wallet.balance.changed` |

---

## По сетям — что проверяется

### EVM (ethereum / bnb / polygon)

**Минимум:**
- `getBalance` — получить баланс через любой из провайдеров: `this.evm` (ethers.js), `this.viem` (viem), `this.web3` (web3.js)
- `getTransactions` — вызов Explorer API (Etherscan / BscScan / Polygonscan)
- Кэширование через `this.redis`

**Где взять бесплатный API ключ для транзакций:**
- ETH → https://etherscan.io/apis
- BNB → https://bscscan.com/apis
- POLYGON → https://polygonscan.com/apis

**Что проверяется:** умение работать с EVM RPC, форматирование BigInt wei → human-readable, базовое кэширование.

---

### Solana

**Минимум:**
- `getBalance` — `this.sol.connection.getBalance(new PublicKey(address))`
- `getTransactions` — `this.sol.connection.getSignaturesForAddress(pk, { limit })`
- Кэширование через `this.redis`

**API ключ не нужен** — используется публичный RPC.

**Что проверяется:** работа с `@solana/web3.js`, конвертация lamports → SOL, базовое кэширование.

---

### TON

**Минимум:**
- `getBalance` — `this.ton.client.getBalance(this.ton.parseAddress(address))`
- Кэширование через `this.redis`
- `watchWallet` + `getWatchedWallets`

*(История транзакций для TON — опционально, публичных API меньше)*

**Что проверяется:** умение работать с `@ton/ton`, конвертация nanoTON → TON, базовое кэширование.

---

## Как устроен код

```
src/
├── blockchain/
│   ├── providers/
│   │   ├── evm.provider.ts        ← ethers.js  (ETH/BNB/POLYGON)
│   │   ├── viem.provider.ts       ← viem        (ETH/BNB/POLYGON)
│   │   ├── web3.provider.ts       ← web3.js     (ETH/BNB/POLYGON)
│   │   ├── solana.provider.ts     ← @solana/web3.js
│   │   ├── ton.provider.ts        ← @ton/ton
│   │   ├── moralis.provider.ts    ← moralis     (токены и NFT)
│   │   └── metaplex.provider.ts   ← @metaplex-foundation/js (Solana NFT)
│   └── types/blockchain.types.ts  ← WalletBalance, Transaction, TokenBalance, NftItem...
├── redis/
│   └── redis.service.ts           ← готовый клиент: get / set / hset / hgetall / lpush / lrange
├── utils/
│   ├── decimal.utils.ts           ← formatBalance(raw, decimals), hasBalanceChanged()
│   └── validators/
│       └── is-wallet-address.validator.ts  ← @IsWalletAddress() для DTOs
└── wallet/
    ├── events/
    │   └── wallet-balance-changed.event.ts  ← payload события
    ├── wallet.controller.ts       ← все маршруты (трогать не нужно)
    ├── wallet.listener.ts         ← обработчик события (TODO — опционально)
    ├── wallet.service.ts          ← ВСЕ TODO ЗДЕСЬ
    └── dto/
        ├── watch-wallet.dto.ts
        └── get-transactions.dto.ts
```

Провайдер нужной сети инициализируется автоматически при старте — остальные просто пропускаются.

---

## Ожидаемые форматы ответов

**GET /wallet/:address/balance**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "balance": "1.523456",
  "symbol": "ETH",
  "network": "ethereum",
  "cached": false
}
```
Повторный запрос в течение 30 сек вернёт `"cached": true`.

---

**GET /wallet/:address/transactions?limit=5**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "transactions": [
    {
      "hash": "0xabc123...",
      "from": "0xd8dA6B...",
      "to": "0xAbcDef...",
      "value": "0.100000",
      "timestamp": 1700000000,
      "status": "success"
    }
  ],
  "network": "ethereum",
  "cached": false
}
```

---

**POST /wallets/watch**
```json
// request
{ "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "label": "Vitalik" }

// response 201
{ "success": true, "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }
```

---

**GET /wallets/watched**
```json
[
  {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "label": "Vitalik",
    "addedAt": 1700000000000,
    "balance": "1.523456",
    "symbol": "ETH"
  }
]
```

---

**GET /wallets/alerts** *(опционально)*
```json
[
  {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "network": "ethereum",
    "symbol": "ETH",
    "previousBalance": "1.000000",
    "currentBalance": "1.523456",
    "detectedAt": 1700001000000
  }
]
```

---

## Критерии оценки

Смотрим на качество кода, а не на количество реализованных фич.

**Обязательно:**
- Работают 4 основных эндпоинта
- Кэширование через Redis (TTL соблюдён)
- Корректное числовое форматирование (нет `0.000000000000001` из-за float)
- Базовая обработка ошибок

**Приятный бонус:**
- Реализованы опциональные методы (алерты, токены, NFT)
- Написан unit-тест хотя бы на один метод

---

## Тестовые адреса

| Сеть | Адрес | Примечание |
|---|---|---|
| ETH | `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` | Vitalik Buterin |
| BNB | `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` | тот же формат |
| Polygon | `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` | тот же формат |
| Solana | `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM` | публичный кошелёк |
| TON | `EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2` | публичный кошелёк |

---

## Сдача

Публичный репозиторий (GitHub / GitLab)