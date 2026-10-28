// Seed data and shared types for the Avancado prototype.
// Everything lives in local state (see store.tsx); nothing is persisted to a server.

export type UserPage = "home" | "sitters" | "community" | "map" | "pets" | "profile" | "publicProfile" | "messages" | "terms" | "safety" | "privacy";
export type VerificationStatus = "unverified" | "pending" | "verified";
export type SpotCategory = "Parks & Off-Leash" | "Cafes & Restaurants" | "Pubs & Breweries" | "Retail & Shops" | "Pet Services" | "Hotels" | "Hiking Trails";

export const ME = "Maya Thompson";

export const photos = {
  hero: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1400&q=85",
  dog1: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
  dog2: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85",
  dog3: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85",
  dog4: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=85",
  dog5: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=85",
  cat1: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=85",
  cat2: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=85",
  cat3: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=85",
  spot1: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=85",
  spot2: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=85",
  spot3: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=85",
  avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85",
  avatar2: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85",
  avatar3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=85",
  avatar4: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85",
  avatar5: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85",
  avatar6: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85",
};

// ---------- People ----------

export type Person = { name: string; avatar?: string; location: string; bio: string; sits: number; rating: number; reviews: number; verified: boolean; since: string };

export const people: Person[] = [
  { name: "Maya Thompson", avatar: photos.avatar1, location: "Kitsilano, Vancouver", bio: "Pet parent to Sunny and Luna, and an experienced weekend sitter. I love long seawall walks, enrichment games, and helping nervous pets feel at home.", sits: 18, rating: 4.9, reviews: 16, verified: true, since: "2022" },
  { name: "Daniel Kim", avatar: photos.avatar2, location: "Kitsilano, Vancouver", bio: "Morning runner and big-dog fan. I walk large breeds most mornings near Kits Beach and I am happy to send photo updates.", sits: 24, rating: 4.9, reviews: 24, verified: true, since: "2021" },
  { name: "Ava Brooks", avatar: photos.avatar3, location: "Coal Harbour, Vancouver", bio: "Vet-clinic receptionist with medication experience. Cats are my favourite, but I have never met a dog I did not like.", sits: 11, rating: 4.8, reviews: 11, verified: true, since: "2023" },
  { name: "Marcus Chen", avatar: photos.avatar4, location: "Mount Pleasant, Vancouver", bio: "Weekend dog walker for active breeds. References available on request.", sits: 7, rating: 4.7, reviews: 7, verified: true, since: "2023" },
  { name: "Liam Nguyen", avatar: photos.avatar6, location: "Kitsilano, Vancouver", bio: "Border collie dad. Usually at the beach with a ball launcher.", sits: 3, rating: 4.6, reviews: 3, verified: true, since: "2024" },
  { name: "Ethan Wilson", avatar: photos.avatar2, location: "Grandview, Vancouver", bio: "Cat person living near Commercial Drive.", sits: 0, rating: 0, reviews: 0, verified: false, since: "2025" },
  { name: "Emily Carter", location: "Kitsilano, Vancouver", bio: "Senior beagle owner.", sits: 2, rating: 5, reviews: 2, verified: true, since: "2022" },
  { name: "Noah Williams", avatar: photos.avatar4, location: "Mount Pleasant, Vancouver", bio: "Lab owner and weekend hiker.", sits: 1, rating: 4.8, reviews: 1, verified: true, since: "2023" },
  { name: "Sophia Lee", avatar: photos.avatar5, location: "West End, Vancouver", bio: "Goldendoodle mom.", sits: 4, rating: 4.9, reviews: 4, verified: true, since: "2022" },
  { name: "Grace Park", location: "Yaletown, Vancouver", bio: "Cavalier owner who works evenings.", sits: 0, rating: 0, reviews: 0, verified: true, since: "2024" },
  { name: "Lucas Martin", location: "Commercial Drive, Vancouver", bio: "Cat dad to Pepper.", sits: 0, rating: 0, reviews: 0, verified: true, since: "2024" },
];

export const findPerson = (name: string): Person => people.find((p) => p.name === name) || { name, location: "Vancouver", bio: "Avancado community member.", sits: 0, rating: 0, reviews: 0, verified: false, since: "2025" };
export const firstName = (name: string) => name.split(" ")[0];

// ---------- Community ----------

