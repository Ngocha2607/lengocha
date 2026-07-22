import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { getPublishedPosts, type PostMeta } from "@/lib/notion";

interface ArticleCard {
  key: string;
  year: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  /** Internal posts render on this site; external ones open Notion directly. */
  internal: boolean;
}

/**
 * Shown when the Notion integration is not configured yet, so the section is
 * never empty. Once NOTION_TOKEN + NOTION_WRITING_DB_ID are set, published
 * Notion posts take over automatically.
 */
const FALLBACK_ARTICLES: ArticleCard[] = [
  {
    key: "appsec-handbook",
    year: "2026",
    title: "Sổ tay AppSec cho Frontend — Gitleaks · Trivy · Semgrep",
    description:
      "A hands-on AppSec handbook for frontend engineers with no security background — mapping three classes of risk to three tools (Gitleaks for leaked secrets, Trivy for vulnerable dependencies, Semgrep for insecure code patterns), wiring them into pre-commit and GitLab CI, plus a runbook for when the pipeline goes red.",
    tags: ["AppSec", "Gitleaks", "Trivy", "Semgrep", "CI/CD", "DevSecOps"],
    href: "https://app.notion.com/p/S-tay-AppSec-cho-Frontend-Gitleaks-Trivy-Semgrep-3a5b7b727ddd81abb32ff56df403c846?source=copy_link",
    internal: false,
  },
];

function toCard(post: PostMeta): ArticleCard {
  return {
    key: post.id,
    year: post.date.slice(0, 4),
    title: post.title,
    description: post.description,
    tags: post.tags,
    href: `/writing/${post.slug}`,
    internal: true,
  };
}

export async function WritingSection() {
  const posts = await getPublishedPosts();
  const articles = posts.length > 0 ? posts.map(toCard) : FALLBACK_ARTICLES;

  return (
    <section
      id="writing"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Writing"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Writing
        </h2>
      </div>
      <ul className="group/list">
        {articles.map((article) => (
          <li key={article.key} className="mb-12">
            <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
              <header
                className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2"
                aria-label="year"
              >
                {article.year}
              </header>
              <div className="z-10 sm:col-span-6">
                <h3 className="font-medium leading-snug text-slate-200">
                  {article.internal ? (
                    <Link
                      className="group/link inline-flex items-baseline text-base font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
                      href={article.href}
                      aria-label={article.title}
                    >
                      <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block" />
                      <span>
                        {article.title}
                        <ArrowUpRightIcon />
                      </span>
                    </Link>
                  ) : (
                    <a
                      className="group/link inline-flex items-baseline text-base font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
                      href={article.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${article.title} (opens in a new tab)`}
                    >
                      <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block" />
                      <span>
                        {article.title}
                        <ArrowUpRightIcon />
                      </span>
                    </a>
                  )}
                </h3>
                {article.description && (
                  <p className="mt-2 text-sm leading-normal">
                    {article.description}
                  </p>
                )}
                {article.tags.length > 0 && (
                  <ul className="mt-2 flex flex-wrap" aria-label="Topics">
                    {article.tags.map((tag) => (
                      <li key={tag} className="mr-1.5 mt-2">
                        <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                          {tag}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
