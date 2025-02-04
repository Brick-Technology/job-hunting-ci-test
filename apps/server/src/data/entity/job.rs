//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.3

use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel,Serialize)]
#[sea_orm(table_name = "job")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    pub platform: Option<String>,
    pub url: Option<String>,
    pub name: Option<String>,
    pub company_name: Option<String>,
    pub location_name: Option<String>,
    pub address: Option<String>,
    #[sea_orm(column_type = "Double", nullable)]
    pub longitude: Option<f64>,
    #[sea_orm(column_type = "Double", nullable)]
    pub latitude: Option<f64>,
    pub description: Option<String>,
    pub degree_name: Option<String>,
    pub year: Option<i32>,
    #[sea_orm(column_type = "Float", nullable)]
    pub salary_min: Option<f32>,
    #[sea_orm(column_type = "Float", nullable)]
    pub salary_max: Option<f32>,
    pub salary_total_month: Option<i32>,
    pub first_publish_datetime: Option<DateTimeWithTimeZone>,
    pub boss_name: Option<String>,
    pub boss_company_name: Option<String>,
    pub boss_position: Option<String>,
    pub create_datetime: Option<DateTimeWithTimeZone>,
    pub update_datetime: Option<DateTimeWithTimeZone>,
    pub is_full_company_name: Option<bool>,
    pub skill_tag: Option<String>,
    pub welfare_tag: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
