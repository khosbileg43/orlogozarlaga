npm i @prisma/client
".env" gdg file uusgene
dotor ni DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orlogozarlaga-postgres"

docker run --name orlogozarlaga-postgres \
 -e POSTGRES_PASSWORD=postgres \
 -e POSTGRES_DB=orlogozarlaga \
 -p 5432:5432 \
 -d postgres:16
npx prisma migrate dev
npx prisma db seed
