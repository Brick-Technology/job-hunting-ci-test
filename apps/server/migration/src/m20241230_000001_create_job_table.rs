use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Job::Table)
                    .if_not_exists()
                    .col(string(Job::Id))
                    .col(string_null(Job::Platform))
                    .col(string_null(Job::Url))
                    .col(string_null(Job::Name))
                    .col(string_null(Job::CompanyName))
                    .col(string_null(Job::LocationName))
                    .col(string_null(Job::Address))
                    .col(double_null(Job::Longitude))
                    .col(double_null(Job::Latitude))
                    .col(string_null(Job::Description))
                    .col(string_null(Job::DegreeName))
                    .col(integer_null(Job::Year))
                    .col(float_null(Job::SalaryMin))
                    .col(float_null(Job::SalaryMax))
                    .col(integer_null(Job::SalaryTotalMonth))
                    .col(timestamp_with_time_zone_null(Job::FirstPublishDatetime))
                    .col(string_null(Job::BossName))
                    .col(string_null(Job::BossCompanyName))
                    .col(string_null(Job::BossPosition))
                    .col(timestamp_with_time_zone_null(Job::CreateDatetime))
                    .col(timestamp_with_time_zone_null(Job::UpdateDatetime))
                    .col(boolean_null(Job::IsFullCompanyName))
                    .col(string_null(Job::SkillTag))
                    .col(string_null(Job::WelfareTag))
                    .primary_key(
                        Index::create().name("pk-job-id")
                        .col(Job::Id)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Job::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Job {
    Table,
    Id,
    Platform,
    Url,
    Name,
    CompanyName,
    LocationName,
    Address,
    Longitude,
    Latitude,
    Description,
    DegreeName,
    Year,
    SalaryMin,
    SalaryMax,
    SalaryTotalMonth,
    FirstPublishDatetime,
    BossName,
    BossCompanyName,
    BossPosition,
    CreateDatetime,
    UpdateDatetime,
    IsFullCompanyName, 
    SkillTag, 
    WelfareTag,
}
