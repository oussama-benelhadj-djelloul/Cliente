-- Dummy data for Cliente. All accounts use the password: Password123!
-- Fictional companies and people. Safe to re-run: it deletes the demo users first.

create extension if not exists pgcrypto with schema extensions;

delete from auth.users where email like '%@cliente-demo.dev';

do $$
declare
  u record;
  uid uuid;
begin
  for u in select * from (values
    ('sara@cliente-demo.dev'),   -- owns Sahara Eats
    ('karim@cliente-demo.dev'),  -- owns PixelNote
    ('amina@cliente-demo.dev'),
    ('yacine@cliente-demo.dev'),
    ('lina@cliente-demo.dev'),
    ('mehdi@cliente-demo.dev'),
    ('nour@cliente-demo.dev')
  ) as t(email)
  loop
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', u.email,
      extensions.crypt('Password123!', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
    values (gen_random_uuid(), uid, uid::text,
            json_build_object('sub', uid::text, 'email', u.email, 'email_verified', true),
            'email', now(), now(), now());
  end loop;
end $$;

-- Companies
insert into public.companies (owner_id, name, slug, description, website, facebook, instagram)
select id, 'Sahara Eats', 'sahara-eats',
       'Food delivery from your favourite local restaurants, in under 30 minutes.',
       'https://sahara-eats.example', 'https://facebook.com/sahara-eats', 'https://instagram.com/sahara-eats'
from auth.users where email = 'sara@cliente-demo.dev';

insert into public.companies (owner_id, name, slug, description, website, linkedin)
select id, 'PixelNote', 'pixelnote',
       'A fast, minimal note-taking app for students and teams.',
       'https://pixelnote.example', 'https://linkedin.com/company/pixelnote'
from auth.users where email = 'karim@cliente-demo.dev';

-- Feedbacks
with c as (select id, slug from public.companies),
     u as (select id, split_part(email,'@',1) as name from auth.users where email like '%@cliente-demo.dev')
insert into public.feedbacks (company_id, author_id, title, description, importance, status, is_private, response, responded_at, created_at)
select c.id, u.id, f.title, f.description, f.importance::public.importance, f.status::public.feedback_status,
       f.is_private, f.response, case when f.response is not null then now() - interval '1 day' end,
       now() - (f.days_ago || ' days')::interval
from (values
  ('sahara-eats','amina','Live order tracking on a map','I want to see where the delivery driver is instead of just "on the way".','critical','in_progress',false,'We are testing this with a few riders in Algiers now, rolling out next month!',9),
  ('sahara-eats','yacine','Pay with Edahabia card','Cash only is a problem when I order at night. Please add online payment.','critical','planned',false,'Online payment is planned for Q1. Thanks for the push!',14),
  ('sahara-eats','lina','Schedule an order for later','Let me order lunch in the morning and choose a delivery time.','important','new',false,null,4),
  ('sahara-eats','mehdi','Filter restaurants by price','A simple $, $$, $$$ filter would help a lot.','nice-to-have','new',false,null,2),
  ('sahara-eats','nour','Driver was rude on my last order','Order from Friday evening, the driver shouted at me. I prefer to report it privately.','important','new',true,null,1),
  ('sahara-eats','amina','Dark mode','The app is very bright at night.','nice-to-have','done',false,'Dark mode is live in version 2.4. Enjoy!',30),
  ('pixelnote','yacine','Offline mode','I study on the train with no internet, notes should still open.','critical','planned',false,'Offline support is our next big feature.',12),
  ('pixelnote','lina','Export notes to PDF','I need to print my notes before exams.','important','in_progress',false,null,6),
  ('pixelnote','nour','Share a notebook with classmates','Like Google Docs sharing, but for a whole notebook.','important','new',false,null,3),
  ('pixelnote','mehdi','Arabic right-to-left support','Arabic text gets mixed up when I type with French.','critical','new',false,null,5),
  ('pixelnote','amina','Markdown shortcuts','Typing # for a heading would be great.','nice-to-have','done',false,'Shipped! Try typing # or - at the start of a line.',20)
) as f(slug, author, title, description, importance, status, is_private, response, days_ago)
join c on c.slug = f.slug
join u on u.name = f.author;

-- Votes
with v(title, voter) as (values
  ('Live order tracking on a map','yacine'),('Live order tracking on a map','lina'),('Live order tracking on a map','mehdi'),('Live order tracking on a map','nour'),('Live order tracking on a map','amina'),
  ('Pay with Edahabia card','amina'),('Pay with Edahabia card','lina'),('Pay with Edahabia card','mehdi'),('Pay with Edahabia card','yacine'),
  ('Schedule an order for later','amina'),('Schedule an order for later','nour'),
  ('Filter restaurants by price','lina'),
  ('Dark mode','yacine'),('Dark mode','mehdi'),('Dark mode','nour'),
  ('Offline mode','lina'),('Offline mode','nour'),('Offline mode','mehdi'),('Offline mode','amina'),
  ('Export notes to PDF','yacine'),('Export notes to PDF','amina'),('Export notes to PDF','lina'),
  ('Share a notebook with classmates','lina'),('Share a notebook with classmates','mehdi'),
  ('Arabic right-to-left support','amina'),('Arabic right-to-left support','yacine'),('Arabic right-to-left support','nour'),('Arabic right-to-left support','lina'),('Arabic right-to-left support','mehdi'),
  ('Markdown shortcuts','nour')
)
insert into public.votes (feedback_id, user_id)
select f.id, u.id
from v
join public.feedbacks f on f.title = v.title
join auth.users u on u.email = v.voter || '@cliente-demo.dev';
