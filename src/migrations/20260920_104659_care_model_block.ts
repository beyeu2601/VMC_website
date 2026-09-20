import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_care_model_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"letter" varchar
  );
  
  CREATE TABLE "pages_blocks_care_model_values_locales" (
  	"name" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_care_model" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_care_model_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"intro" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_care_model_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"letter" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_care_model_values_locales" (
  	"name" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_care_model" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_care_model_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"intro" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_care_model_values" ADD CONSTRAINT "pages_blocks_care_model_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_care_model"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_care_model_values_locales" ADD CONSTRAINT "pages_blocks_care_model_values_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_care_model_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_care_model" ADD CONSTRAINT "pages_blocks_care_model_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_care_model_locales" ADD CONSTRAINT "pages_blocks_care_model_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_care_model"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_care_model_values" ADD CONSTRAINT "_pages_v_blocks_care_model_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_care_model"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_care_model_values_locales" ADD CONSTRAINT "_pages_v_blocks_care_model_values_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_care_model_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_care_model" ADD CONSTRAINT "_pages_v_blocks_care_model_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_care_model_locales" ADD CONSTRAINT "_pages_v_blocks_care_model_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_care_model"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_care_model_values_order_idx" ON "pages_blocks_care_model_values" USING btree ("_order");
  CREATE INDEX "pages_blocks_care_model_values_parent_id_idx" ON "pages_blocks_care_model_values" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_care_model_values_locales_locale_parent_id_uniq" ON "pages_blocks_care_model_values_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_care_model_order_idx" ON "pages_blocks_care_model" USING btree ("_order");
  CREATE INDEX "pages_blocks_care_model_parent_id_idx" ON "pages_blocks_care_model" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_care_model_path_idx" ON "pages_blocks_care_model" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_care_model_locales_locale_parent_id_unique" ON "pages_blocks_care_model_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_care_model_values_order_idx" ON "_pages_v_blocks_care_model_values" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_care_model_values_parent_id_idx" ON "_pages_v_blocks_care_model_values" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_care_model_values_locales_locale_parent_id_u" ON "_pages_v_blocks_care_model_values_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_care_model_order_idx" ON "_pages_v_blocks_care_model" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_care_model_parent_id_idx" ON "_pages_v_blocks_care_model" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_care_model_path_idx" ON "_pages_v_blocks_care_model" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_care_model_locales_locale_parent_id_unique" ON "_pages_v_blocks_care_model_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_care_model_values" CASCADE;
  DROP TABLE "pages_blocks_care_model_values_locales" CASCADE;
  DROP TABLE "pages_blocks_care_model" CASCADE;
  DROP TABLE "pages_blocks_care_model_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_care_model_values" CASCADE;
  DROP TABLE "_pages_v_blocks_care_model_values_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_care_model" CASCADE;
  DROP TABLE "_pages_v_blocks_care_model_locales" CASCADE;`)
}
