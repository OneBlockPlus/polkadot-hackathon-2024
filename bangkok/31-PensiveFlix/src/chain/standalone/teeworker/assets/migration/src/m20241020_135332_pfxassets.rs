use loco_rs::schema::table_auto_tz;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto_tz(Pfxassets::Table)
                    .col(pk_auto(Pfxassets::Id))
                    .col(
                        ColumnDef::new(Pfxassets::AssetsId)
                            .string_len(64)
                            .not_null()
                            .unique_key(),
                    )
                    .col(string(Pfxassets::Owner))
                    .col(integer(Pfxassets::Size))
                    .col(string(Pfxassets::Filename))
                    .col(string(Pfxassets::MediaType))
                    .col(string(Pfxassets::Name))
                    .col(string(Pfxassets::RetriveUri))
                    .col(string_null(Pfxassets::CoverImage))
                    .col(string(Pfxassets::PflixIssuer))
                    .col(string(Pfxassets::PflixSignature))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Pfxassets::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Pfxassets {
    Table,
    Id,
    AssetsId,
    Owner,
    Size,
    Filename,
    MediaType,
    Name,
    RetriveUri,
    CoverImage,
    PflixIssuer,
    PflixSignature,
}
