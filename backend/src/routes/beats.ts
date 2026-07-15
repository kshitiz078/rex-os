import { Router } from "express";
import prisma from "../db";

const router = Router();

/** Helper: parse JSON string arrays stored in DB */
const parseArr = (s: string): string[] => {
  try { return JSON.parse(s); } catch { return []; }
};

/** Map a DB Beat to frontend Beat shape */
const mapBeat = (b: {
  id: string; name: string; genre: string; mood: string; bpm: number; key: string;
  duration: string; videoTheme: string; status: string; productionStage: string;
  timeSignature: string; coverArt: string;
  platYoutube: string; platSpotify: string; platBeatstars: string; platAirbit: string;
  platAppleMusic: string; platSoundcloud: string; platInstagram: string; platTiktok: string;
  platYoutubeShorts: string; platBandcamp: string;
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
  productionStage: b.productionStage,
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
    youtubeShorts: b.platYoutubeShorts,
    bandcamp: b.platBandcamp,
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
  const {
    name, genre, mood, bpm, key, duration, videoTheme,
    status, productionStage, timeSignature, coverArt,
    platforms, tags, notes
  } = req.body;

  const allBeats = await prisma.beat.findMany({ select: { id: true } });
  const nextNum = allBeats.length + 46;
  const id = `B-0${nextNum}`;

  const beat = await prisma.beat.create({
    data: {
      id,
      name, genre, mood, bpm: Number(bpm), key,
      duration: duration || "2:30",
      videoTheme: videoTheme || "",
      status: status || "In Progress",
      productionStage: productionStage || "Idea",
      timeSignature: timeSignature || "4/4",
      coverArt: coverArt || "",
      platYoutube: platforms?.youtube ?? "Not Published",
      platSpotify: platforms?.spotify ?? "Not Published",
      platBeatstars: platforms?.beatstars ?? "Not Published",
      platAirbit: platforms?.airbit ?? "Not Published",
      platAppleMusic: platforms?.appleMusic ?? "Not Published",
      platSoundcloud: platforms?.soundcloud ?? "Not Published",
      platInstagram: platforms?.instagram ?? "Not Published",
      platTiktok: platforms?.tiktok ?? "Not Published",
      platYoutubeShorts: platforms?.youtubeShorts ?? "Not Published",
      platBandcamp: platforms?.bandcamp ?? "Not Published",
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
  const {
    name, genre, mood, bpm, key, duration, videoTheme,
    status, productionStage, timeSignature, coverArt,
    platforms, tags, notes
  } = req.body;

  const beat = await prisma.beat.update({
    where: { id },
    data: {
      name, genre, mood,
      bpm: bpm !== undefined ? Number(bpm) : undefined,
      key, duration, videoTheme, status, productionStage,
      timeSignature, coverArt,
      platYoutube: platforms?.youtube,
      platSpotify: platforms?.spotify,
      platBeatstars: platforms?.beatstars,
      platAirbit: platforms?.airbit,
      platAppleMusic: platforms?.appleMusic,
      platSoundcloud: platforms?.soundcloud,
      platInstagram: platforms?.instagram,
      platTiktok: platforms?.tiktok,
      platYoutubeShorts: platforms?.youtubeShorts,
      platBandcamp: platforms?.bandcamp,
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
