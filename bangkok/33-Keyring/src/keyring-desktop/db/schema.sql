CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE cards (
    card_id integer primary key,
    name text not null unique,
    selected boolean not null,
    puk text not null,
    pairing_code text not null,
    pairing_key text not null,
    pairing_index text not null
);
CREATE TABLE accounts (
    account_id integer primary key,
    card_id integer not null,
    chain_name text not null,
    address text not null,
    selected_account boolean not null
);
CREATE TABLE assets (
    asset_id integer primary key,
    account_id integer not null,
    token_symbol text not null
, contract_address text not null default "", balance text not null default "", price real not null default 0.0);
CREATE TABLE token_config (
    config_id integer primary key,
    chain_name text not null,
    symbol text not null,
    price_id text not null,
    decimals integer not null,
    contract text not null
);
CREATE TABLE transaction_history (
    chain_name text not null,
    address text not null,
    hash text not null,
    timestamp integer not null,
    status text not null,
    from_addr text not null,
    to_addr text not null,
    value text not null,
    fee text not null,
    UNIQUE(hash, address) ON CONFLICT REPLACE
);
CREATE TABLE token_transfer_history (
    chain_name text not null,
    address text not null,
    hash text not null,
    timestamp integer not null,
    from_addr text not null,
    to_addr text not null,
    value text not null,
    contract text not null default "",
    symbol text not null default "",
    type text not null default "",
    UNIQUE(hash, contract) ON CONFLICT REPLACE
);
CREATE UNIQUE INDEX ux_assets_token_symbol ON assets(account_id, token_symbol, contract_address);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20230908080559'),
  ('20230908101337'),
  ('20230908101344'),
  ('20231010033257'),
  ('20240129082929'),
  ('20240307023236'),
  ('20240313031016'),
  ('20240424023509'),
  ('20240424033422');
