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
        'account',
        'Account Management',
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
        'roles',
        'App Roles',
        'Application roles and permissions'
    ),
    (
        'features',
        'App Features',
        'Application features and configurations'
    ),
    (
        'featureAccess',
        'Feature Access',
        'Role-based access to application features'
    );

