import Image from "next/image";
import { Badge } from "@/components/demos/styling/badge";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("06-styling");

export default function Lesson() {
  return (
    <LessonPage slug="06-styling">
      <h2>Tailwind CSS: styling with class names</h2>
      <p>
        Almost every style in this project is a Tailwind utility class: <code>p-4</code> is padding, <code>flex</code> is
        display flex, <code>text-sm</code> is a small font. You never leave the component file, and you never invent class
        names. It feels odd for a day and then it is hard to go back.
      </p>
      <CodeBlock
        code={`
<div className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 sm:flex sm:items-center sm:gap-4 dark:border-zinc-800">
  <Image src="/globe.svg" alt="" width={48} height={48} className="shrink-0" />
  <div>
    <p className="font-semibold">Tailwind card</p>
    <p className="text-sm text-zinc-500">Padding, border, radius, flex, hover and dark mode from class names alone.</p>
  </div>
</div>
`}
      />
      <Demo title="The card above, rendered">
        <div className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 sm:flex sm:items-center sm:gap-4 dark:border-zinc-800 dark:hover:bg-zinc-900">
          <Image src="/globe.svg" alt="" width={48} height={48} className="shrink-0 dark:invert" />
          <div>
            <p className="font-semibold">Tailwind card</p>
            <p className="text-sm text-zinc-500">Padding, border, radius, flex, hover and dark mode from class names alone.</p>
          </div>
        </div>
      </Demo>
      <p>The prefixes are the part worth memorising:</p>
      <ul>
        <li>
          <code>sm:</code> <code>md:</code> <code>lg:</code> apply from that screen width <em>up</em>. Design for the phone
          first, then add <code>md:flex</code> for bigger screens.
        </li>
        <li>
          <code>hover:</code> <code>focus:</code> <code>disabled:</code> are states.
        </li>
        <li>
          <code>dark:</code> applies when the user prefers a dark colour scheme. This whole tutorial follows your system
          theme that way.
        </li>
      </ul>
      <p>
        Setup is three lines: <code>@import &quot;tailwindcss&quot;;</code> at the top of <code>app/globals.css</code>, that
        file imported once in the root layout, and the <code>@tailwindcss/turbopack</code> loader in{" "}
        <code>next.config.ts</code>. Tailwind scans your files for class names and generates only the CSS you use.
      </p>
      <Callout kind="tip">
        <p>
          Install the <em>Tailwind CSS IntelliSense</em> VS Code extension: hover any class to see the CSS it produces, and
          get autocomplete. The docs at tailwindcss.com are searchable by CSS property, so &quot;justify-content&quot;
          finds <code>justify-between</code>.
        </p>
      </Callout>

      <h2>Design tokens in globals.css</h2>
      <p>
        Tailwind v4 is configured in CSS, not in a JavaScript file. The <code>@theme</code> block turns CSS variables into
        utilities: because <code>--color-background</code> is defined, <code>bg-background</code> exists.
      </p>
      <CodeBlock
        filename="app/globals.css"
        lang="css"
        code={`
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);   /* → bg-background, text-background */
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);     /* → font-sans (set up by next/font below) */
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
`}
      />
      <p>
        Global CSS is still the right tool for a few things: resets, the prose rules that style these lesson pages (
        <code>.lesson h2</code>), and anything a third-party library needs. Keep it short.
      </p>

      <h2>CSS Modules: scoped plain CSS</h2>
      <p>
        When Tailwind gets in the way (complex animations, a third-party widget), write ordinary CSS in a file ending in{" "}
        <code>.module.css</code>. Every class in it is renamed to something unique at build time, so <code>.badge</code>{" "}
        here can never clash with a <code>.badge</code> elsewhere.
      </p>
      <CodeBlock
        filename="components/demos/styling/badge.tsx"
        code={`
import styles from "./badge.module.css";        // an object: { badge: "badge_x8f2k", success: "success_j21a", … }

export function Badge({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "success" | "danger" }) {
  return <span className={\`\${styles.badge} \${styles[tone]}\`}>{children}</span>;
}
`}
      />
      <Demo title="CSS Modules" source="components/demos/styling/badge.module.css">
        <div className="flex gap-2">
          <Badge>neutral</Badge>
          <Badge tone="success">success</Badge>
          <Badge tone="danger">danger</Badge>
        </div>
      </Demo>

      <h2>Fonts with next/font</h2>
      <p>
        <code>next/font</code> downloads the font at build time and serves it from your own site. No request to Google when
        a visitor loads the page, no flash of unstyled text, and no layout shift.
      </p>
      <CodeBlock
        filename="app/layout.tsx"
        code={`
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={\`\${geistSans.variable} \${geistMono.variable}\`}>
      <body className="font-sans">{children}</body>   {/* font-sans → --font-sans → --font-geist-sans */}
    </html>
  );
}
`}
      />
      <p>
        For a font file you own, <code>next/font/local</code> works the same way with a <code>src</code> path.
      </p>

      <h2>Images with next/image</h2>
      <p>
        <code>&lt;Image&gt;</code> is an <code>&lt;img&gt;</code> that resizes to the device, converts to modern formats,
        lazy-loads, and reserves space so the page does not jump while it loads. That last part is why{" "}
        <code>width</code> and <code>height</code> are required (or <code>fill</code> to stretch to the parent).
      </p>
      <CodeBlock
        code={`
import Image from "next/image";
import globe from "@/public/globe.svg";   // static import: width and height are read from the file

<Image src="/globe.svg" alt="A globe" width={96} height={96} />      // from the public/ folder
<Image src={globe} alt="A globe" />                                   // static import, size known
<Image src={user.image} alt="" width={56} height={56} />              // remote URL (see below)
`}
      />
      <Demo title="next/image">
        <div className="flex items-center gap-6">
          <Image src="/globe.svg" alt="A globe" width={96} height={96} className="dark:invert" />
          <p className="text-sm text-zinc-500">
            Right-click → inspect: notice the <code className="font-mono">srcset</code>, <code className="font-mono">loading=&quot;lazy&quot;</code>{" "}
            and the fixed dimensions.
          </p>
        </div>
      </Demo>
      <p>
        Remote images must be allowed in <code>next.config.ts</code>, otherwise anyone could make your server resize
        arbitrary files. The account page shows Google profile pictures, so:
      </p>
      <CodeBlock
        filename="next.config.ts"
        lang="ts"
        code={`
images: {
  remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
},
`}
      />

      <h2>Metadata: the &lt;head&gt; of your pages</h2>
      <p>
        You never write <code>&lt;title&gt;</code> or <code>&lt;meta&gt;</code> tags by hand. Export a{" "}
        <code>metadata</code> object from a layout or page, and Next.js builds the head for you, including Open Graph tags
        for link previews.
      </p>
      <CodeBlock
        filename="app/layout.tsx"
        code={`
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Next.js Tutorial", template: "%s · Next.js Tutorial" },   // pages fill in the %s
  description: "A hands-on guide to Next.js, React and TypeScript.",
};
`}
      />
      <CodeBlock
        filename="app/lessons/04-routing/demo/[slug]/page.tsx"
        code={`
// When the title depends on data, export an async generateMetadata instead:
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPlanet(slug)?.name ?? "Planet not found" };
}
`}
      />
      <p>
        File conventions cover the rest: <code>app/favicon.ico</code> is the favicon, <code>app/opengraph-image.png</code>{" "}
        is the social preview image, <code>app/robots.ts</code> and <code>app/sitemap.ts</code> generate those files.
      </p>

      <h2>Your first try</h2>
      <p>Change one class name and see the effect:</p>
      <ol>
        <li>
          Open <code>app/lessons/06-styling/page.tsx</code> (this page).
        </li>
        <li>
          Find <code>&lt;p className=&quot;font-semibold&quot;&gt;Tailwind card&lt;/p&gt;</code> inside the first demo and
          change the class to <code>font-semibold text-violet-600</code>.
        </li>
        <li>Save. The card title turns purple. Try <code>text-2xl</code> or <code>underline</code> too.</li>
      </ol>
      <p>
        <strong>If you want more:</strong> add a <code>warning</code> tone to <code>Badge</code>. That is one CSS rule in{" "}
        <code>badge.module.css</code> and one more option in the <code>tone</code> union.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>Tailwind for nearly everything, CSS Modules for the rest, global CSS for resets and prose.</li>
        <li>
          <code>next/font</code> and <code>next/image</code> solve performance problems you would otherwise meet later.
        </li>
        <li>
          Export <code>metadata</code> (or <code>generateMetadata</code>) instead of writing head tags.
        </li>
      </ul>
    </LessonPage>
  );
}
