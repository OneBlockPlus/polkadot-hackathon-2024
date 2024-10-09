-- migrate:up
create table if not exists cards (
    card_id integer primary key,
    name text not null unique,
    selected boolean not null,
    puk text not null,
    pairing_code text not null,
    pairing_key text not null,
    pairing_index text not null
);


-- migrate:down
drop table if exists cards;