export type PostStatus = "normal" | "lost" | "found";
export type CommunityPost = { id: number; author: string; pet: string; caption: string; likes: number; image: string; date: string; location: string; status: PostStatus; hidden?: boolean };

export const seedPosts: CommunityPost[] = [
  { id: 5, author: "Maya Thompson", pet: "Luna, Domestic Shorthair", caption: "LOST PET: Luna slipped out of our Kitsilano apartment this morning. Grey tabby, very shy, pink collar with a bell. Please message me if you see her.", likes: 42, image: photos.cat3, date: "1 hour ago", location: "W 4th & Vine", status: "lost" },
  { id: 1, author: "Maya Thompson", pet: "Sunny, Golden Retriever", caption: "Found the perfect sunset spot after our long walk. Sunny refused to leave until the very last ray disappeared.", likes: 128, image: photos.dog1, date: "2 hours ago", location: "Spanish Banks", status: "normal" },
  { id: 2, author: "Liam Nguyen", pet: "Milo, Border Collie", caption: "Milo made three new friends at the beach today.", likes: 94, image: photos.dog3, date: "Yesterday", location: "Kitsilano Beach", status: "normal" },
  { id: 4, author: "Ethan Wilson", pet: "Ginger, Maine Coon", caption: "LOST PET: Ginger slipped out near East 12th Avenue last night. She is shy, wearing a teal collar, and may be hiding under porches. Please message me if seen.", likes: 51, image: photos.cat1, date: "38 minutes ago", location: "East 12th & Fraser", status: "lost" },
  { id: 3, author: "Ava Brooks", pet: "Poppy, Golden Retriever", caption: "Coffee stop before our seawall adventure. The team even brought Poppy her own water bowl.", likes: 76, image: photos.dog2, date: "May 19", location: "Coal Harbour", status: "normal" },
];

// ---------- Sitter board ----------

export type RequestStatus = "Open" | "Matched" | "Done";
export type Applicant = { name: string; note: string; applied: string };
export type SitterRequest = {
  id: string; owner: string; petId?: string; pet: string; petType: "Dog" | "Cat"; breed: string; age: string; weight: string; vaccinated?: boolean;
  title: string; area: string; date: string; posted: string; time: string; duration: string; image: string; description: string;
  status: RequestStatus; applicants: Applicant[]; matched?: string; cancelled?: string; ownerRating?: number; hidden?: boolean;
};
export type ApplicationStatus = "Applied" | "Matched" | "Done";
export type MyApplication = { status: ApplicationStatus; note: string; ownerReview?: "good" | "bad" };

const sunnyApplicants: Applicant[] = [
  { name: "Daniel Kim", note: "Hi! I’d love to look after Sunny because I walk large dogs every morning near Kitsilano Beach. I can stay until you are home.", applied: "Applied Jun 10" },
  { name: "Ava Brooks", note: "Hello! I have medication experience and I’m free on the evening of June 12. Happy to meet Sunny beforehand.", applied: "Applied Jun 10" },
  { name: "Marcus Chen", note: "Hi Maya, I do weekend care for active dogs and can bring references. Sunny looks like a sweetheart!", applied: "Applied Jun 11" },
];

