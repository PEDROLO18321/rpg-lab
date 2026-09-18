-- Vinculação de ficha à campanha do mestre (via link de compartilhamento).
--
-- CampaignMember modelava convite de usuário à campanha e nunca foi usado
-- (0 linhas). O vínculo passa a ser ficha→campanha, que é o que CampaignCharacter
-- já modelava. Campaign.ownerId ganha a chave estrangeira que faltava.
--
-- Cada passo é idempotente: a primeira tentativa desta migração parou no meio
-- (havia campanha órfã), então ela precisa poder rodar de novo sobre um banco
-- parcialmente migrado.

-- CampaignMember sai de cena.
DROP TABLE IF EXISTS "CampaignMember";
DROP TYPE IF EXISTS "CampaignRole";

-- Sem a chave estrangeira, apagar um usuário deixava campanhas sem dono. Elas
-- já eram inalcançáveis — toda leitura filtra por ownerId = usuário da sessão —,
-- então são lixo. Precisam sair antes da FK, que as recusaria.
-- Em produção isto não remove nada: a checagem lá deu 0 órfãs.
DELETE FROM "Campaign" c
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = c."ownerId");

-- Dono da campanha: FK real, some junto com o usuário.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Campaign_ownerId_fkey') THEN
    ALTER TABLE "Campaign"
      ADD CONSTRAINT "Campaign_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Ficha vinculada: quando entrou, e índices para as duas direções de consulta.
ALTER TABLE "CampaignCharacter"
  ADD COLUMN IF NOT EXISTS "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "CampaignCharacter_campaignId_idx" ON "CampaignCharacter"("campaignId");
CREATE INDEX IF NOT EXISTS "CampaignCharacter_characterId_idx" ON "CampaignCharacter"("characterId");
