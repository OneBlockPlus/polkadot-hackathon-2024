-- migrate:up
create table if not exists assets (
    asset_id integer primary key,
    account_id integer not null,
    token_symbol text not null
);


-- migrate:down
drop table if exists assets;
