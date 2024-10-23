use std::path::Path;

use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Hooks},
    bgworker::Queue,
    boot::{create_app, BootResult, StartMode},
    controller::AppRoutes,
    db::{self, truncate_table},
    environment::Environment,
    task::Tasks,
    Result,
};
use migration::Migrator;
use sea_orm::DatabaseConnection;

use crate::{
    controllers,
    models::_entities::{assets_issues, assets_nfts, pfxassets, wallets},
    tasks,
};

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(mode: StartMode, environment: &Environment) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment).await
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes()
            .add_route(controllers::play_assets::routes())
            .add_route(controllers::assets_nft::routes())
            .add_route(controllers::sealed_file::routes())
            .add_route(controllers::pfxassets::routes())
            .add_route(controllers::assets_issue::routes())
            .add_route(controllers::wallet::routes())
            .prefix("/api")
    }

    async fn connect_workers(_ctx: &AppContext, _queue: &Queue) -> Result<()> {
        Ok(())
    }

    fn register_tasks(tasks: &mut Tasks) {
        tasks.register(tasks::seed::SeedData);
    }

    async fn truncate(db: &DatabaseConnection) -> Result<()> {
        truncate_table(db, assets_issues::Entity).await?;
        truncate_table(db, assets_nfts::Entity).await?;
        truncate_table(db, pfxassets::Entity).await?;
        truncate_table(db, wallets::Entity).await?;
        Ok(())
    }

    async fn seed(db: &DatabaseConnection, base: &Path) -> Result<()> {
        db::seed::<wallets::ActiveModel>(db, &base.join("wallets.yaml").display().to_string())
            .await?;
        // db::seed::<assets_nfts::ActiveModel>(db, &base.join("assets_nfts.yaml").display().to_string())
        //     .await?;
        Ok(())
    }
}
