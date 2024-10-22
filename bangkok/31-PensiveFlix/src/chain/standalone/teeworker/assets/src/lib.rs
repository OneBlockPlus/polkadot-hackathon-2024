pub mod app;
pub mod controllers;
pub mod models;
pub mod seal;
pub mod tasks;
pub mod views;
pub mod workers;

use loco_rs::app::AppContext;
use std::{io, path::PathBuf};

pub fn upload_folder(ctx: &AppContext) -> Result<PathBuf, io::Error> {
    let ss = ctx
        .config
        .settings
        .as_ref()
        .and_then(|v| v.get("upload_folder").and_then(|v| v.as_str()))
        .unwrap_or("./data/upload");

    let folder = PathBuf::from(ss);
    std::fs::create_dir_all(&folder)?;
    Ok(folder)
}

pub fn sealed_folder(ctx: &AppContext) -> Result<PathBuf, io::Error> {
    let ss = ctx
        .config
        .settings
        .as_ref()
        .and_then(|v| v.get("sealed_folder").and_then(|v| v.as_str()))
        .unwrap_or("./data/sealed");

    let folder = PathBuf::from(ss);
    std::fs::create_dir_all(&folder)?;
    Ok(folder)
}
