-- Relax storage path checks: object `name` must start with "{auth.uid()}/"
-- (avoids split_part edge cases if the path format ever differs).
drop policy if exists "field_photos_insert_own" on storage.objects;
drop policy if exists "field_photos_update_own" on storage.objects;
drop policy if exists "field_photos_delete_own" on storage.objects;

create policy "field_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  );

create policy "field_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  );

create policy "field_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  );
