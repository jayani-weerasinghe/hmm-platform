-- Epic 4: Resource Management — private storage bucket for uploaded video/document files.
-- content_url on public.resources holds either an external URL (http/https) or a path
-- within this bucket; RLS below mirrors the resources table policies.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  FALSE,
  104857600, -- 100 MB
  ARRAY[
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "resources bucket: super_admin all"
  ON storage.objects FOR ALL TO authenticated
  USING      (bucket_id = 'resources' AND public.current_user_role() = 'super_admin')
  WITH CHECK (bucket_id = 'resources' AND public.current_user_role() = 'super_admin');

CREATE POLICY "resources bucket: champion gatekeeper read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resources' AND public.current_user_role() IN ('champion', 'gatekeeper'));
