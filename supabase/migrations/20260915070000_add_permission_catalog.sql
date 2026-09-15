-- Permission Catalog: backs the new Figma "Permissions & Access Controls"
-- design (node 106:26108), which uses a much more granular, categorized
-- permission taxonomy than the original 7 generic keys. This table stores
-- the label/description/category/icon/role-restriction metadata Figma's
-- card UI needs — none of which existed before (permission keys were bare
-- TEXT with no catalog). Existing role_overrides/group_permissions rows
-- reference permission keys by the same TEXT value, so remapping the key
-- string in `permissions` also carries forward correctly there.

CREATE TABLE IF NOT EXISTS public.permission_catalog (
  key           TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  restricted_to TEXT, -- e.g. 'super_admin' — if set, not togglable for any other role
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.permission_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permission_catalog: super_admin all" ON public.permission_catalog
  FOR ALL USING (current_user_role() = 'super_admin'::user_role);
CREATE POLICY "permission_catalog: authenticated read" ON public.permission_catalog
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Rename the 7 existing permission keys to their new-taxonomy equivalents.
-- role_overrides/group_permissions rows carry forward automatically since
-- they reference the same TEXT key column.
UPDATE public.permissions SET permission = 'manage_gatekeepers_add' WHERE permission = 'manage_gatekeepers';
UPDATE public.role_overrides SET permission = 'manage_gatekeepers_add' WHERE permission = 'manage_gatekeepers';
UPDATE public.group_permissions SET permission = 'manage_gatekeepers_add' WHERE permission = 'manage_gatekeepers';

UPDATE public.permissions SET permission = 'schedule_qpr_sessions' WHERE permission = 'manage_events';
UPDATE public.role_overrides SET permission = 'schedule_qpr_sessions' WHERE permission = 'manage_events';
UPDATE public.group_permissions SET permission = 'schedule_qpr_sessions' WHERE permission = 'manage_events';

UPDATE public.permissions SET permission = 'publish_club_announcements' WHERE permission = 'create_announcements';
UPDATE public.role_overrides SET permission = 'publish_club_announcements' WHERE permission = 'create_announcements';
UPDATE public.group_permissions SET permission = 'publish_club_announcements' WHERE permission = 'create_announcements';

UPDATE public.permissions SET permission = 'download_facilitator_kits' WHERE permission = 'view_resources';
UPDATE public.role_overrides SET permission = 'download_facilitator_kits' WHERE permission = 'view_resources';
UPDATE public.group_permissions SET permission = 'download_facilitator_kits' WHERE permission = 'view_resources';

UPDATE public.permissions SET permission = 'register_for_training' WHERE permission = 'register_for_events';
UPDATE public.role_overrides SET permission = 'register_for_training' WHERE permission = 'register_for_events';
UPDATE public.group_permissions SET permission = 'register_for_training' WHERE permission = 'register_for_events';

UPDATE public.permissions SET permission = 'view_club_announcements' WHERE permission = 'view_announcements';
UPDATE public.role_overrides SET permission = 'view_club_announcements' WHERE permission = 'view_announcements';
UPDATE public.group_permissions SET permission = 'view_club_announcements' WHERE permission = 'view_announcements';

UPDATE public.permissions SET permission = 'view_event_calendar' WHERE permission = 'view_events';
UPDATE public.role_overrides SET permission = 'view_event_calendar' WHERE permission = 'view_events';
UPDATE public.group_permissions SET permission = 'view_event_calendar' WHERE permission = 'view_events';

-- New keys with no prior equivalent, per the Figma design. Role-default
-- rows are seeded for champion/gatekeeper matching the design's shown
-- toggle states; Super Admins can change any of these immediately via the
-- real Role Defaults UI post-migration — these are starting defaults, not
-- fixed values.
INSERT INTO public.permissions (role, permission, is_enabled) VALUES
  ('champion', 'bulk_import_gatekeepers', false),
  ('champion', 'edit_gatekeeper_profiles', true),
  ('champion', 'deactivate_gatekeepers', true),
  ('champion', 'mark_attendance_badges', true),
  ('champion', 'delete_announcements', false),
  ('champion', 'upload_clinical_guides', false)
ON CONFLICT DO NOTHING;

-- Catalog metadata for all 10 permissions in the new design, in Figma's
-- module/item order. "upload_clinical_guides" is Super-Admin-only per the
-- design's own "Super Admin Only" tag — no role gets it as a togglable
-- default, restricted_to locks it in the UI for every other role.
INSERT INTO public.permission_catalog (key, label, description, category, display_order, restricted_to) VALUES
  ('manage_gatekeepers_add',   'Add New Gatekeepers',                 'Allows Champions to onboard new community members and students into their club.',                 'Community & Gatekeeper Management', 1, NULL),
  ('bulk_import_gatekeepers',  'Bulk Import via CSV / Excel',         'Allows mass registration via spreadsheet rosters. Typically disabled to prevent accidental duplicates.', 'Community & Gatekeeper Management', 2, NULL),
  ('edit_gatekeeper_profiles', 'Edit Gatekeeper Profiles & Certifications', 'Allows Champions to keep contact info, emergency contacts, and badges up to date.',            'Community & Gatekeeper Management', 3, NULL),
  ('deactivate_gatekeepers',   'Deactivate Gatekeeper Accounts',      'Allows Champions to pause or retire inactive gatekeepers from active club rosters.',              'Community & Gatekeeper Management', 4, NULL),
  ('schedule_qpr_sessions',    'Schedule QPR Training Sessions',      'Allows creating in-person and virtual certified Question-Persuade-Refer sessions.',               'Events & QPR Training Sessions', 5, NULL),
  ('mark_attendance_badges',   'Mark Attendance & Issue Badges',      'Confirms training participation and awards completion badges to attendees.',                       'Events & QPR Training Sessions', 6, NULL),
  ('publish_club_announcements', 'Publish Club Announcements',        'Allows posting news and urgent reminders directly to the club mobile app feed.',                  'Club Communications & Broadcasts', 7, NULL),
  ('delete_announcements',     'Delete Announcements',                'Permanently removes broadcasts. Disabled by default to protect communication records.',           'Club Communications & Broadcasts', 8, NULL),
  ('upload_clinical_guides',   'Upload Clinical Guides & Protocols',  'Reserved exclusively for Super Admins to ensure medical protocol accuracy.',                        'Learning Resources & Library', 9, 'super_admin'),
  ('download_facilitator_kits', 'Download Gatekeeper Facilitator Kits', 'Allows downloading official slide decks, student worksheets, and intervention steps.',           'Learning Resources & Library', 10, NULL)
ON CONFLICT (key) DO NOTHING;

-- Catalog entries for the renamed-but-not-shown-in-this-view keys, so
-- nothing in the resolution engine or existing screens loses its
-- label/category if displayed elsewhere.
INSERT INTO public.permission_catalog (key, label, description, category, display_order, restricted_to) VALUES
  ('register_for_training',  'Register for Training Sessions', 'Allows self-registration for scheduled QPR training sessions.', 'Events & QPR Training Sessions', 11, NULL),
  ('view_club_announcements', 'View Club Announcements',       'Baseline visibility into club-wide announcements.',              'Club Communications & Broadcasts', 12, NULL),
  ('view_event_calendar',    'View Event Calendar',            'Baseline visibility into the club event calendar.',              'Events & QPR Training Sessions', 13, NULL)
ON CONFLICT (key) DO NOTHING;
