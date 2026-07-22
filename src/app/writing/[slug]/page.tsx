import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeftIcon } from "@/components/icons";
import { getPostBySlug, getPublishedPosts } from "@/lib/notion";

// Re-fetch from Notion at most once an hour (ISR). New posts published after a
// build are rendered on first request and then cached.
export const revalidate = 3600;

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Writing — Lê Ngọc Hà" };

  const description = post.description || undefined;
  return {
    title: `${post.title} — Lê Ngọc Hà`,
    description,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/writing/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const markdownComponents: Components = {
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
      >
        {children}
      </a>
    );
  },
};

export default async function WritingPostPage({ params }: PageParams) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const published = formatDate(post.date);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-16 font-sans md:px-12">
      <Link
        href="/#writing"
        className="group mb-12 inline-flex items-center text-sm font-semibold uppercase tracking-widest text-slate-500 hover:text-teal-300 focus-visible:text-teal-300"
      >
        <ArrowLeftIcon />
        Writing
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-200 sm:text-4xl">
            {post.title}
          </h1>
          {published && (
            <p className="mt-3 text-sm text-slate-500">
              <time dateTime={post.date}>{published}</time>
            </p>
          )}
          {post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap" aria-label="Topics">
              {post.tags.map((tag) => (
                <li key={tag} className="mr-1.5 mt-2">
                  <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                    {tag}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="prose prose-invert max-w-none prose-headings:text-slate-200 prose-a:text-teal-300 prose-strong:text-slate-200 prose-code:text-teal-300 prose-code:before:content-none prose-code:after:content-none prose-th:text-slate-200 prose-blockquote:border-l-teal-300 prose-blockquote:text-slate-400 prose-pre:border prose-pre:border-slate-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {post.markdown}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
