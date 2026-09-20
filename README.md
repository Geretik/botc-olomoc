# BotC Olomouc – registrace na herní večery

Registrační web pro **Blood on the Clocktower** v Olomouci. Bez uživatelských účtů:
hráč vyplní formulář, na e-mail dostane potvrzení s tajným odkazem, přes který může
registraci upravit nebo zrušit.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions), TypeScript, Tailwind CSS
- Postgres přes [Drizzle ORM](https://orm.drizzle.team) (`pg` driver – funguje s Neon, Vercel Postgres, Supabase i lokálním Postgresem)
- E-maily přes [Resend](https://resend.com)
- Nasazení na Vercel

## Funkce

- `/` – seznam nadcházejících termínů s počtem volných míst
- `/termin/[id]` – detail termínu a registrační formulář (jméno, příjmení, přezdívka, e-mail, volitelný příchod/odchod)
- `/r/[token]` – úprava / zrušení registrace přes odkaz z e-mailu
- `/admin` – správa termínů a přehled přihlášených (chráněno heslem)

Pravidla:
- Jeden e-mail může mít na jeden termín jen jednu aktivní registraci. Při opakovaném pokusu se znovu pošle editační odkaz.
- Kapacita se kontroluje v transakci se zámkem řádku termínu, takže se nedá překročit ani při souběžných registracích.
- Zrušená registrace uvolní místo. Při nové registraci stejným e-mailem se obnoví s novým tokenem.
- Formulář obsahuje honeypot pole proti botům.
- Časy se zobrazují i zadávají v časové zóně `Europe/Prague`.

## Lokální vývoj

```bash
cp .env.example .env.local   # doplň hodnoty
npm install
npm run db:push              # vytvoří tabulky v databázi
npm run dev
```

Bez `RESEND_API_KEY` se e-maily neposílají, jen se vypisují do konzole serveru (včetně editačního odkazu).

Admin: `/admin/login`, heslo z `ADMIN_PASSWORD`.

## Proměnné prostředí

| Název | Popis |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `RESEND_API_KEY` | API klíč Resend (prázdné = e-maily jen do logu) |
| `EMAIL_FROM` | Odesílatel, např. `BotC Olomouc <registrace@tvojedomena.cz>` (doména musí být ověřená v Resend) |
| `NEXT_PUBLIC_SITE_URL` | Veřejná URL webu pro odkazy v e-mailech, bez lomítka na konci |
| `ADMIN_PASSWORD` | Heslo do adminu |
| `ADMIN_SECRET` | Náhodný řetězec pro podpis admin cookie (`openssl rand -hex 32`) |

## Nasazení na Vercel

1. Importuj repozitář do Vercelu.
2. V Marketplace přidej **Neon** (nebo jiný Postgres) – Vercel nastaví `DATABASE_URL` automaticky.
3. Přidej integraci **Resend**, ověř doménu a nastav `RESEND_API_KEY` a `EMAIL_FROM`.
4. Nastav `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`.
5. Vytvoř tabulky: lokálně s produkčním `DATABASE_URL` spusť `npm run db:push`
   (nebo použij `npm run db:generate` + `npm run db:migrate` pro migrace).
6. Deploy. Pak v `/admin` vypiš první termín.

## Skripty

- `npm run dev` / `build` / `start` / `lint`
- `npm run db:push` – synchronizuje schéma do DB (vhodné pro vývoj a malé projekty)
- `npm run db:generate`, `npm run db:migrate` – SQL migrace
- `npm run db:studio` – Drizzle Studio pro prohlížení dat
