--
-- Seed data for the application
--
insert into
    roles (title, description)
values
    (
        'Superuser',
        'User with the highest level of system access and privileges'
    ),
    (
        'System Admin',
        'Administrator role with system access'
    );


insert into
    features (human_id, title, description)
values
    (
        'accountSettings',
        'Account Settings',
        'Account settings and preferences'
    ),
    (
        'accountUsers',
        'Account Users',
        'Account users and their roles'
    ),
    (
        'accountUserPermissions',
        'Account User Permissions',
        'Account user permissions beyond prescribed roles'
    ),
    (
        'appVersions',
        'App Versions',
        'Application versions and their configurations'
    ),
    (
        'appVersionsHistory',
        'App Versions History',
        'History of changes to the application versions.'
    ),
    (
        'appOptionalFeatures',
        'App Optional Features',
        'Optional features that can be enabled or disabled in the application'
    ),
    (
        'appOptionalFeaturesHistory',
        'App Optional Features History',
        'History of changes to optional features'
    ),
    (
        'userNotifications',
        'User Notifications',
        'Notifications for users about system events and updates'
    ),
    (
        'userFeedback',
        'User Feedback',
        'Feedback from users about the application'
    ),
    (
        'accountNetworks',
        'Account Networks',
        'Networks associated with the account'
    ),
    (
        'accountNetworkMonetization',
        'Account Network Monetization',
        'Monetization settings for account networks'
    )
;