## Run this after change query from folder extension-koni-base
- Todo: Update below code with https://the-guild.dev/graphql/codegen/docs/getting-started/installation
- Generate code for SubQuery crowdloans: `npx apollo codegen:generate --endpoint=https://api.subquery.network/sq/subvis-io/polkadot-auctions-and-crowdloans --includes=./src/api/subquery/crowdloan.ts --target=typescript --tagName=gql --globalTypesFile="./src/api/subquery/crowdloanTypes.ts"`
- Generate code for SubQuery history: `npx apollo schema:download --endpoint=https://api.subquery.network/sq/nova-wallet/nova-polkadot schema.json ; npx apollo codegen:generate --includes=./src/api/subquery/history.ts --target=typescript --tagName=gql --globalTypesFile="./src/api/subquery/crowdloanTypes.ts" --localSchemaFile="schema.json"`
