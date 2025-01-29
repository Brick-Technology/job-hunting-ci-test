use sea_orm::DatabaseConnection;

pub mod service;
pub mod data;
pub mod database;

#[derive(Clone,Debug)]
pub struct AppState {
    pub conn: DatabaseConnection,
}