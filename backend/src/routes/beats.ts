import { Router } from "express";
import prisma from "../db";

const router = Router();

/** Helper: parse JSON string arrays stored in SQLite */
const parseArr = (s: string): string[] => {
  try { return JSON.parse(s); } catch { return []; }
};

/** Map a DB Beat to frontend Beat shape */
const mapBeat = (b: {
  id: string; name: string; genre: string; mood: string; bpm: number; key: string;
  duration: string; videoTheme: string; status: string; mixStatus: string; masterStatus: string;
  videoStatus: string; timeSignature: string; coverArt: string; 
  platYoutube: string; platSpotify: string; platBeatstars: string; platAirbit: string; 
  platAppleMusic: string; platSoundcloud: string; platInstagram: string; platTiktok: string; 
  tags: string; notes: string; dateCreated: string;
}) => ({
  id: b.id,
  name: b.name,
  genre: b.genre,
  mood: b.mood,
  bpm: b.bpm,
  key: b.key,
  duration: b.duration,
  videoTheme: b.videoTheme,
  status: b.status,
  mixStatus: b.mixStatus,
  masterStatus: b.masterStatus,
  videoStatus: b.videoStatus,
  timeSignature: b.timeSignature,
  coverArt: b.coverArt,
  platforms: {
    youtube: b.platYoutube,
    spotify: b.platSpotify,
    beatstars: b.platBeatstars,
    airbit: b.platAirbit,
    appleMusic: b.platAppleMusic,
    soundcloud: b.platSoundcloud,
    instagram: b.platInstagram,
    tiktok: b.platTiktok,
  },
  tags: parseArr(b.tags),
  notes: b.notes,
  dateCreated: b.dateCreated,
});

// GET /api/beats
router.get("/", async (_req, res) => {
  const beats = await prisma.beat.findMany({ orderBy: { dateCreated: "desc" } });
  res.json(beats.map(mapBeat));
});

// POST /api/beats
router.post("/", async (req, res) => {
  const { name, genre, mood, bpm, key, duration, videoTheme, status, mixStatus, masterStatus,
    videoStatus, timeSignature, coverArt, platforms, tags, notes } = req.body;

  const allBeats = await prisma.beat.findMany({ select: { id: true } });
  const nextNum = allBeats.length + 46;
  const id = `B-0${nextNum}`;

  const beat = await prisma.beat.create({
    data: {
      id,
      name, genre, mood, bpm: Number(bpm), key, duration, videoTheme,
      status: status || "In Progress",
      mixStatus: mixStatus || "Not Started",
      masterStatus: masterStatus || "Not Started",
      videoStatus: videoStatus || "Not Started",
      timeSignature: timeSignature || "4/4",
      coverArt: coverArt || "",
      platYoutube: platforms?.youtube ?? "Draft",
      platSpotify: platforms?.spotify ?? "Draft",
      platBeatstars: platforms?.beatstars ?? "Draft",
      platAirbit: platforms?.airbit ?? "Draft",
      platAppleMusic: platforms?.appleMusic ?? "Draft",
      platSoundcloud: platforms?.soundcloud ?? "Draft",
      platInstagram: platforms?.instagram ?? "Draft",
      platTiktok: platforms?.tiktok ?? "Draft",
      tags: JSON.stringify(tags || []),
      notes: notes || "",
      dateCreated: new Date().toISOString().split("T")[0],
    },
  });
  res.status(201).json(mapBeat(beat));
});

// PUT /api/beats/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, genre, mood, bpm, key, duration, videoTheme, status, mixStatus, masterStatus,
    videoStatus, timeSignature, coverArt, platforms, tags, notes } = req.body;

  const beat = await prisma.beat.update({
    where: { id },
    data: {
      name, genre, mood, bpm: Number(bpm), key, duration, videoTheme, status,
      mixStatus, masterStatus, videoStatus, timeSignature, coverArt,
      platYoutube: platforms?.youtube,
      platSpotify: platforms?.spotify,
      platBeatstars: platforms?.beatstars,
      platAirbit: platforms?.airbit,
      platAppleMusic: platforms?.appleMusic,
      platSoundcloud: platforms?.soundcloud,
      platInstagram: platforms?.instagram,
      platTiktok: platforms?.tiktok,
      tags: JSON.stringify(tags || []),
      notes: notes || "",
    },
  });
  res.json(mapBeat(beat));
});

// DELETE /api/beats/:id
router.delete("/:id", async (req, res) => {
  await prisma.beat.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
