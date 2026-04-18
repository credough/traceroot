# TraceRoot

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Network: Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-blue.svg)
![Built with Soroban](https://img.shields.io/badge/Built%20with-Soroban-blueviolet.svg)
![Rust](https://img.shields.io/badge/Rust-1.88.0-orange.svg)
![Status: Live](https://img.shields.io/badge/Status-Live%20on%20Testnet-brightgreen.svg)
![Region: Philippines](https://img.shields.io/badge/Region-Philippines-yellow.svg)

On-chain harvest provenance for cacao farmers — built on Stellar Soroban.

---

## Problem

A cacao farmer in Davao, Philippines earns commodity-level prices (PHP 90/kg)
despite supplying to premium chocolate brands, because there is no verifiable
proof of origin or ethical sourcing that the farmer can own and present. The
traceability data lives only with the exporter, not the farmer.

## Solution

TraceRoot lets farmers register each harvest batch on-chain via a Soroban
smart contract, generating a tamper-proof provenance record containing
location, date, farm ID, and certifications. Brands and consumers can verify
this record on-chain, unlocking premium buyer relationships and fairtrade
price premiums paid directly to the farmer's Stellar wallet.

---

## Contract Details

| Field | Value |
|---|---|
| Contract ID | `CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE` |
| Network | Stellar Testnet |
| WASM Size | 4,982 bytes |
| WASM Hash | `aa9781b94b31f22307a4cfd62150a3c78e82b8511c5da2aeadaf1e1f3599deab` |
| Stellar Expert | [View Contract](https://stellar.expert/explorer/testnet/contract/CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE) |

---

## Stellar Features Used

| Feature | Purpose |
|---|---|
| Soroban smart contracts | Provenance registry and tamper detection |
| Persistent storage | BatchRecord keyed by unique batch hash |
| On-chain events | REGISTER, VERIFY, and PAYMENT event emission |
| XLM / USDC transfers | Premium payment from buyer to farmer wallet |
| Custom tokens | Harvest batch asset per lot |
| Trustlines | Farmer accepts buyer-issued payment asset |

---

## Target Users

- Cacao, coffee, and coconut farmers in Mindanao PH, Sumatra ID, and Northern Thailand
- Export-facing cooperatives and fairtrade certifiers
- International specialty buyers such as chocolate brands and specialty coffee roasters seeking verified supply chains

---

## Contract Functions

### `init(admin: Address)`

Initializes the contract and sets the admin address. Called once after deploy.

### `register_batch(farmer, batch_hash, farm_id, location, date)`

Farmer submits harvest data. Stores a BatchRecord on-chain keyed by a unique
batch hash. Rejects duplicate hashes to prevent tampering. Emits a REGISTER event.

### `verify_batch(buyer, batch_hash)`

Buyer authenticates a batch. Marks the record as verified and emits a VERIFY
event. Returns true on success.

### `link_payment(buyer, batch_hash)`

Records on-chain that a premium payment was released to the farmer's wallet
after verification. Emits a PAYMENT event.

### `get_batch(batch_hash)`

Read-only function. Returns the full BatchRecord for a given hash. Used by
the frontend provenance page and QR scanner.

---

## Error Codes

| Code | Value | Meaning |
|---|---|---|
| `AlreadyRegistered` | 1 | Batch hash already exists on-chain |
| `BatchNotFound` | 2 | No record found for the given hash |
| `AlreadyVerified` | 3 | Batch has already been verified |
| `AlreadyPaid` | 4 | Payment has already been linked |
| `Unauthorized` | 5 | Caller is not permitted for this action |

---

## Prerequisites

| Tool | Version |
|---|---|
| Rust | 1.88.0 (pinned via rust-toolchain.toml) |
| Stellar CLI | 25.2.0 or newer |
| WASM target | wasm32v1-none |
| Node.js | 18.0.0 or newer |

Install the WASM target:

```bash
rustup target add wasm32v1-none
```

---

## Project Structure

```
traceroot/
├── contracts/
│   └── traceroot/
│       ├── src/
│       │   ├── lib.rs        # Soroban smart contract
│       │   └── test.rs       # Unit tests
│       └── Cargo.toml        # Contract package config
├── Cargo.toml                # Workspace config
├── rust-toolchain.toml       # Pinned Rust version
├── DEPLOYMENT.md             # Live contract details
└── README.md
```

---

## Build

```bash
stellar contract build
```

Output will be at:

```
target/wasm32v1-none/release/traceroot.wasm
```

---

## Test

```bash
cargo test
```

Expected output:

```
test test::tests::test_register_batch_success ... ok
test test::tests::test_duplicate_batch_rejected ... ok
test test::tests::test_storage_reflects_correct_state ... ok

test result: ok. 3 passed; 0 failed
```

---

## Deploy to Testnet

Generate an identity and fund your account:

```bash
stellar keys generate --global my-key --network testnet
stellar keys fund my-key --network testnet
```

Deploy the contract:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/traceroot.wasm \
  --source my-key \
  --network testnet
```

---

## Sample CLI Invocations

Initialize the contract:

```bash
stellar contract invoke \
  --id CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE \
  --source my-key \
  --network testnet \
  -- \
  init \
  --admin YOUR_G_ADDRESS
```

Register a harvest batch:

```bash
stellar contract invoke \
  --id CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE \
  --source my-key \
  --network testnet \
  -- \
  register_batch \
  --farmer YOUR_G_ADDRESS \
  --batch_hash 0101010101010101010101010101010101010101010101010101010101010101 \
  --farm_id "FARM-DAV-0042" \
  --location "7.0731,125.6128" \
  --date 1700000000
```

Verify a batch:

```bash
stellar contract invoke \
  --id CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE \
  --source my-key \
  --network testnet \
  -- \
  verify_batch \
  --buyer YOUR_G_ADDRESS \
  --batch_hash 0101010101010101010101010101010101010101010101010101010101010101
```

Retrieve a batch record:

```bash
stellar contract invoke \
  --id CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE \
  --source my-key \
  --network testnet \
  -- \
  get_batch \
  --batch_hash 0101010101010101010101010101010101010101010101010101010101010101
```

---

## Suggested MVP Timeline

| Day | Milestone |
|---|---|
| 1 | Environment setup, contract scaffold, toolchain pinning |
| 2 | Core contract implementation (lib.rs, test.rs) |
| 3 | Build, deploy to testnet, live invocation verification |
| 4 | README, documentation, Rise In submission |

---

## Vision and Purpose

TraceRoot addresses a structural imbalance in agricultural supply chains
where farmers produce traceable, high-quality goods but lack the
infrastructure to prove and own that traceability. By anchoring provenance
records on Stellar, TraceRoot gives farmers a portable, tamper-proof
credential they can present to any buyer globally — without relying on
exporters or intermediaries. The long-term vision includes a QR code on
physical packaging that links to a public provenance page pulling live
on-chain data, scannable by end consumers at point of sale in Japan,
the EU, or US markets.

---

## Resources

| Resource | Link |
|---|---|
| Stellar Docs | https://developers.stellar.org |
| Soroban SDK | https://docs.rs/soroban-sdk |
| Stellar CLI Docs | https://developers.stellar.org/docs/tools/stellar-cli |
| Stellar Expert Testnet | https://stellar.expert/explorer/testnet |
| Stellar Lab | https://lab.stellar.org |
| Rise In Programs | https://risein.com/programs |

---

## License

MIT License. See [LICENSE](LICENSE) for details.