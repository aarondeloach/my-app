--
-- Initial tables for the application
--
-- Table to track executed migrations
create table if not exists
    _migrations (
        id int auto_increment primary key,
        filename varchar(255) not null unique,
        executed_at timestamp default current_timestamp not null
    );


-- Table to store application errors
create table if not exists
    app_errors (
        id varchar(36) not null primary key,
        environment varchar(20) not null,
        source varchar(10) not null,
        message text not null,
        stack text null,
        url varchar(2083) null,
        method varchar(10) null,
        user_agent varchar(512) null,
        created_at timestamp default current_timestamp null,
        cause text null
    );


-- Table to store countries
create table if not exists
    countries (
        id char(2) not null primary key,
        title varchar(100) not null,
        active tinyint(1) default 0 not null
    );


-- Table to store timezones
create table if not exists
    timezones (
        id varchar(50) not null primary key,
        country_id char(2) null,
        title varchar(100) not null,
        utc_offset int not null,
        constraint timezones_countries_id_fk foreign key (country_id) references countries (id) on update cascade on delete cascade
    );


-- Table to store accounts
create table if not exists
    accounts (
        id bigint unsigned auto_increment primary key,
        uuid char(36) default(uuid()) not null,
        title varchar(100) not null,
        country_id char(2) null,
        timezone_id varchar(50) null,
        constraint accounts_pk unique (uuid),
        constraint accounts_countries_id_fk foreign key (country_id) references countries (id) on update cascade on delete restrict,
        constraint accounts_timezones_id_fk foreign key (timezone_id) references timezones (id) on update cascade on delete restrict
    );


-- Table to store users
create table if not exists
    users (
        id bigint unsigned auto_increment primary key,
        uuid char(36) default(uuid()) not null,
        name varchar(50) not null,
        email varchar(100) not null,
        password_hash varchar(255) null,
        account_id bigint unsigned not null,
        roles json null,
        status enum('active', 'pending') null,
        constraint users_pk unique (uuid),
        constraint users_pk_2 unique (email),
        constraint users_accounts_id_fk foreign key (account_id) references accounts (id) on update cascade on delete cascade
    );


-- Table to store user sessions
create table if not exists
    sessions (
        id char(36) not null primary key,
        user_uuid char(36) not null,
        account_uuid char(36) not null,
        user_id bigint unsigned not null,
        account_id bigint unsigned not null,
        created_at timestamp default current_timestamp null,
        constraint sessions_accounts_id_fk foreign key (account_id) references accounts (id) on update cascade on delete cascade,
        constraint sessions_users_id_fk foreign key (user_id) references users (id) on update cascade on delete cascade
    );


-- Table for application roles
create table if not exists
    roles (
        id bigint unsigned auto_increment primary key,
        uuid char(36) default(uuid()) not null,
        title varchar(50) not null,
        description varchar(255) null
    );


-- Table for application features
create table if not exists
    features (
        id bigint unsigned auto_increment primary key,
        human_id char(36) not null unique,
        title varchar(50) not null,
        description varchar(255) null
    );


-- Table for application environments
create table if not exists
    envs (
        id bigint unsigned auto_increment primary key,
        uuid char(36) default(uuid()) not null,
        human_id char(36) not null unique,
        title varchar(50) not null unique,
        description varchar(255) null,
        allow_signup tinyint(1) default 0 not null,
        signup_help varchar(255) null
    );


-- Table for environment versions
create table if not exists
    env_versions (
        id bigint unsigned auto_increment primary key,
        uuid char(36) default(uuid()) not null,
        human_id char(36) not null unique,
        env_id bigint unsigned not null,
        title varchar(50) not null,
        description varchar(255) null,
        more_info text null,
        fee_string varchar(50) null,
        fee int null,
        constraint env_versions_envs_id_fk foreign key (env_id) references envs (id) on update cascade on delete cascade
    );


-- Table for environment version features
create table if not exists
    version_features (
        id bigint unsigned auto_increment primary key,
        env_version_id bigint unsigned not null,
        feature_id bigint unsigned not null,
        optional tinyint(1) default 0 not null,
        description varchar(255) null,
        more_info text null,
        fee_string varchar(50) null,
        fee int null,
        constraint version_features_env_versions_id_fk foreign key (env_version_id) references env_versions (id) on update cascade on delete cascade,
        constraint version_features_features_id_fk foreign key (feature_id) references features (id) on update cascade on delete cascade
    );


-- Table to store files uploaded to S3
create table if not exists
    files (
        s3_key varchar(512) not null primary key,
        uuid char(36) default(uuid()) not null,
        account_id bigint unsigned not null,
        s3_url varchar(512) not null,
        created_at timestamp default(now()) not null,
        mime_type varchar(100) null,
        file_size int null,
        file_name varchar(255) null,
        metadata json null,
        title varchar(100) null,
        constraint files_uuid_uindex unique (uuid),
        constraint files_accounts_id_fk foreign key (account_id) references accounts (id) on update cascade on delete cascade
    );


-- Table to store one-time passwords (OTPs) for user verification and authentication
create table if not exists
    otps (
        id bigint unsigned auto_increment primary key,
        user_id bigint unsigned not null,
        otp varchar(10) not null,
        is_verified tinyint(1) default 0 not null,
        attempts int unsigned default 0 not null,
        expires_at timestamp default(now() + interval 5 minute) not null,
        created_at timestamp default(now()) not null,
        constraint otps_users_id_fk foreign key (user_id) references users (id) on update cascade on delete cascade
    );


create index otps_otp_index on otps (otp);


-- Table to store user permissions for specific features beyond their assigned roles
create table if not exists
    user_permissions (
        user_id bigint unsigned not null,
        feature_id bigint unsigned not null,
        permissions varchar(20) null,
        primary key (feature_id, user_id),
        constraint user_permissions_users_id_fk foreign key (user_id) references users (id) on update cascade on delete cascade,
        constraint user_permissions_features_id_fk foreign key (feature_id) references features (id) on update cascade on delete cascade
    );