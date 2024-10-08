-- migrate:up
alter table assets add column contract_address text not null default "";

-- migrate:down
