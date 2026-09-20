import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_components" AS ENUM('symptom-index', 'care-program-callout');
  CREATE TYPE "public"."enum_articles_review_status" AS ENUM('draft', 'in-review', 'clinically-approved');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_components" AS ENUM('symptom-index', 'care-program-callout');
  CREATE TYPE "public"."enum__articles_v_version_review_status" AS ENUM('draft', 'in-review', 'clinically-approved');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum_plans_billing_period" AS ENUM('first-month', 'month', 'quarter', 'year');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'clinical-reviewer', 'care-team');
  CREATE TABLE "articles_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "articles_components" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_articles_components",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"review_status" "enum_articles_review_status" DEFAULT 'draft',
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"category_id" integer,
  	"hero_image_id" integer,
  	"symptom_codes" varchar,
  	"pillar_code" varchar,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_version_components" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__articles_v_version_components",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_review_status" "enum__articles_v_version_review_status" DEFAULT 'draft',
  	"version_approved_by_id" integer,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_category_id" integer,
  	"version_hero_image_id" integer,
  	"version_symptom_codes" varchar,
  	"version_pillar_code" varchar,
  	"version_source_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "symptoms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"article_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "symptoms_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"billing_period" "enum_plans_billing_period" NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "plans_locales" (
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"description" varchar,
  	"badge" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_locales" (
  	"caption" varchar,
  	"credit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "header_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "header_items_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "header_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_locales" (
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"care_program_callout_cta_href" varchar,
  	"ai_assessment_enabled" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"site_name" varchar DEFAULT 'VMC' NOT NULL,
  	"tagline" varchar,
  	"address" varchar,
  	"medical_disclaimer" varchar NOT NULL,
  	"care_program_callout_heading" varchar,
  	"care_program_callout_body" varchar,
  	"care_program_callout_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor' NOT NULL;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "symptoms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "plans_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "articles_references" ADD CONSTRAINT "articles_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_components" ADD CONSTRAINT "articles_components_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_references" ADD CONSTRAINT "_articles_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_components" ADD CONSTRAINT "_articles_v_version_components_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "symptoms_locales" ADD CONSTRAINT "symptoms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "plans_features" ADD CONSTRAINT "plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "plans_locales" ADD CONSTRAINT "plans_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_children" ADD CONSTRAINT "header_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_children_locales" ADD CONSTRAINT "header_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items" ADD CONSTRAINT "header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_items_locales" ADD CONSTRAINT "header_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_references_order_idx" ON "articles_references" USING btree ("_order");
  CREATE INDEX "articles_references_parent_id_idx" ON "articles_references" USING btree ("_parent_id");
  CREATE INDEX "articles_references_locale_idx" ON "articles_references" USING btree ("_locale");
  CREATE INDEX "articles_components_order_idx" ON "articles_components" USING btree ("order");
  CREATE INDEX "articles_components_parent_idx" ON "articles_components" USING btree ("parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_review_status_idx" ON "articles" USING btree ("review_status");
  CREATE INDEX "articles_approved_by_idx" ON "articles" USING btree ("approved_by_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_hero_image_idx" ON "articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_version_references_order_idx" ON "_articles_v_version_references" USING btree ("_order");
  CREATE INDEX "_articles_v_version_references_parent_id_idx" ON "_articles_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_references_locale_idx" ON "_articles_v_version_references" USING btree ("_locale");
  CREATE INDEX "_articles_v_version_components_order_idx" ON "_articles_v_version_components" USING btree ("order");
  CREATE INDEX "_articles_v_version_components_parent_idx" ON "_articles_v_version_components" USING btree ("parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_review_status_idx" ON "_articles_v" USING btree ("version_review_status");
  CREATE INDEX "_articles_v_version_version_approved_by_idx" ON "_articles_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_version_hero_image_idx" ON "_articles_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "symptoms_code_idx" ON "symptoms" USING btree ("code");
  CREATE INDEX "symptoms_article_idx" ON "symptoms" USING btree ("article_id");
  CREATE INDEX "symptoms_updated_at_idx" ON "symptoms" USING btree ("updated_at");
  CREATE INDEX "symptoms_created_at_idx" ON "symptoms" USING btree ("created_at");
  CREATE UNIQUE INDEX "symptoms_locales_locale_parent_id_unique" ON "symptoms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "plans_features_order_idx" ON "plans_features" USING btree ("_order");
  CREATE INDEX "plans_features_parent_id_idx" ON "plans_features" USING btree ("_parent_id");
  CREATE INDEX "plans_features_locale_idx" ON "plans_features" USING btree ("_locale");
  CREATE UNIQUE INDEX "plans_slug_idx" ON "plans" USING btree ("slug");
  CREATE INDEX "plans_updated_at_idx" ON "plans" USING btree ("updated_at");
  CREATE INDEX "plans_created_at_idx" ON "plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "plans_locales_locale_parent_id_unique" ON "plans_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_items_children_order_idx" ON "header_items_children" USING btree ("_order");
  CREATE INDEX "header_items_children_parent_id_idx" ON "header_items_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_items_children_locales_locale_parent_id_unique" ON "header_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_items_order_idx" ON "header_items" USING btree ("_order");
  CREATE INDEX "header_items_parent_id_idx" ON "header_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_items_locales_locale_parent_id_unique" ON "header_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plans_fk" FOREIGN KEY ("plans_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_symptoms_id_idx" ON "payload_locked_documents_rels" USING btree ("symptoms_id");
  CREATE INDEX "payload_locked_documents_rels_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("plans_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_references" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_components" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_references" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_components" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "symptoms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "symptoms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "plans_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_items_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_references" CASCADE;
  DROP TABLE "articles_components" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "_articles_v_version_references" CASCADE;
  DROP TABLE "_articles_v_version_components" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "symptoms" CASCADE;
  DROP TABLE "symptoms_locales" CASCADE;
  DROP TABLE "plans_features" CASCADE;
  DROP TABLE "plans" CASCADE;
  DROP TABLE "plans_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "header_items_children" CASCADE;
  DROP TABLE "header_items_children_locales" CASCADE;
  DROP TABLE "header_items" CASCADE;
  DROP TABLE "header_items_locales" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_symptoms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_plans_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faqs_fk";
  
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "media_sizes_hero_sizes_hero_filename_idx";
  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_symptoms_id_idx";
  DROP INDEX "payload_locked_documents_rels_plans_id_idx";
  DROP INDEX "payload_locked_documents_rels_faqs_id_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "symptoms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "plans_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faqs_id";
  DROP TYPE "public"."enum_articles_components";
  DROP TYPE "public"."enum_articles_review_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_components";
  DROP TYPE "public"."enum__articles_v_version_review_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_plans_billing_period";
  DROP TYPE "public"."enum_users_role";`)
}
