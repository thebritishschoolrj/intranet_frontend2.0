
UPDATE storage.buckets SET public = false WHERE id IN ('attachments', 'avatars');