export const seedRequests: SitterRequest[] = [
  { id: "SR-2408", owner: "Emily Carter", petId: "pet-charlie", pet: "Charlie", petType: "Dog", breed: "Beagle", age: "9 years", weight: "13 kg", vaccinated: true, title: "Weekend walks for my gentle senior beagle", area: "Kitsilano", date: "May 24", posted: "2 hours ago", time: "9:00 AM – 12:00 PM", duration: "3 hours", applicants: [{ name: "Daniel Kim", note: "Happy to help with Charlie.", applied: "Applied May 20" }, { name: "Marcus Chen", note: "I love senior dogs.", applied: "Applied May 21" }, { name: "Ava Brooks", note: "I can give medication.", applied: "Applied May 21" }, { name: "Liam Nguyen", note: "Free that weekend.", applied: "Applied May 22" }], image: photos.dog1, status: "Open", description: "Charlie loves calm neighbourhood walks and plenty of sniffing time. I need someone patient who can give his morning medication with breakfast, take him on a relaxed walk, and stay with him until noon." },
  { id: "SR-2406", owner: "Sophia Lee", petId: "pet-coco", pet: "Coco", petType: "Dog", breed: "Poodle", age: "2 years", weight: "10 kg", vaccinated: true, title: "Morning walk near Stanley Park", area: "West End", date: "May 28", posted: "May 20", time: "7:30 AM – 9:00 AM", duration: "1.5 hours", applicants: [{ name: "Daniel Kim", note: "I run the seawall daily.", applied: "Applied May 20" }, { name: ME, note: "Hi Sophia! I walk Sunny on the seawall most mornings and would love to bring Coco along.", applied: "Applied May 21" }], image: photos.dog3, status: "Open", description: "Coco needs a brisk morning loop around the seawall while I am at an early appointment. She is friendly with people and other dogs and responds well to treats." },
  { id: "SR-2404", owner: "Lucas Martin", petId: "pet-pepper", pet: "Pepper", petType: "Cat", breed: "Domestic Shorthair", age: "6 years", weight: "5 kg", vaccinated: false, title: "Cat check-in while I visit family", area: "Commercial Drive", date: "May 30", posted: "3 days ago", time: "8:00 AM and 6:00 PM", duration: "30 minutes per visit", applicants: [{ name: "Ava Brooks", note: "Cats are my favourite!", applied: "Applied May 27" }, { name: "Marcus Chen", note: "Can do both visits.", applied: "Applied May 27" }, { name: "Daniel Kim", note: "Happy to help.", applied: "Applied May 28" }], image: photos.cat2, status: "Open", description: "Pepper needs two daily visits for food, fresh water, litter care, and a little playtime. She is affectionate once she gets comfortable." },
  { id: "SR-2401", owner: ME, petId: "pet-sunny", pet: "Sunny", petType: "Dog", breed: "Golden Retriever", age: "4 years", weight: "29 kg", vaccinated: true, title: "Help with Sunny after my late meeting", area: "Kitsilano", date: "June 12", posted: "1 hour ago", time: "6:00 PM – 8:00 PM", duration: "2 hours", applicants: sunnyApplicants, image: photos.dog1, status: "Open", description: "I am looking for a nearby neighbour to take Sunny for his evening walk, serve dinner, and keep him company until I return. He walks well on a leash, loves tennis balls, and his food is pre-measured in the pantry." },
  { id: "SR-2407", owner: "Noah Williams", petId: "pet-milo", pet: "Milo", petType: "Dog", breed: "Labrador Retriever", age: "3 years", weight: "31 kg", vaccinated: true, title: "Playful lab needs an afternoon companion", area: "Mount Pleasant", date: "May 23", posted: "Yesterday", time: "1:30 PM – 5:30 PM", duration: "4 hours", applicants: [{ name: ME, note: "Milo sounds like a blast!", applied: "Applied May 21" }], matched: ME, image: photos.dog5, status: "Matched", description: "Milo is energetic, social, and happiest after a good game of fetch. Looking for someone comfortable with larger dogs to walk, play, and serve his dinner." },
  { id: "SR-2405", owner: "Grace Park", petId: "pet-biscuit", pet: "Biscuit", petType: "Dog", breed: "Cavalier King Charles Spaniel", age: "5 years", weight: "8 kg", vaccinated: true, title: "Quiet company during an evening appointment", area: "Yaletown", date: "May 18", posted: "May 12", time: "5:30 PM – 9:00 PM", duration: "3.5 hours", applicants: [{ name: ME, note: "Happy to keep Biscuit company.", applied: "Applied May 12" }], matched: ME, image: photos.dog4, status: "Done", description: "Biscuit needed a calm neighbour to keep her company, serve dinner, and take one short evening walk. The sitting was completed successfully." },
  { id: "SR-2403", owner: ME, petId: "pet-sunny", pet: "Sunny", petType: "Dog", breed: "Golden Retriever", age: "4 years", weight: "29 kg", vaccinated: true, title: "Neighbour needed for Sunny’s Saturday walk", area: "Kitsilano", date: "June 7", posted: "4 days ago", time: "10:00 AM – 12:00 PM", duration: "2 hours", applicants: [sunnyApplicants[0], sunnyApplicants[2]], matched: "Daniel Kim", image: photos.dog1, status: "Matched", description: "Sunny needs a relaxed beach walk and play session while I attend an appointment." },
  { id: "SR-2402", owner: ME, petId: "pet-luna", pet: "Luna", petType: "Cat", breed: "Domestic Shorthair", age: "3 years", weight: "4.6 kg", vaccinated: true, title: "Luna’s afternoon check-in", area: "Kitsilano", date: "April 16", posted: "April 9", time: "2:00 PM – 3:00 PM", duration: "1 hour", applicants: [sunnyApplicants[1]], matched: "Ava Brooks", image: photos.cat3, status: "Done", description: "A neighbour checked Luna’s food, refreshed her water, and spent some quiet playtime with her." },
];

