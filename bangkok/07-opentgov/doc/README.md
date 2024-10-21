# Documentation

#### Telegram Bot Service

- File: backend/src/services/telegram.js
- Description: Initializes and exports a Telegram Bot instance using the node-telegram-bot-api library.
- Key Functions:
- Creates a new TelegramBot instance with polling enabled.

#### Database Service (Supabase)

- File: backend/src/services/database.js
- Description: Initializes and exports a Supabase client for database operations.
- Key Functions:
- Creates a Supabase client using the provided URL and API key.

#### Polkadot Service

- File: backend/src/services/polkadot.js
- Key Functions:

 1. createPolkadotAccount():

- Generates a new Polkadot account with mnemonic.
- Returns: { address: string, mnemonic: string }

 2. checkPolkadotBalance(address: string):

- Checks if the given address has a balance of at least 2 DOT.
- Returns: boolean

 3. runPeriodically():

- Fetches new proposal data and updates the database.
- Compares new data with stored data and logs changes.

#### Data Fetcher Service

- File: backend/src/services/dataFetcher.js
- Key Functions:

 1. fetchProposalDescription(proposalId: number):

- Fetches proposal description from Polkassembly API.
- Returns: string

 2. fetchData():

- Fetches referendum data from Polkassembly API.
- Enriches data with descriptions and on-chain information.
- Returns: Array<ProposalData

### Controllers

#### User Controller

- File: backend/src/controllers/userController.js
- Key Functions:

 1. registerUser(chatId: number, telegramId: number):

- Creates a new Polkadot account for the user.
- Stores user data in the database.
- Initiates the user registration flow.

 2. updateUser(telegramId: number, voterAddress: string):

- Updates user status and voter address in the database.

 3. removeProxy(telegramId: number):

- Removes the proxy association for a user.

 4. handleUserStatus(status: number, chatId: number, telegramId: number):

- Manages user flow based on their current status.

#### Vote Controller

- File: backend/src/controllers/voteController.js
- Key Functions:

 1. storeVote(telegramId: number, proposalId: number, voteDecision: string, voteBalance: number, voteHash: string, conviction: number):

- Stores vote information in the database.

 2. getUserVotingHistory(telegramId: number):

- Retrieves voting history for a user.
- Returns:
Array<VoteHistory

 3. submitVote(telegramId: number, proposalId: number, vote: string, balance: number, conviction: number):

- Submits a vote to the Polkadot chain.
- Stores vote information in the database.
- Returns: string (transaction hash)

#### Proposal Controller

- File: backend/src/controllers/proposalController.js
- Key Functions:

 1. fetchProposals(limit: number = 10):

- Retrieves proposals from the database.
- Returns: Array<ProposalData

 2. fetchProposalDescription(proposalId: number):

- Fetches proposal description from Polkassembly API.
- Returns: string

#### Stats Controller

- File: backend/src/controllers/statsController.js
- Key Functions:

 1. getStats():

- Retrieves user count and proposal count from the database.
- Returns: { userCount: number, proposalCount: number }

### Routes

#### User Routes

- File: backend/src/routes/userRoutes.js
- Endpoints:

 1. POST /api/users/register:

- Registers a new user.
- Body: { chatId: number, telegramId: number }

 2. POST /api/users/update:

- Updates user information.
- Body: { telegramId: number, voterAddress: string }

 3. POST /api/users/remove-proxy:

- Removes proxy association for a user.
- Body: { telegramId: number }

#### Vote Routes

- File: backend/src/routes/voteRoutes.js
- Endpoints:

 1. POST /api/votes:

- Submits a vote.
- Body: { telegramId: number, proposalId: number, vote: string, balance: number, conviction: number }

 2. GET /api/votes/history/:telegramId:

- Retrieves voting history for a user.

#### Proposal Routes

- File: backend/src/routes/proposalRoutes.js
- Endpoints:

 1. GET /api/proposals:

- Retrieves proposals.
- Query params: limit (optional)

#### Stats Routes

- File: backend/src/routes/statsRoutes.js
- Endpoints:

 1. GET /api/stats:

- Retrieves general statistics.

### Blockchain Extrinsics

 1. Vote Submission:

- File: backend/src/controllers/voteController.js
- Function: submitVote
- Extrinsic:
 javascript api.tx.convictionVoting.vote(proposalId, { Standard: { vote: { aye: voteValue, conviction: convictionValue }, balance: voteBalance } })

 2. Proxy Addition:

- File: frontend/pages/link-proxy.vue
- Function: signExtrinsic
- Extrinsic:
 javascript api.tx.proxy.addProxy(proxyAddress, 'Governance', 0)

 3. Proxy Removal:

- File: frontend/pages/remove-proxy.vue
- Function: signExtrinsic
- Extrinsic:
 javascript api.tx.proxy.removeProxy(proxyAddress, 'Governance', 0)

## Frontend

### Pages

 1. Home Page:

- File: frontend/pages/index.vue
- Components:
- LeftSection
- RightSection

 2. Link Proxy Page:

- File: frontend/pages/link-proxy.vue
- Key Functions:
- connectWallet(walletName: string)
- signExtrinsic()

 3. Remove Proxy Page:

- File: frontend/pages/remove-proxy.vue
- Key Functions:
- connectWallet(walletName: string)
- signExtrinsic()

### Components

 1. LeftSection:

- File: frontend/components/LeftSection.vue
- Displays logo, project description, and statistics.

 2. RightSection:

- File: frontend/components/RightSection.vue
- Displays list of proposals.
- Key Functions:
- formatAmount(amount: string, assetId: number | null)
- getTelegramLink(postId: number)

 3. ProposalCard:

- File: frontend/components/ProposalCard.vue
- Displays individual proposal information.
- Key Functions:
- truncateDescription(desc: string)

 4. WalletSelector:

- File: Not provided, but referenced in link-proxy.vue and remove-proxy.vue
- Allows users to select and connect their wallet.

### Plugins

 1. Polkadot API Plugin:

- File: frontend/plugins/polkadot.client.js
- Initializes and provides the Polkadot API instance.

### Configuration

 1. Nuxt Configuration:

- File: frontend/nuxt.config.ts
- Configures Nuxt.js settings, including modules, build options, and environment variables.

 2. Tailwind Configuration:

- File: frontend/tailwind.config.js
- Configures Tailwind CSS settings.
