-- Create the storage bucket for repair photos
insert into storage.buckets (id, name, public)
values ('repair-photos', 'repair-photos', true);

-- Policy to allow anyone to read repair photos (since they're public)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'repair-photos' );

-- Policy to allow authenticated users to upload photos
create policy "Authenticated users can upload photos"
on storage.objects for insert
with check (
  bucket_id = 'repair-photos'
  and auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete their photos
create policy "Authenticated users can delete photos"
on storage.objects for delete
using (
  bucket_id = 'repair-photos'
  and auth.role() = 'authenticated'
);
