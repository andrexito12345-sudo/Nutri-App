Requisitos: Node, Postgres

Pasos:

copiar backend/.env.example → backend/.env

crear DB nutriapp_local

correr migración node backend/src/migrate_sqlite_to_pg_local.js

correr backend

correr frontend