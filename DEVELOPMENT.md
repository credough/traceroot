# TraceRoot — Testnet Deployment

## Contract ID
`CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE`

## Network
Stellar Testnet

## Stellar Expert
https://stellar.expert/explorer/testnet/contract/CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE

## Deployer Public Key
`GA3WVUVT7PEQAR6JCJEGNTM4TSHA4SVUSOINBI7VK2ISBPRU535ZWPRA`

## Date
2026-04-18

## WASM
- File: `target/wasm32v1-none/release/traceroot.wasm`
- Size: 4,982 bytes
- Hash: `aa9781b94b31f22307a4cfd62150a3c78e82b8511c5da2aeadaf1e1f3599deab`

## Build Command
stellar contract build

## Deploy Command
stellar contract deploy 
--wasm target/wasm32v1-none/release/traceroot.wasm 
--source my-key 
--network testnet

## Live Transaction
https://stellar.expert/explorer/testnet/tx/4f081ff96851e8319095836bb9a014a48fe3eb9e6fc1830c64c9c5185c4f140d