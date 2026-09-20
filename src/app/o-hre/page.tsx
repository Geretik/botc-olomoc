import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "O hře – Krvavá hodina odbila",
  description:
    "Co je Krvavá hodina odbila (Blood on the Clocktower), jak probíhá hra a proč stojí za to přijít.",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-2xl font-bold tracking-tight first:mt-0">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-lg font-semibold">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed">{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">{children}</ul>;
}

export default function AboutPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">O hře</h1>
      <p className="mt-2 text-muted">
        Blood on the Clocktower, česky Krvavá hodina odbila. Krátký úvod pro ty, kdo hru
        ještě nehráli.
      </p>

      <H2>Co je Krvavá hodina odbila</H2>
      <P>
        <strong>Krvavá hodina odbila</strong> je velká blafovací a sociálně dedukční hra pro
        zhruba <strong>5–20 hráčů</strong> a jednoho <strong>Vypravěče</strong>. Prakticky
        ale nejlépe funguje, když se sejde <strong>aspoň 8 lidí</strong>.
      </P>
      <P>
        Každý hráč dostane <strong>unikátní roli</strong>. Některé role patří na stranu{" "}
        <strong>dobra</strong>, jiné na stranu <strong>zla</strong>. Dobří se snaží přijít na
        to, kdo je Démon, zatímco zlí se snaží město zmást, rozhádat a dovést k chybným
        popravám.
      </P>
      <P>
        Hra se odehrává v ponurém městečku <strong>Ravenswood Bluff</strong>, kde se přes
        den vyšetřuje, vyjednává, lže, blafuje a hlasuje o popravě podezřelých. V noci pak{" "}
        <strong>Démon a jeho přisluhovači</strong> tajně útočí a další role získávají
        informace nebo používají své schopnosti.
      </P>
      <P>
        Největší rozdíl oproti klasickým dedukčním hrám je ten, že{" "}
        <strong>smrt tě nevyřadí ze hry</strong>. I mrtví hráči dál mluví, dál se snaží
        pomoct svému týmu a stále mají omezený vliv na hru. Díky tomu se nikdo nenudí a
        partie drží napětí až do konce.
      </P>
      <Card className="mt-5 space-y-1">
        <p>
          <strong>Dobro vyhraje</strong>, když se mu podaří odhalit a popravit Démona.
        </p>
        <p>
          <strong>Zlo vyhraje</strong>, když Démon přežije tak dlouho, až ve hře zůstanou jen{" "}
          <strong>dva živí hráči</strong>.
        </p>
      </Card>

      <H2>Jak probíhá hra</H2>
      <H3>1. Noc</H3>
      <Ul>
        <li>Vypravěč postupně probouzí příslušné role a vyhodnocuje jejich schopnosti.</li>
        <li>Některé postavy získávají informace, jiné někoho chrání, matou nebo zabíjejí.</li>
        <li>
          <strong>První noc</strong> bývá speciální a často rozdává důležité startovní
          informace.
        </li>
      </Ul>
      <H3>2. Den</H3>
      <Ul>
        <li>Hráči se dozví, co se během noci stalo, typicky kdo zemřel.</li>
        <li>
          Následují <strong>soukromé debaty</strong> v menších skupinkách i{" "}
          <strong>veřejná diskuze</strong>.
        </li>
        <li>
          Pak přijde na řadu <strong>nominace a hlasování</strong> o tom, kdo bude popraven.
        </li>
        <li>
          Pokud poprava projde, hráč zemře a hra pokračuje dál – nebo končí, pokud padl
          Démon.
        </li>
      </Ul>

      <H2>Proč je Krvavka tak dobrá</H2>
      <Ul>
        <li>
          každý hráč má <strong>vlastní schopnost</strong>, takže každý je důležitý
        </li>
        <li>
          i po smrti jsi <strong>pořád ve hře</strong>
        </li>
        <li>
          je tam hodně prostoru pro <strong>logiku, blafování i sociální hru</strong>
        </li>
        <li>partie bývají napínavé až do úplného konce</li>
        <li>
          funguje dobře jak pro lidi, co chtějí dedukovat, tak pro ty, co si chtějí hlavně
          povídat, kecat a motat ostatní
        </li>
      </Ul>

      <H2>Krvavka v rámci Doupěte</H2>
      <P>
        Není problém vypsat Krvavku v rámci Doupěte jako klasické klubové hraní. Když o to
        bude zájem, můžeme se domluvit a něco zorganizovat – jen je potřeba počítat s tím,
        že tahle hra chce <strong>víc lidí</strong> než běžné deskovky.
      </P>
      <P>
        Domluvu můžeme klidně řešit v rámci <strong>#chat</strong> nebo v běžném kanálu ke
        konkrétnímu klubovému hraní.
      </P>

      <H2>Další odkazy</H2>
      <Ul>
        <li>
          <a
            href="https://botc-central.web.app/krvava-hodina"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-accent"
          >
            Přehled hry na BotC Central
          </a>
        </li>
        <li>
          <a
            href="https://www.zatrolene-hry.cz/spolecenska-hra/krvava-hodina-odbila-12158/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-accent"
          >
            Krvavá hodina odbila na Zatrolených hrách
          </a>
        </li>
      </Ul>

      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Přejít na termíny
        </Link>
      </div>
    </article>
  );
}