export const seedApplications: Record<string, MyApplication> = {
  "SR-2406": { status: "Applied", note: "Hi Sophia! I walk Sunny on the seawall most mornings and would love to bring Coco along." },
  "SR-2407": { status: "Matched", note: "Milo sounds like a blast!" },
  "SR-2405": { status: "Done", note: "Happy to keep Biscuit company." },
};

// ---------- My Pets ----------
// Mirrors the team ERD (Pet + one table per log type + EmergencyContact).
// Dates are ISO strings: "YYYY-MM-DD" for date columns, "YYYY-MM-DDTHH:mm" for timestamptz.

export type Species = "dog" | "cat"; // not in the ERD yet (listed as an open item), but the UI needs it
export type Gender = "Male" | "Female";
export type Pet = { id: string; owner: string; species: Species; name: string; breed: string; birthDate: string; weight: number; gender: Gender; isNeutered: boolean; isVaccinated: boolean; notes: string; imageUrl: string; updatedAt: string };

/** Age shown in the UI, worked out from the stored birth date so it stays correct every year. */
export const petAge = (birthDate: string) => {
  if (!birthDate) return "Age unknown";
  const born = new Date(`${birthDate}T12:00`), now = new Date();
  let months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;
  if (months < 1) return "Under 1 month";
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"}`;
  const yrs = Math.floor(months / 12);
  return `${yrs} ${yrs === 1 ? "year" : "years"}`;
};

export type ToiletLog = { id: string; petId: string; type: "Poop" | "Pee"; loggedAt: string; notes: string };
export type FoodLog = { id: string; petId: string; foodName: string; amount: number; unit: string; eatenAt: string; notes: string };
export type WeightLog = { id: string; petId: string; weight: number; measuredOn: string };
export type VaccineLog = { id: string; petId: string; vaccineName: string; administeredOn: string; nextDueOn: string; notes: string };
export type VetVisitLog = { id: string; petId: string; visitedOn: string; clinicName: string; reason: string; notes: string };
export type WalkLog = { id: string; petId: string; startedAt: string; durationMinutes: number; distanceKm: number; notes: string };
export type EmergencyContact = { id: string; petId: string; clinicName: string; phone: string; address: string; notes: string };

export type PetLogs = { toilet: ToiletLog[]; food: FoodLog[]; weight: WeightLog[]; vaccine: VaccineLog[]; vet: VetVisitLog[]; walk: WalkLog[]; emergency: EmergencyContact[] };
export type LogKind = keyof PetLogs;

/** Local "YYYY-MM-DD" for a day offset from today (0 = today, -1 = yesterday). */
export const isoDay = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const at = (offset: number, time: string) => `${isoDay(offset)}T${time}`;

