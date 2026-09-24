-- Índices de leitura. Puramente aditivo: nenhuma coluna, tabela ou linha é
-- tocada, e cada um se desfaz com DROP INDEX.
--
-- O Postgres não cria índice de chave estrangeira sozinho. Sem isto, listar os
-- personagens de um usuário era varredura completa da tabela, e as coleções da
-- ficha de D&D (uma consulta por relação, todas filtrando por sheetId) também.

-- A listagem filtra por dono e ordena por atualização; o índice composto,
-- com a ordenação embutida, cobre as duas coisas numa varredura só.
CREATE INDEX "Character_userId_updatedAt_idx" ON "Character"("userId", "updatedAt" DESC);
CREATE INDEX "Character_systemId_idx" ON "Character"("systemId");

-- Coleções da ficha de D&D. DndSkill fica de fora: o @@unique([sheetId,
-- skillName]) já dá um índice com sheetId no prefixo.
CREATE INDEX "DndClass_sheetId_idx" ON "DndClass"("sheetId");
CREATE INDEX "DndEquipment_sheetId_idx" ON "DndEquipment"("sheetId");
CREATE INDEX "DndFeature_sheetId_idx" ON "DndFeature"("sheetId");
CREATE INDEX "DndSpell_sheetId_idx" ON "DndSpell"("sheetId");
