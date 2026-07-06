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
  videoStatus: string; platYoutube: boolean; platSpotify: boolean; platBeatstars: boolean;
  platAirbit: boolean; tags: string; notes: string; dateCreated: string;
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
  platforms: {
    youtube: b.platYoutube,
    spotify: b.platSpotify,
    beatstars: b.platBeatstars,
    airbit: b.platAirbit,
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
    videoStatus, platforms, tags, notes } = req.body;

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
      platYoutube: platforms?.youtube ?? false,
      platSpotify: platforms?.spotify ?? false,
      platBeatstars: platforms?.beatstars ?? false,
      platAirbit: platforms?.airbit ?? false,
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
    videoStatus, platforms, tags, notes } = req.body;

  const beat = await prisma.beat.update({
    where: { id },
    data: {
      name, genre, mood, bpm: Number(bpm), key, duration, videoTheme, status,
      mixStatus, masterStatus, videoStatus,
      platYoutube: platforms?.youtube,
      platSpotify: platforms?.spotify,
      platBeatstars: platforms?.beatstars,
      platAirbit: platforms?.airbit,
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
