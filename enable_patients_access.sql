-- Enable access to Patients Integration
GRANT SELECT ON TABLE public.patients TO postgres,
    anon,
    authenticated,
    service_role;
-- Verify content
SELECT *
FROM public.patients
LIMIT 5;