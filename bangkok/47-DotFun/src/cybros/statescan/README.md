Cybros StateScan deployment
====

## Prepare

The repo now points to the Cybros dev network.
To change to another network:

- `cp .env.example .env`
- Review and edit `.env`
  - If the deployment intents to expose to the Internet, `PUBLIC_BACKEND_API_ENDPOINT` should be the public host
  - Backend doesn't enable `identity-scan` yet, so keep `PUBLIC_IDENTITY_API_ENDPOINT` and `PUBLIC_IDENTITY_SERVER_HOST` blank
- Review and edit `backend/packages/server/src/utils/consts/chains.js`
- Review and edit `website/src/utils/consts/chains/index.js`
  - Do not change `identity: "polkadot",`
  - Or comment the `website` section in `docker-compose.yml` if the frontend deploy to another place

## Run

`docker compose up`

## Use

By default, backend API uses the port `5010`, and website uses the port `3000`.
If the deployment intents to expose to the Internet, set up a reverse proxy for these ports.
