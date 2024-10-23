-- migrate:up
create table if not exists token_config (
    config_id integer primary key,
    chain_name text not null,
    symbol text not null,
    price_id text not null,
    decimals integer not null,
    contract text not null
);

-- migrate:down
drop table if exists token_config;
