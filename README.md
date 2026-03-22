# Handshake — P2P Marketplace on Monad

Marketplace P2P descentralizado na blockchain Monad. Vendedores listam produtos como NFTs, compradores fazem ofertas em MON. O pagamento fica em escrow no smart contract até confirmação presencial de ambas as partes. Inclui BNPL on-chain (Buy Now Pay Later) via LendingPool.

---

## Contratos Deployados (Monad Testnet)

| Contrato | Endereco |
|---|---|
| `MonadMarketplace` | [`0xc107F34F1E8Bc97B0d534258457D031333C8359B`](https://testnet.monadscan.com/address/0xc107F34F1E8Bc97B0d534258457D031333C8359B) |
| `LendingPool` | [`0x7a37a8a2479bd9Fbb171e4D9F00E72B099FD2a47`](https://testnet.monadscan.com/address/0x7a37a8a2479bd9Fbb171e4D9F00E72B099FD2a47) |

- **Network:** Monad Testnet (chainId `10143`)
- **RPC:** `https://testnet-rpc.monad.xyz`
- **Explorer:** https://testnet.monadscan.com
- **Token nativo:** MON (18 decimals)

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)              │
│                                                 │
│  /            → Grid de listings ativos         │
│  /sell        → Listar produto como NFT         │
│  /product/[id]→ Detalhes, ofertas, escrow       │
│  /my-deals    → Minhas vendas e compras         │
│  /my-loans    → Meus emprestimos (BNPL)         │
│  /pool        → Pool de liquidez                │
│  /profile     → Perfil do usuario              │
└───────────────────┬─────────────────────────────┘
                    │ wagmi v2 + viem + RainbowKit
                    │
┌───────────────────▼─────────────────────────────┐
│              Monad Testnet (EVM)                 │
│                                                 │
│  ┌──────────────────────┐  ┌───────────────────┐│
│  │  MonadMarketplace    │  │   LendingPool     ││
│  │  (ERC-721 + Escrow)  │◄─┤  (BNPL / Credit) ││
│  │                      │  │                   ││
│  │  listItem            │  │  depositCollateral││
│  │  makeOffer           │  │  financePurchase  ││
│  │  makeFinancedOffer   │  │  repayLoan        ││
│  │  acceptOffer         │  │  liquidate        ││
│  │  confirmDelivery     │  │                   ││
│  │  cancelDeal          │  │  LTV: 70%         ││
│  │                      │  │  Juros: 5%        ││
│  │  Taxa plataforma: 1% │  │  Prazo: 30 dias   ││
│  └──────────────────────┘  └───────────────────┘│
└─────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│             IPFS via Pinata                      │
│  Imagens e metadados dos NFTs                   │
└─────────────────────────────────────────────────┘
```

---

## Fluxo de Compra

### Compra normal
1. Vendedor chama `listItem` → NFT mintado + listing criado
2. Comprador chama `makeOffer` enviando MON (fica em escrow)
3. Vendedor chama `acceptOffer` → outras ofertas sao reembolsadas automaticamente
4. Entrega presencial ocorre
5. Ambos chamam `confirmDelivery` → escrow liberado para o vendedor (menos 1% de taxa)

### Compra financiada (BNPL)
1. Comprador deposita colateral no `LendingPool` (`depositCollateral`)
2. Comprador chama `makeFinancedOffer` com entrada minima (30% do preco)
3. `LendingPool.financePurchase` cobre o restante direto no escrow
4. Vendedor recebe 100% na hora apos `confirmDelivery`
5. Comprador tem 30 dias para pagar a divida via `repayLoan`
6. Se nao pagar: `liquidate` confisca o colateral

### Cancelamento
- Qualquer parte pode chamar `cancelDeal` → MON devolvido ao comprador
- Timeout automatico de 3 dias sem confirmacao libera cancelamento

---

## Stack Tecnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | v19 |
| Web3 | wagmi v2 + viem v2 |
| Wallet UI | RainbowKit v2 |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Toasts | Sonner |
| IPFS | Pinata SDK v2 |
| Linguagem | TypeScript |

---

## Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id

PINATA_JWT=seu_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=seu_gateway.mypinata.cloud
```

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: obtenha em https://cloud.walletconnect.com
- `PINATA_JWT`: obtenha em https://app.pinata.cloud/keys
- `NEXT_PUBLIC_PINATA_GATEWAY`: gateway dedicado Pinata (opcional, usa ipfs.io como fallback)

---

## Como Rodar

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Build para producao
npm run build
npm start
```

Acesse http://localhost:3000

---

## Estrutura de Arquivos

```
├── app/                        # Next.js App Router
│   ├── page.tsx                # Home — grid de listings
│   ├── sell/page.tsx           # Listar produto
│   ├── product/[id]/page.tsx   # Detalhes do produto
│   ├── my-deals/page.tsx       # Minhas negociacoes
│   ├── my-loans/page.tsx       # Meus emprestimos (BNPL)
│   ├── pool/page.tsx           # Pool de liquidez
│   ├── profile/page.tsx        # Perfil do usuario
│   └── api/pinata/             # API routes para upload IPFS
│       ├── image/route.ts      # Upload de imagem
│       └── json/route.ts       # Upload de metadados
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   └── ProductCard.tsx
│   ├── hooks/
│   │   ├── useMarketplace.ts   # Interacoes com MonadMarketplace
│   │   ├── useLendingPool.ts   # Interacoes com LendingPool
│   │   ├── useIPFSImage.ts     # Resolucao de imagens IPFS
│   │   └── useOnChainReputation.ts
│   ├── lib/
│   │   ├── contract.ts         # ABI + endereco do MonadMarketplace
│   │   ├── lendingPool.ts      # ABI + endereco do LendingPool
│   │   ├── wagmi.ts            # Config wagmi + chains Monad
│   │   ├── ipfs.ts             # Helpers Pinata/IPFS
│   │   ├── errors.ts           # Tratamento de erros de contrato
│   │   └── i18n/               # Internacionalizacao (pt/en)
│   └── providers/
│       └── Web3Provider.tsx    # RainbowKit + wagmi + QueryClient
```

---

## Regras de Negocio dos Contratos

### MonadMarketplace
- Cada produto listado minta um NFT ERC-721
- Multiplas ofertas por listing sao aceitas simultaneamente
- Ao aceitar uma oferta, todas as outras sao reembolsadas automaticamente
- Taxa de plataforma: **1%** (100 bps) sobre deals completados
- Timeout de escrow: **3 dias** (`DEAL_TIMEOUT`)
- `ReentrancyGuard` em todas as funcoes que movem MON

### LendingPool
- LTV (Loan-to-Value): **70%** — comprador pode pegar emprestimo de ate 70% do colateral depositado
- Taxa de juros: **5%** fixo sobre o principal
- Prazo de pagamento: **30 dias**
- Entrada minima: **30%** do preco total
- Vendedor nunca e afetado — recebe 100% imediatamente
- Risco fica com comprador e pool de liquidez
