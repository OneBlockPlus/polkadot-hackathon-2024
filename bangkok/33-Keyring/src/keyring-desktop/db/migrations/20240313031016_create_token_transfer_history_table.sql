-- migrate:up
create table if not exists token_transfer_history (
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

-- migrate:down
drop table if exists token_transfer_history;