export const seedPets: Pet[] = [
  { id: "pet-sunny", owner: ME, species: "dog", name: "Sunny", breed: "Golden Retriever", birthDate: "2022-03-14", weight: 29, gender: "Male", isNeutered: true, isVaccinated: true, notes: "Playful, friendly, and happiest on long neighbourhood walks. Loves people, gentle dogs, and a good game of fetch. Allergic to chicken.", imageUrl: photos.dog1, updatedAt: isoDay(0) },
  { id: "pet-luna", owner: ME, species: "cat", name: "Luna", breed: "Domestic Shorthair", birthDate: "2023-06-02", weight: 4.6, gender: "Female", isNeutered: true, isVaccinated: true, notes: "Gentle and cuddly once she feels comfortable. Indoor cat who enjoys quiet company and short play sessions.", imageUrl: photos.cat3, updatedAt: isoDay(-2) },
  // Other owners' pets. They never appear in My Pets; their care notes show on those owners' sitter requests.
  { id: "pet-charlie", owner: "Emily Carter", species: "dog", name: "Charlie", breed: "Beagle", birthDate: "2017-05-10", weight: 13, gender: "Male", isNeutered: true, isVaccinated: true, notes: "Senior and gentle. Takes a joint supplement with breakfast (in the blue jar). Slow walker who loves to sniff. Pulls toward squirrels.", imageUrl: photos.dog1, updatedAt: isoDay(-3) },
  { id: "pet-coco", owner: "Sophia Lee", species: "dog", name: "Coco", breed: "Poodle", birthDate: "2024-04-02", weight: 10, gender: "Female", isNeutered: true, isVaccinated: true, notes: "Friendly with dogs and people. Responds well to treats. Still learning not to jump up to say hello.", imageUrl: photos.dog3, updatedAt: isoDay(-6) },
  { id: "pet-pepper", owner: "Lucas Martin", species: "cat", name: "Pepper", breed: "Domestic Shorthair", birthDate: "2020-02-11", weight: 5, gender: "Female", isNeutered: true, isVaccinated: false, notes: "Indoor only, so please keep the balcony door closed. Hides for the first 10 minutes, then wants cuddles. Wet food morning and evening.", imageUrl: photos.cat2, updatedAt: isoDay(-2) },
  { id: "pet-milo", owner: "Noah Williams", species: "dog", name: "Milo", breed: "Labrador Retriever", birthDate: "2023-08-19", weight: 31, gender: "Male", isNeutered: false, isVaccinated: true, notes: "High energy. Fetch is his favourite thing. Strong puller, so use the front-clip harness. Will eat anything off the ground.", imageUrl: photos.dog5, updatedAt: isoDay(-1) },
  { id: "pet-biscuit", owner: "Grace Park", species: "dog", name: "Biscuit", breed: "Cavalier King Charles Spaniel", birthDate: "2021-06-30", weight: 8, gender: "Female", isNeutered: true, isVaccinated: true, notes: "Calm and cuddly. Gets anxious with loud noises. Prefers short evening walks.", imageUrl: photos.dog4, updatedAt: isoDay(-20) },
];

const toiletPattern: [number, number][] = [[2, 4], [2, 3], [3, 4], [2, 4], [2, 3], [3, 4], [2, 3]]; // [poop, pee] per day, oldest first
const toiletFor = (petId: string, scale: number): ToiletLog[] => toiletPattern.flatMap(([poop, pee], i) => {
  const day = i - 6;
  const rows: ToiletLog[] = [];
  for (let n = 0; n < Math.max(1, Math.round(poop * scale)); n++) rows.push({ id: `${petId}-t-p${i}${n}`, petId, type: "Poop", loggedAt: at(day, `0${7 + n * 5}:15`.slice(-5)), notes: "" });
  for (let n = 0; n < Math.max(1, Math.round(pee * scale)); n++) rows.push({ id: `${petId}-t-u${i}${n}`, petId, type: "Pee", loggedAt: at(day, `${String(8 + n * 4).padStart(2, "0")}:40`), notes: "" });
  return rows;
});

