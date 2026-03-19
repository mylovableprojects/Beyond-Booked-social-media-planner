-- This file seeds default profile libraries for a given profile id.
-- Replace :profile_id with a concrete uuid in your seed runner.

insert into public.profile_event_types (profile_id, name, is_default)
values
  (:profile_id, 'Kids Birthdays', true),
  (:profile_id, 'Adult Birthdays', true),
  (:profile_id, 'Weddings', true),
  (:profile_id, 'Baby Showers', true),
  (:profile_id, 'Bridal Showers', true),
  (:profile_id, 'Graduations', true),
  (:profile_id, 'School Events', true),
  (:profile_id, 'Church Events', true),
  (:profile_id, 'Corporate Events', true),
  (:profile_id, 'Community Events', true),
  (:profile_id, 'Backyard Parties', true),
  (:profile_id, 'Holiday Parties', true),
  (:profile_id, 'Fundraisers', true),
  (:profile_id, 'Festivals', true),
  (:profile_id, 'Quinceaneras', true);

insert into public.profile_service_categories (profile_id, name, is_default)
values
  (:profile_id, 'Bounce Houses', true),
  (:profile_id, 'Combo Bounce Houses', true),
  (:profile_id, 'Water Slides', true),
  (:profile_id, 'Obstacle Courses', true),
  (:profile_id, 'Toddler Units', true),
  (:profile_id, 'Interactive Games', true),
  (:profile_id, 'Carnival Games', true),
  (:profile_id, 'Concessions', true),
  (:profile_id, 'Tables and Chairs', true),
  (:profile_id, 'Tents', true),
  (:profile_id, 'Yard Games', true),
  (:profile_id, 'Foam Parties', true),
  (:profile_id, 'Photo Booths', true),
  (:profile_id, 'Generators', true),
  (:profile_id, 'Dunk Tanks', true);
