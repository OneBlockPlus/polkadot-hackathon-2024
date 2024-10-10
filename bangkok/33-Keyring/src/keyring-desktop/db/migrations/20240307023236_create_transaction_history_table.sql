-- migrate:up
create table if not exists transaction_history (
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

-- migrate:down
drop table if exists transaction_history;