export const seedPetLogs: PetLogs = {
  toilet: [...toiletFor("pet-sunny", 1), ...toiletFor("pet-luna", 0.7)],
  food: [
    { id: "f1", petId: "pet-sunny", foodName: "Salmon kibble", amount: 1.5, unit: "cups", eatenAt: at(0, "08:00"), notes: "Ate everything" },
    { id: "f2", petId: "pet-sunny", foodName: "Salmon kibble", amount: 1.5, unit: "cups", eatenAt: at(-1, "18:00"), notes: "" },
    { id: "f3", petId: "pet-sunny", foodName: "Dental chew", amount: 1, unit: "treats", eatenAt: at(-1, "20:30"), notes: "" },
    { id: "f4", petId: "pet-luna", foodName: "Sensitive formula", amount: 40, unit: "g", eatenAt: at(0, "07:30"), notes: "Left a little" },
    { id: "f5", petId: "pet-luna", foodName: "Wet food, tuna", amount: 1, unit: "pouches", eatenAt: at(-1, "17:30"), notes: "" },
  ],
  weight: [
    { id: "w1", petId: "pet-sunny", weight: 28.2, measuredOn: isoDay(-120) }, { id: "w2", petId: "pet-sunny", weight: 28.6, measuredOn: isoDay(-90) },
    { id: "w3", petId: "pet-sunny", weight: 28.9, measuredOn: isoDay(-60) }, { id: "w4", petId: "pet-sunny", weight: 28.7, measuredOn: isoDay(-30) },
    { id: "w5", petId: "pet-sunny", weight: 29.0, measuredOn: isoDay(-3) },
    { id: "w6", petId: "pet-luna", weight: 4.3, measuredOn: isoDay(-120) }, { id: "w7", petId: "pet-luna", weight: 4.4, measuredOn: isoDay(-60) },
    { id: "w8", petId: "pet-luna", weight: 4.6, measuredOn: isoDay(-5) },
  ],
  vaccine: [
    { id: "v1", petId: "pet-sunny", vaccineName: "DHPP booster", administeredOn: isoDay(-300), nextDueOn: isoDay(65), notes: "Harbour Pet Clinic" },
    { id: "v2", petId: "pet-sunny", vaccineName: "Rabies", administeredOn: isoDay(-400), nextDueOn: isoDay(700), notes: "3-year vaccine" },
    { id: "v3", petId: "pet-luna", vaccineName: "FVRCP booster", administeredOn: isoDay(-280), nextDueOn: isoDay(85), notes: "Harbour Pet Clinic" },
  ],
  vet: [
    { id: "vv1", petId: "pet-sunny", visitedOn: isoDay(-40), clinicName: "Harbour Pet Clinic", reason: "Annual wellness exam", notes: "All good. Weight on target." },
    { id: "vv2", petId: "pet-sunny", visitedOn: isoDay(-150), clinicName: "Harbour Pet Clinic", reason: "Itchy skin and paws", notes: "Switched to salmon kibble. Resolved." },
    { id: "vv3", petId: "pet-luna", visitedOn: isoDay(-70), clinicName: "Harbour Pet Clinic", reason: "Reduced appetite", notes: "Dental check. Symptoms resolved." },
  ],
  walk: [
    { id: "wk1", petId: "pet-sunny", startedAt: at(-6, "07:30"), durationMinutes: 32, distanceKm: 2.4, notes: "" },
    { id: "wk2", petId: "pet-sunny", startedAt: at(-5, "07:45"), durationMinutes: 45, distanceKm: 3.5, notes: "" },
    { id: "wk3", petId: "pet-sunny", startedAt: at(-4, "18:10"), durationMinutes: 28, distanceKm: 2.0, notes: "Rainy" },
    { id: "wk4", petId: "pet-sunny", startedAt: at(-3, "07:20"), durationMinutes: 58, distanceKm: 4.6, notes: "Spanish Banks" },
    { id: "wk5", petId: "pet-sunny", startedAt: at(-2, "07:30"), durationMinutes: 42, distanceKm: 3.2, notes: "" },
    { id: "wk6", petId: "pet-sunny", startedAt: at(-1, "09:00"), durationMinutes: 64, distanceKm: 5.1, notes: "Long beach walk" },
  ],
  emergency: [
    { id: "e1", petId: "pet-sunny", clinicName: "Harbour Pet Clinic", phone: "+1 604 555 0188", address: "1285 W Pender Street, Vancouver", notes: "Regular vet" },
    { id: "e2", petId: "pet-sunny", clinicName: "Vancouver Animal Emergency (24h)", phone: "+1 604 555 0911", address: "", notes: "After hours" },
    { id: "e3", petId: "pet-luna", clinicName: "Harbour Pet Clinic", phone: "+1 604 555 0188", address: "1285 W Pender Street, Vancouver", notes: "Regular vet" },
  ],
};

// ---------- Messages ----------

export type ChatMessage = { from: "me" | "them"; text: string; time: string };
export type Conversation = { id: string; with: string; context: "sitting" | "lost"; ref: string; archived: boolean; unread: number; date: string; messages: ChatMessage[] };

