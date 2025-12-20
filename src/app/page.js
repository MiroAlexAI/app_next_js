import Image from "next/image";

export default function Home() {
  return (
    <div className="page-wrapper">
      <main className="container">
        <section className="hero">
          <h1 className="title">
            Welcome to <span className="gradient-text">Antigravity</span>
          </h1>
          <p className="subtitle">
            Reliable. Scalable. Industrial-Grade Web Solutions.
          </p>

          <div className="grid">
            <a
              href="https://nextjs.org/docs"
              className="glass-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                Documentation <span>-&gt;</span>
              </h2>
              <p>Find in-depth information about Next.js features and API.</p>
            </a>

            <a
              href="https://vercel.com/templates"
              className="glass-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                Templates <span>-&gt;</span>
              </h2>
              <p>Explore starter templates for Next.js.</p>
            </a>

            <a
              href="https://vercel.com/new"
              className="glass-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                Deploy <span>-&gt;</span>
              </h2>
              <p>
                Instantly deploy your Next.js site to a shareable URL with Vercel.
              </p>
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className="logo">
            Vercel
          </span>
        </a>
      </footer>
    </div>
  );
}
