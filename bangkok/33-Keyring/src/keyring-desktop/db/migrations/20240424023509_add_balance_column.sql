-- migrate:up
alter table assets add column balance text not null default "";
alter table assets add column price real not null default 0.0;

-- migrate:down
