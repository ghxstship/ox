-- OX — Row-Level Security policies (design_handoff_ox_app/06).
-- The enforcement boundary. Apply AFTER `prisma migrate deploy`.
-- The API middleware sets these GUCs per request from the verified JWT:
--   SET LOCAL ox.user_id  = '<cuid>';
--   SET LOCAL ox.role     = 'member|coach|host|admin';
--   SET LOCAL ox.floor_id = '<cuid or empty>';
-- The client NEVER supplies scope. Run the app with a NON-superuser, non-BYPASSRLS
-- role so these policies actually apply (superusers and table owners bypass RLS).
--
-- Helper accessors (NULL-safe; current_setting(..., true) returns NULL if unset).
CREATE OR REPLACE FUNCTION ox_user_id() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT current_setting('ox.user_id', true) $$;
CREATE OR REPLACE FUNCTION ox_role() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT current_setting('ox.role', true) $$;
CREATE OR REPLACE FUNCTION ox_floor_id() RETURNS text
  LANGUAGE sql STABLE AS $$ SELECT current_setting('ox.floor_id', true) $$;

-- ════════════════════════════════════════════════════════════════════
-- users  (members CRM)  — self / roster / floor / all  → seed: 1 / 5 / 3 / 7
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_admin ON users;
CREATE POLICY users_admin ON users FOR ALL
  USING (ox_role() = 'admin') WITH CHECK (ox_role() = 'admin');

DROP POLICY IF EXISTS users_self ON users;
CREATE POLICY users_self ON users FOR SELECT
  USING (ox_role() = 'member' AND id = ox_user_id());

DROP POLICY IF EXISTS users_coach ON users;
CREATE POLICY users_coach ON users FOR SELECT
  USING (ox_role() = 'coach' AND ("coachId" = ox_user_id() OR id = ox_user_id()));

DROP POLICY IF EXISTS users_host ON users;
CREATE POLICY users_host ON users FOR SELECT
  USING (ox_role() = 'host' AND ("floorId" = ox_floor_id() OR id = ox_user_id()));

-- ════════════════════════════════════════════════════════════════════
-- classes — member: all bookable · coach: own · host: floor · admin: all
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classes_read ON classes;
CREATE POLICY classes_read ON classes FOR SELECT USING (
  ox_role() = 'admin'
  OR ox_role() = 'member'
  OR (ox_role() = 'coach' AND "coachId" = ox_user_id())
  OR (ox_role() = 'host'  AND "floorId" = ox_floor_id())
);

DROP POLICY IF EXISTS classes_write ON classes;
CREATE POLICY classes_write ON classes FOR ALL USING (
  ox_role() = 'admin' OR (ox_role() = 'host' AND "floorId" = ox_floor_id())
) WITH CHECK (
  ox_role() = 'admin' OR (ox_role() = 'host' AND "floorId" = ox_floor_id())
);

-- ════════════════════════════════════════════════════════════════════
-- payments — own floor (host) · own (member/coach) · all (admin) → 3 / 6
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_scope ON payments;
CREATE POLICY payments_scope ON payments FOR SELECT USING (
  ox_role() = 'admin'
  OR (ox_role() = 'host' AND "floorId" = ox_floor_id())
  OR "userId" = ox_user_id()
);

-- ════════════════════════════════════════════════════════════════════
-- memberships — host: own floor · member: own · admin: all
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memberships_scope ON memberships;
CREATE POLICY memberships_scope ON memberships FOR ALL USING (
  ox_role() = 'admin'
  OR (ox_role() = 'host' AND "floorId" = ox_floor_id())
  OR "userId" = ox_user_id()
) WITH CHECK (
  ox_role() = 'admin'
  OR (ox_role() = 'host' AND "floorId" = ox_floor_id())
  OR "userId" = ox_user_id()
);

-- ════════════════════════════════════════════════════════════════════
-- Owner-scoped tables — a user only ever sees their own rows (admin: all)
-- ════════════════════════════════════════════════════════════════════
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['workout_sessions','orders','tickets','bookings','prs','recovery','quests','posts','herds','challenge_entries']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', t || '_owner', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (ox_role() = ''admin'' OR "userId" = ox_user_id()) WITH CHECK (ox_role() = ''admin'' OR "userId" = ox_user_id());',
      t || '_owner', t
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- Public discovery — events, ticket tiers, exercises, products, floors,
-- tribes, challenges: readable by everyone (writes still gated in the API).
-- RLS left OFF (public read) by design; the API capability guard governs writes.
-- ════════════════════════════════════════════════════════════════════