export const seedConversations: Conversation[] = [
  { id: "c1", with: "Daniel Kim", context: "sitting", ref: "SR-2403", archived: false, unread: 2, date: "Today", messages: [
    { from: "them", text: "Hi Maya! I’m looking forward to meeting Sunny on Saturday. Is there anything special I should bring?", time: "10:18 AM" },
    { from: "me", text: "His harness and treats will be by the door. He loves the beach route near Kitsilano.", time: "10:31 AM" },
    { from: "them", text: "Perfect. I’ll send a photo update after our walk.", time: "10:42 AM" },
  ] },
  { id: "c2", with: "Ava Brooks", context: "lost", ref: "5", archived: false, unread: 1, date: "Today", messages: [
    { from: "them", text: "Hi! send message, I think. A shy grey tabby with a pink collar is hiding under the stairs at 2150 W 5th.", time: "9:02 AM" },
  ] },
  { id: "c3", with: "Noah Williams", context: "sitting", ref: "SR-2407", archived: false, unread: 0, date: "Yesterday", messages: [
    { from: "them", text: "Thanks for offering to help with Milo! The leash is on the hook by the door.", time: "4:10 PM" },
    { from: "me", text: "Great, I’ll be there at 1:30. Does he get treats on walks?", time: "4:14 PM" },
    { from: "them", text: "Yes, two or three. He’ll remind you!", time: "4:20 PM" },
  ] },
  { id: "c4", with: "Ava Brooks", context: "sitting", ref: "SR-2402", archived: true, unread: 0, date: "Apr 16", messages: [
    { from: "them", text: "Luna’s all set. Food and water refreshed, and she played with the feather toy.", time: "3:01 PM" },
    { from: "me", text: "Thank you so much, Ava!", time: "3:05 PM" },
  ] },
];

// ---------- Map ----------

export type PlaceReview = { id: number; author: string; rating: number; text: string; date: string; photo?: string; likes: number };
export type Place = { id: number; name: string; category: SpotCategory; address: string; image: string; latitude: number; longitude: number; updatedAt: string /* last time the place info was edited (date) */; sponsored?: boolean; rating: number; hours: string; description: string; reviews: PlaceReview[]; hidden?: boolean };

