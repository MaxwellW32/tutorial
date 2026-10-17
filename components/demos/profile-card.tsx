// No "use client" and no hooks: a pure component that just turns props into markup.
// It works in Server Components and Client Components alike.

type ProfileCardProps = {
  name: string;
  role: string;
  /** Optional: a prop with `?` can be left out. */
  skills?: string[];
};

export function ProfileCard({ name, role, skills = [] }: ProfileCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-zinc-500">{role}</p>
      {skills.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-zinc-400">No skills listed</p>
      )}
    </div>
  );
}
