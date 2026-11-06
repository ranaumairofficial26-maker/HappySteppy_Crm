UPDATE "SocialLinks" SET "Url" = 'https://www.facebook.com/happysteppyltd' WHERE "Platform" = 'Facebook';
UPDATE "SocialLinks" SET "Url" = 'https://www.instagram.com/happysteppy01' WHERE "Platform" = 'Instagram';
UPDATE "SocialLinks" SET "Url" = 'https://www.tiktok.com/@happysteppy.pk' WHERE "Platform" = 'TikTok';

-- Insert or update WhatsApp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "SocialLinks" WHERE "Platform" = 'WhatsApp') THEN
        INSERT INTO "SocialLinks" ("Id", "Platform", "Url", "IconName", "SortOrder", "IsActive", "IsDeleted", "CreatedAtUtc")
        VALUES (gen_random_uuid(), 'WhatsApp', 'https://wa.me/923174641903', 'whatsapp', 1, true, false, NOW());
    ELSE
        UPDATE "SocialLinks" SET "Url" = 'https://wa.me/923174641903' WHERE "Platform" = 'WhatsApp';
    END IF;
END $$;

UPDATE "WebsiteSettings" SET "Value" = '+92 317 4641903' WHERE "Key" = 'ContactPhone';

