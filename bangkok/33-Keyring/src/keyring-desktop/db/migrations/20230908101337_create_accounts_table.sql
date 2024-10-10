-- migrate:up
create table if not exists accounts (
    account_id integer primary key,
    card_id integer not null,
    chain_name text not null,
    address text not null,
    selected_account boolean not null
);


-- migrate:down
drop table if exists accounts;
