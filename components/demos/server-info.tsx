import os from "node:os";

/**
 * A Server Component. It imports `node:os` and reads process.env: things a browser cannot do.
 * None of this code, and none of the secrets it can see, is sent to the client. Only the HTML is.
 */
export function ServerInfo() {
  const facts = [
    ["Node.js version", process.version],
    ["Operating system", `${os.type()} (${os.arch()})`],
    ["DATABASE_URL is set", process.env.DATABASE_URL ? "yes (but the value stays on the server)" : "no"],
    ["typeof window", typeof window], // "undefined": there is no browser here
  ];

  return (
    <dl className="grid gap-1 text-sm">
      {facts.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-zinc-200 py-1.5 last:border-0 dark:border-zinc-800">
          <dt className="text-zinc-500">{label}</dt>
          <dd className="font-mono text-xs">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
