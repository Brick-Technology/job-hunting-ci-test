pub mod data;
pub mod service;

use axum::routing::post;
use axum::{routing::get, Router};
use server::database::establish_connection;
use server::AppState;
use migration::MigratorTrait;
use service::index::root;
use service::job::search;

#[tokio::main]
async fn main() {

    let conn: sea_orm::DatabaseConnection = establish_connection(None).await.unwrap();
    migration::Migrator::up(&conn, None).await.unwrap();
    let state = AppState { conn };

    // initialize tracing
    tracing_subscriber::fmt::init();
    let app = Router::new()
        .route("/", get(root))
        .route("/job/search", post(search))
        .with_state(state);

    // run our app with hyper
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
