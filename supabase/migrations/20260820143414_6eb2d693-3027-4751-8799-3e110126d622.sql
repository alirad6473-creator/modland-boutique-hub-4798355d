create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "admin manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger categories_updated before update on public.categories for each row execute function public.update_updated_at_column();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  code text not null unique,
  description text,
  price numeric(12,0) not null default 0,
  compare_at_price numeric(12,0),
  stock int not null default 0,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  material text,
  brand text,
  main_image_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active products" on public.products for select to anon using (is_active);
create policy "auth read products" on public.products for select to authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_updated before update on public.products for each row execute function public.update_updated_at_column();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images(product_id);
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "public read product images" on public.product_images for select to anon, authenticated using (true);
create policy "admin manage product images" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.wholesale_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  wholesale_price numeric(12,0) not null default 0,
  min_order_qty int not null default 1,
  stock int not null default 0,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  material text,
  main_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.wholesale_products to anon;
grant select, insert, update, delete on public.wholesale_products to authenticated;
grant all on public.wholesale_products to service_role;
alter table public.wholesale_products enable row level security;
create policy "public read active wholesale" on public.wholesale_products for select to anon using (is_active);
create policy "auth read wholesale" on public.wholesale_products for select to authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin manage wholesale" on public.wholesale_products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger wholesale_updated before update on public.wholesale_products for each row execute function public.update_updated_at_column();

create sequence public.order_number_seq start 10001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default 'ML-' || nextval('public.order_number_seq')::text,
  customer_name text not null,
  phone text not null,
  province text,
  city text,
  address text not null,
  postal_code text,
  note text,
  items_total numeric(12,0) not null default 0,
  shipping_cost numeric(12,0) not null default 0,
  total numeric(12,0) not null default 0,
  payment_status text not null default 'unpaid',
  payment_ref text,
  order_status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admin read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger orders_updated before update on public.orders for each row execute function public.update_updated_at_column();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_code text,
  size text,
  color text,
  unit_price numeric(12,0) not null,
  quantity int not null,
  line_total numeric(12,0) not null
);
create index order_items_order_idx on public.order_items(order_id);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "admin read order items" on public.order_items for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.wholesale_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  store_name text,
  phone text not null,
  city text,
  approx_quantity text,
  products_wanted text,
  note text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant select, update on public.wholesale_inquiries to authenticated;
grant all on public.wholesale_inquiries to service_role;
alter table public.wholesale_inquiries enable row level security;
create policy "admin read inquiries" on public.wholesale_inquiries for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update inquiries" on public.wholesale_inquiries for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.store_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon;
grant select, insert, update, delete on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "public read settings" on public.store_settings for select to anon, authenticated using (true);
create policy "admin manage settings" on public.store_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.store_settings (key, value) values
  ('brand_name','MOD LAND'),
  ('owner_name','عباس رئیسی'),
  ('phone','09936463169'),
  ('whatsapp','09936463169'),
  ('address','شهرکرد - چهارراه فردوسی - پاساژ نگین - طبقه همکف'),
  ('shipping_cost','60000'),
  ('free_shipping_threshold','3000000'),
  ('hero_image_url',''),
  ('wholesale_hero_image_url',''),
  ('map_embed_url',''),
  ('terms_text','متن شرایط و قوانین خرید در اینجا قرار می‌گیرد و از پنل مدیریت قابل ویرایش است.'),
  ('privacy_text','متن حریم خصوصی در اینجا قرار می‌گیرد و از پنل مدیریت قابل ویرایش است.'),
  ('shipping_text','متن شرایط ارسال در اینجا قرار می‌گیرد و از پنل مدیریت قابل ویرایش است.'),
  ('returns_text','متن شرایط بازگشت کالا در اینجا قرار می‌گیرد و از پنل مدیریت قابل ویرایش است.');

insert into public.categories (slug, name, sort_order) values
  ('shalvar','شلوار',1),
  ('kapshan','کاپشن',2),
  ('tishirt','تیشرت',3),
  ('katoni','کتونی',4),
  ('accessory','اکسسوری',5),
  ('kolah','کلاه',6);