use loco_rs::schema::table_auto_tz;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto_tz(AssetsNfts::Table)
                    .col(pk_auto(AssetsNfts::Id))
                    .col(
                        ColumnDef::new(AssetsNfts::Token)
                            .string_len(86)
                            .not_null()
                            .unique_key(),
                    )
                    .col(string(AssetsNfts::Owner))
                    .col(string(AssetsNfts::AssetsId))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(AssetsNfts::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum AssetsNfts {
    Table,
    Id,
    Token,
    Owner,
    AssetsId,
}
