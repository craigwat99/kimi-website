import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const fallbackNames = [
  'Alan Ottaway', 'Alan Seymour', 'Alexander Turnbull', 'Alexis Kennedy', 'Alice Mills',
  'Alison Laurie', 'Amanda Ashley', 'Amy Bock', 'Arthur Tauhore', 'Barry Neels',
  'Bea Arthur', 'Betty Armstrong', 'Bill Gosden', 'Billy Farnell', 'Brett Sheppard',
  'Brian Andrews', 'Brian Brake', 'Briar Bentley', 'Bruce Burnett', 'Bruce Mason',
  'Carmen Rupe', 'Cees Kooge', 'Charles Aberhart', 'Charles Brasch', 'Charles Mackay',
  'Charlie Haigh', 'Charlotte Loh', 'Cherie Hardie-Rippon', 'Chrissy Witoko', 'Christopher Small',
  'Claude Tanner', 'Cliff McIntyre', 'Cole Hampton', 'Dana de Milo', 'Dana DePaul',
  'Daniel Beech', 'Daniel Fielding', 'Darren Horn', 'Darren Taylor aka Bambi Slut',
  'David Carson-Parker', 'David Halls', 'David Lyndon Brown', 'David Malo', 'David McNee',
  'David Milne aka Dorabella', 'David Russell', 'Derek Elvy', 'Derek Jarman', 'Diksy Jones',
  'Donald Stenhouse', 'Dorothy Kate Richmond aka Dolla', 'Douglas Hughes', 'Douglas Lilburn',
  'Douglas MacDiarmid', 'Douglas Wright', 'Ed Manson', 'Effie Pollen', 'Emma Ada Scott',
  'Eric McCormick', 'Ernie Webber', 'Etipasi Daniells-Silva', 'Eve van Grafhorst', 'Felix Kelly',
  'Fergus Collinson', 'Fergus Dick', 'Frances Hodgkins', 'Frank Lund aka Toni Roget',
  'Frank Sargeson', 'Freda Stark', 'Gavin McLean', 'Geoffrey Busch Geertsema', 'Georgina Beyer',
  'Gerald Turnbull', 'Glyn Philpot', 'Godfrey Wilson', 'Grant Lingard', 'Hana Tatere Knight',
  'Harold Robinson', 'Hayden Miles', 'Heather McPherson', 'Henare te Ua', 'Henry Dennis',
  'Henry Harry Holland', 'Hjelmar von Dannevill', 'Ian Kember', 'Ian McMinn', 'Ian Smith',
  'Ihaia Gillman-Harris', 'Jack Body', 'Jack Goodwin', 'James Brownhill', 'James Courage',
  'Jan Smith', 'Jan Wilson', 'Jane Khull', 'Jeff Fowler', 'Jeff Whittington',
  'Jerome Vlietstra', 'Jim Robb', 'John Jakeman', 'John Kiddie', 'John Mansfield Thomson',
  'John Templer', 'Johnny Croskery', 'Jonathan Dennis', 'Jonathan Mane-Wheoki',
  'Katherine Mansfield', 'Keri Hulme', 'Kevin Baker', 'Kevin Todd', 'Larry Jenkins',
  'Lawrence Baigent', 'Lee Jensen', 'Leo Bensemann', 'Leonard Hollobon', 'Leslie Mack',
  'Lew Pryme', 'Lindsay Taylor', 'Maata Mahupuku', 'Mahinarangi Tocker', 'Malcolm Harrison',
  'Mama Tere Strickland', 'Manawaroa Te Wao', 'Marcus Craig', 'Margaret Nielsen', 'Martin Hunt',
  'Matt Whyte', 'Matt Wildbore', 'Matthew Soeberg', 'Meg Torwl', 'Merton Hodge',
  'Miles Radcliffe', 'Murray Hammington', 'Neil Costelloe', 'Neil Grange', 'Neville Creighton',
  'Ngaio Marsh', 'Nigel Baumber', 'Norman Gibson', 'Olive Te Oriwia Harding', 'Pat Rosier',
  'Paul Jenden', 'Paul Noble', 'Paul Perry', 'Peggy Dawson', 'Peter Cuthbert',
  'Peter Ellis', 'Peter Gordon', 'Peter Hudson', 'Peter Marshall', 'Peter Rule',
  'Peter Sinclair', 'Peter Sumner', 'Peter Taylor', 'Peter Wells', 'Phil Smees',
  'Philip Bailey', 'Phillip Cottrell', 'Porleen Simmonds', 'Prudence de Villiers', 'Rae Gilmour',
  'Ralph Knowles', 'Rangikawhiua Patrick Chadwick', 'Renee Taylor', 'Rewi Alley', 'Rex Mason',
  'Rex Nan Kivell', 'Rex Pilgrim', 'Robert Erwin', 'Robert Gant', 'Robert Lord',
  'Robert Mervyn', 'Robert Woolf', 'Robin Duff', 'Robin Henderson', 'Rod McLeod Morrison',
  'Roman Skorek', 'Ron Brownson', 'Ross Burden', 'Roy Ayling', 'Ruth Charters',
  'Seaward MacGregor', 'Shane Town', 'Sharon Alston', 'Shelley Te Waiariki Howard',
  'Sister Paula Brettkelly', "So'oalo To'oto'oali'i Roger Stanley", 'Stanley Waipouri',
  'Sue Dunlop', 'Susan Bartel', 'Suzi Fray', 'Takuwai Makiri-Mason', 'Thelma Trott',
  'Theo Schoon', 'Thomas Ongley', 'Tom McLean', "Tom O'Donoghue", 'Tony Mackle',
  'Toss Woollaston', 'Trevor Lawler', 'Trevor Morley', 'Ursula Bethell', 'Vanessa Wedding',
  'Venn Young', 'Vern Keller', 'Victor Taurewa Biddle', 'Virginia Burns aka Virginia Parker-Bowles',
  'Warren Butler', 'Warren Douglas', 'Wilfred Ford', 'William Leith', 'William Taylor',
  'William Yate', 'Wimoka Smith', 'Yoka Neuman', 'Zena Campbell',
];

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  try {
    const store = getStore("remembrance-names");

    // Load custom names from Blobs
    const { blobs } = await store.list();
    const customNames: { id: string; name: string; source: string; createdAt: string }[] = [];
    const customNameValues = new Set<string>();

    for (const blob of blobs) {
      if (blob.key === "__removed_fallback__") continue;
      try {
        const data = await store.get(blob.key, { type: "json" }) as { name: string; createdAt: string } | null;
        if (data) {
          customNames.push({ id: blob.key, name: data.name, source: "custom", createdAt: data.createdAt });
          customNameValues.add(data.name);
        }
      } catch {
        // Skip invalid entries
      }
    }

    // Load removed fallback names list
    let removedFallback: string[] = [];
    try {
      const removed = await store.get("__removed_fallback__", { type: "json" }) as { names: string[] } | null;
      if (removed?.names) {
        removedFallback = removed.names;
      }
    } catch {
      // No removed list yet
    }
    const removedSet = new Set(removedFallback);

    // Build the full list: fallback names (not removed, not duplicated by custom) + custom names
    const names: { id: string; name: string; source: string; createdAt: string }[] = [];

    for (const fname of fallbackNames) {
      if (removedSet.has(fname)) continue;
      if (customNameValues.has(fname)) continue;
      names.push({
        id: `fallback:${fname}`,
        name: fname,
        source: "builtin",
        createdAt: "",
      });
    }

    names.push(...customNames);
    names.sort((a, b) => a.name.localeCompare(b.name));

    return new Response(JSON.stringify({ names }), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching remembrance names:", err);
    // On error, still return the fallback list
    const names = fallbackNames.map(name => ({
      id: `fallback:${name}`,
      name,
      source: "builtin",
      createdAt: "",
    }));
    return new Response(JSON.stringify({ names }), { status: 200, headers });
  }
};
