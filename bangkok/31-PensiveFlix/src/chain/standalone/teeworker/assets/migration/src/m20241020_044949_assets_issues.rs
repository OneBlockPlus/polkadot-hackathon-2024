use loco_rs::schema::table_auto_tz;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto_tz(AssetsIssues::Table)
                    .col(pk_auto(AssetsIssues::Id))
                    .col(string(AssetsIssues::AccountId))
                    .col(big_integer(AssetsIssues::Size))
                    .col(string(AssetsIssues::Filename))
                    .col(string(AssetsIssues::MediaType))
                    .col(integer(AssetsIssues::State))
                    .col(string_null(AssetsIssues::AssetsId))
                    .col(string_null(AssetsIssues::Name))
                    .col(integer(AssetsIssues::MintCount))
                    .col(string_null(AssetsIssues::RetriveUri))
                    .col(string_null(AssetsIssues::CoverImage))
                    .col(string_null(AssetsIssues::PflixIssuer))
                    .col(string_null(AssetsIssues::PflixSignature))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(AssetsIssues::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum AssetsIssues {
    Table,
    Id,
    AccountId,
    Size,
    Filename,
    MediaType,
    State,
    AssetsId,
    Name,
    MintCount,
    RetriveUri,
    CoverImage,
    PflixIssuer,
    PflixSignature,
}
