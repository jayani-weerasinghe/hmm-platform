-- Every user must have their own phone number — Super Admin, Champion or
-- Gatekeeper, active or deactivated, regardless of role — and every
-- Gatekeeper must have one. The web app already enforces this
-- (lib/phone.ts, lib/phone-uniqueness.server.ts); this makes the database
-- itself enforce it too, so nothing that writes to profiles directly (e.g.
-- a future Gatekeeper mobile app) can bypass it.
--
-- Numbers are stored in one standard (E.164) form, e.g. +94771234567, so the
-- same number typed differently ("077 123 4567", "0771234567") is caught as a
-- duplicate. public.normalize_phone() mirrors parsePhone() in lib/phone.ts —
-- keep the two in step if either changes. Local numbers default to Sri
-- Lanka (+94); others need their country code.
--
-- Run once, as a whole. It stops with an error (and changes nothing) if any
-- two users still share a number after normalising, or any Gatekeeper has
-- no number.

-- 1. Normalise a phone number to E.164; NULL when blank or invalid.
CREATE OR REPLACE FUNCTION public.normalize_phone(raw TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d TEXT;
BEGIN
  IF raw IS NULL OR btrim(raw) = '' THEN
    RETURN NULL;
  END IF;

  d := regexp_replace(raw, '[^0-9+]', '', 'g');
  IF position('+' IN d) > 1 THEN
    RETURN NULL;
  END IF;
  IF d LIKE '00%' THEN
    d := '+' || substr(d, 3);
  END IF;

  IF left(d, 1) <> '+' THEN
    IF d ~ '^0[0-9]{9}$' THEN
      d := '+94' || substr(d, 2);          -- 0771234567
    ELSIF d ~ '^94[0-9]{9}$' THEN
      d := '+' || d;                        -- 94771234567
    ELSIF d ~ '^[1-9][0-9]{8}$' THEN
      d := '+94' || d;                      -- 771234567
    ELSE
      RETURN NULL;
    END IF;
  END IF;

  IF d !~ '^\+[1-9][0-9]{7,14}$' THEN
    RETURN NULL;
  END IF;
  IF d LIKE '+94%' AND length(d) <> 12 THEN
    RETURN NULL;
  END IF;
  RETURN d;
END;
$$;

-- 2. Refuse to continue while existing data would break the new rules.
DO $$
DECLARE
  dup_count INTEGER;
  bad_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT public.normalize_phone(phone)
    FROM public.profiles
    WHERE public.normalize_phone(phone) IS NOT NULL
    GROUP BY 1
    HAVING count(*) > 1
  ) dups;

  SELECT count(*) INTO bad_count
  FROM public.profiles
  WHERE phone IS NOT NULL AND btrim(phone) <> '' AND public.normalize_phone(phone) IS NULL;

  SELECT count(*) INTO missing_count
  FROM public.profiles
  WHERE role = 'gatekeeper' AND public.normalize_phone(phone) IS NULL;

  IF dup_count > 0 OR bad_count > 0 OR missing_count > 0 THEN
    RAISE EXCEPTION
      'Fix existing phone data first: % shared number(s), % invalid number(s), % Gatekeeper(s) without a number. Nothing was changed.',
      dup_count, bad_count, missing_count;
  END IF;
END;
$$;

-- 3. Store every existing number in the standard form; blanks become NULL.
UPDATE public.profiles
SET phone = public.normalize_phone(phone)
WHERE phone IS DISTINCT FROM public.normalize_phone(phone);

-- 4. Normalise every future write, and reject numbers that can't be parsed.
CREATE OR REPLACE FUNCTION public.profiles_normalize_phone()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.phone IS NULL OR btrim(NEW.phone) = '' THEN
    NEW.phone := NULL;
    RETURN NEW;
  END IF;

  NEW.phone := public.normalize_phone(NEW.phone);
  IF NEW.phone IS NULL THEN
    RAISE EXCEPTION 'Invalid phone number.' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_normalize_phone
  BEFORE INSERT OR UPDATE OF phone ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_normalize_phone();

-- 5. One number per user, across every role and status.
CREATE UNIQUE INDEX profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

-- 6. Every Gatekeeper must have a number.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_gatekeeper_phone_required
  CHECK (role <> 'gatekeeper' OR phone IS NOT NULL);
