-- Copiloto BCI — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database

-- Tabla única para todos los tipos de análisis
CREATE TABLE IF NOT EXISTS analyses (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT        NOT NULL CHECK (type IN ('reviews', 'trends', 'backlog', 'agentes')),
  data        JSONB       NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas frecuentes: último análisis por tipo
CREATE INDEX IF NOT EXISTS analyses_type_created_at_idx
  ON analyses (type, created_at DESC);

-- Row Level Security (habilitar si se expone al browser con anon key)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Política: lectura pública, escritura pública (para demo)
-- En producción reemplazar con auth de usuarios
CREATE POLICY "Lectura pública" ON analyses
  FOR SELECT USING (true);

CREATE POLICY "Escritura pública" ON analyses
  FOR INSERT WITH CHECK (true);

-- Vista helper: último análisis de cada tipo
CREATE OR REPLACE VIEW latest_analyses AS
SELECT DISTINCT ON (type)
  id, type, data, created_at
FROM analyses
ORDER BY type, created_at DESC;