export const seedPlaces: Place[] = [
  { id: 1, name: "Spanish Banks Off-Leash", category: "Parks & Off-Leash", address: "4801 NW Marine Drive", image: photos.spot1, updatedAt: isoDay(-1), latitude: 49.2766, longitude: -123.2139, rating: 4.8, hours: "Open 6 AM – 10 PM", description: "A long stretch of sandy beach where dogs can run off-leash year-round. Low tide opens up huge tidal flats for zoomies, and there are water fountains and waste-bag stations along the path. Parking fills up early on sunny weekends.", reviews: [
    { id: 1, author: "Sophia Lee", rating: 5, text: "Great place to let your dog play. Coco loves the tidal flats at low tide.", date: "Jun 18, 2025", photo: photos.dog3, likes: 4 },
    { id: 2, author: "Daniel Kim", rating: 5, text: "Best off-leash beach in the city. Bring a towel!", date: "Oct 20, 2025", likes: 2 },
    { id: 3, author: "Liam Nguyen", rating: 4, text: "Busy on weekends but plenty of room.", date: "Mar 2, 2026", likes: 0 },
  ] },
  { id: 2, name: "Juniper Cafe & Bistro", category: "Cafes & Restaurants", address: "Main Street, Vancouver", image: photos.spot2, updatedAt: isoDay(-4), latitude: 49.263, longitude: -123.1008, rating: 4.6, hours: "Open 8 AM – 6 PM", description: "A cozy neighbourhood cafe with a covered, dog-friendly patio. Staff keep water bowls and house-made biscuits behind the counter.", reviews: [
    { id: 1, author: "Ava Brooks", rating: 5, text: "They brought Poppy her own water bowl without asking!", date: "May 19, 2026", likes: 3 },
  ] },
  { id: 3, name: "Breka Bakery & Café", category: "Cafes & Restaurants", address: "740 W Hastings St, Vancouver", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85", updatedAt: isoDay(0), latitude: 49.2851, longitude: -123.1153, sponsored: true, rating: 4.7, hours: "Open 24 hours", description: "Round-the-clock bakery with sidewalk seating where leashed dogs are welcome. A handy stop before or after a downtown walk.", reviews: [
    { id: 1, author: "Marcus Chen", rating: 5, text: "Late-night walk fuel. Staff love dogs.", date: "Feb 11, 2026", likes: 1 },
  ] },
  { id: 4, name: "East Van Brewing Co.", category: "Pubs & Breweries", address: "Commercial Drive", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85", updatedAt: isoDay(-12), latitude: 49.2722, longitude: -123.0695, rating: 4.4, hours: "Open 12 PM – 11 PM", description: "Tasting room that welcomes well-behaved dogs inside. Water bowls by the door.", reviews: [] },
  { id: 5, name: "The Pet Pantry", category: "Retail & Shops", address: "West 4th Avenue", image: photos.dog2, updatedAt: isoDay(-2), latitude: 49.2683, longitude: -123.16, rating: 4.9, hours: "Open 10 AM – 7 PM", description: "Independent pet-supply shop with a self-serve dog wash in the back.", reviews: [] },
  { id: 6, name: "Harbour Pet Clinic", category: "Pet Services", address: "Coal Harbour", image: photos.spot3, updatedAt: isoDay(-7), latitude: 49.289, longitude: -123.124, rating: 4.8, hours: "Open 24 hours · Emergency", description: "Full-service veterinary clinic with a 24-hour emergency line.", reviews: [] },
  { id: 7, name: "The Burrard Hotel", category: "Hotels", address: "Downtown Vancouver", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85", updatedAt: isoDay(-30), latitude: 49.2796, longitude: -123.1287, rating: 4.5, hours: "Check-in from 3 PM", description: "Boutique hotel with pet-friendly rooms and a courtyard. No pet fee for stays over two nights.", reviews: [] },
  { id: 8, name: "Pacific Spirit Trail", category: "Hiking Trails", address: "Pacific Spirit Regional Park", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=85", updatedAt: isoDay(-220) /* old on purpose: shows the out-of-date note */, latitude: 49.255, longitude: -123.208, rating: 4.7, hours: "Open dawn to dusk", description: "Shaded forest trails with several off-leash loops. Check signage: some trails require leashes.", reviews: [] },
];

// ---------- Reports & notifications ----------

export type ReportTarget = "post" | "request" | "place";
export type Report = { id: number; target: ReportTarget; targetId: string; subject: string; reason: string; date: string; status: "open" | "resolved" };

export const seedReports: Report[] = [
  { id: 1, target: "request", targetId: "SR-2408", subject: "Weekend walks for my gentle senior beagle", reason: "Spam", date: "Today", status: "open" },
  { id: 2, target: "post", targetId: "3", subject: "Ava Brooks’s post", reason: "Inappropriate content", date: "Yesterday", status: "open" },
  { id: 3, target: "place", targetId: "4", subject: "East Van Brewing Co.", reason: "No longer pet-friendly", date: "Yesterday", status: "open" },
];

export type Notice = { id: number; text: string; time: string; read: boolean; page?: UserPage; icon: "applicant" | "verify" | "report" | "match" | "lost" | "message" };

export const seedNotices: Notice[] = [
  { id: 1, text: "Marcus Chen offered to help with Sunny on June 12.", time: "20 min ago", read: false, page: "sitters", icon: "applicant" },
  { id: 2, text: "Ava Brooks sent you a message about Luna.", time: "1 hour ago", read: false, page: "messages", icon: "lost" },
  { id: 3, text: "Noah Williams confirmed you as Milo’s sitter.", time: "Yesterday", read: false, page: "sitters", icon: "match" },
  { id: 4, text: "Your report about a community post was received.", time: "2 days ago", read: true, page: "community", icon: "report" },
];

export const reportReasons: Record<ReportTarget, [string, string][]> = {
  post: [
    ["Inappropriate content", "Offensive, hateful, or explicit content"],
    ["Spam", "Repeated, irrelevant, or misleading posts"],
    ["Scam or fraud", "Fake offers, fraudulent activity, or deceptive posts"],
    ["Harassment or bullying", "Threatening, abusive, or targeted content"],
    ["Other", "Something else that violates our community guidelines"],
  ],
  request: [
    ["Inappropriate content", "Offensive, hateful, or explicit content"],
    ["Spam", "Repeated, irrelevant, or misleading posts"],
    ["Scam or fraud", "Asks for payment or personal details"],
    ["Pet welfare concern", "The request suggests a pet may be at risk"],
    ["Other", "Something else that violates our community guidelines"],
  ],
  place: [
    ["No longer pet-friendly", "Pets are not welcome here anymore"],
    ["Permanently closed", "This place has closed or moved"],
    ["Wrong details", "The address, hours, or category is incorrect"],
    ["Inappropriate photo", "The photo is offensive or misleading"],
    ["Other", "Something else is wrong with this listing"],
  ],
};

export const nowTime = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** "June 12" -> ["Jun", "12"], used for calendar-style date tabs. */
export const dateParts = (date: string): [string, string] => {
  const [month = "", day = ""] = date.split(" ");
  return [month.slice(0, 3), day.replace(/\D/g, "") || "–"];
};
