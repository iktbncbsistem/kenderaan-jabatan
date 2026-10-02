
-- ============================================================
-- F11C.9 - PUBLIC DRIVER SCHEDULE (UPDATED)
-- Includes:
--   - requester department/unit (non-personal)
--   - driver requirement: wait / no_wait / no_driver
-- Does NOT expose:
--   - IC
--   - personal phone
--   - personal email
--   - official task letter
--   - internal approval details
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_public_driver_schedule(
    p_from timestamptz DEFAULT now(),
    p_to   timestamptz DEFAULT (now() + interval '14 days')
)
RETURNS TABLE (
    assignment_id uuid,
    scheduled_start timestamptz,
    scheduled_end timestamptz,
    driver_name text,
    registration_no text,
    vehicle_name text,
    vehicle_type public.vehicle_type,
    origin text,
    destination text,
    purpose text,
    driver_requirement text,
    requester_department text,
    assignment_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF p_to <= p_from THEN
        RAISE EXCEPTION 'Julat tarikh tidak sah.';
    END IF;

    IF p_to > p_from + interval '31 days' THEN
        RAISE EXCEPTION 'Julat carian maksimum ialah 31 hari.';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.scheduled_start,
        a.scheduled_end,

        d.full_name,

        v.registration_no,
        v.vehicle_name,
        v.vehicle_type,

        r.origin,
        r.destination,
        r.purpose,

        r.driver_requirement,

        p.department,

        a.status

    FROM public.travel_assignments a

    JOIN public.drivers d
      ON d.id = a.driver_id

    JOIN public.vehicles v
      ON v.id = a.vehicle_id

    JOIN public.travel_requests r
      ON r.id = a.request_id

    LEFT JOIN public.profiles p
      ON p.id = r.requester_profile_id

    WHERE a.scheduled_start < p_to
      AND a.scheduled_end > p_from

      AND a.status IN (
          'scheduled',
          'ongoing'
      )

      AND r.status IN (
          'approved',
          'assigned',
          'ongoing'
      )

    ORDER BY
        a.scheduled_start,
        v.registration_no,
        d.full_name;
END;
$$;

REVOKE ALL
ON FUNCTION public.get_public_driver_schedule(timestamptz, timestamptz)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.get_public_driver_schedule(timestamptz, timestamptz)
TO anon;

GRANT EXECUTE
ON FUNCTION public.get_public_driver_schedule(timestamptz, timestamptz)
TO authenticated;
