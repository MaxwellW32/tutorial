import Link from "next/link";
import { Suspense } from "react";

export default function BoomPage({ searchParams }: PageProps<"/lessons/04-routing/demo/boom">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">Boom</h1>
      <p className="mt-2 text-sm">
        This page throws an error when the URL has <code className="font-mono">?crash=1</code>. The{" "}
        <code className="font-mono">error.tsx</code> next to it catches the crash.
      </p>
      <Suspense fallback={<p className="mt-4 text-sm text-zinc-500">Checking…</p>}>
        <MaybeCrash searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function MaybeCrash({ searchParams }: Pick<PageProps<"/lessons/04-routing/demo/boom">, "searchParams">) {
  const { crash } = await searchParams;
  if (crash === "1") throw new Error("You asked for it: ?crash=1");

  return (
    <Link href="/lessons/04-routing/demo/boom?crash=1" className="btn btn-outline mt-4 no-underline">
      Crash this page
    </Link>
  );
}
