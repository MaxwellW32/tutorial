// Pretend data for the routing lesson. In a real app this would come from a database.

export type Planet = {
  slug: string;
  name: string;
  order: number;
  fact: string;
};

export const planets: Planet[] = [
  { slug: "mercury", name: "Mercury", order: 1, fact: "A year on Mercury is just 88 days long." },
  { slug: "venus", name: "Venus", order: 2, fact: "Venus spins backwards compared to most planets." },
  { slug: "earth", name: "Earth", order: 3, fact: "The only planet not named after a god." },
  { slug: "mars", name: "Mars", order: 4, fact: "Home to the tallest volcano in the solar system." },
  { slug: "jupiter", name: "Jupiter", order: 5, fact: "Its Great Red Spot is a storm bigger than Earth." },
  { slug: "saturn", name: "Saturn", order: 6, fact: "Saturn would float in a bathtub big enough to hold it." },
];

export function getPlanet(slug: string): Planet | undefined {
  return planets.find((planet) => planet.slug === slug);
}
