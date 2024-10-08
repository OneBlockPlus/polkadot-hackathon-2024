-- migrate:up
CREATE UNIQUE INDEX ux_assets_token_symbol ON assets(account_id, token_symbol, contract_address);

-- migrate:down

