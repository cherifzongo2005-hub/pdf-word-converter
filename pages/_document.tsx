import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Convertisseur PDF ↔ Word gratuit et rapide. Transformez vos fichiers en quelques secondes." />
        <meta property="og:title" content="DocShift — Convertisseur PDF ↔ Word" />
        <meta property="og:description" content="Convertisseur PDF ↔ Word gratuit et rapide." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
