use loco_rs::schema::table_auto_tz;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto_tz(Wallets::Table)
                    .col(pk_auto(Wallets::Id))
                    .col(
                        ColumnDef::new(Wallets::AccountId)
                        .string_len(64)
                        .not_null()
                        .unique_key()
                    )
                    .col(string(Wallets::Name))
                    .col(string(Wallets::Phrase))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Wallets::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Wallets {
    Table,
    Id,
    AccountId,
    Name,
    Phrase,
}
