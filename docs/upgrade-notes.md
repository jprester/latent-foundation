Latent Foundation — Upgrade Notes

Extracted from conversation. Goal: a self-improving pipeline that generates SCP-like / short weird fiction tuned to your taste, narrates it, and delivers it as a daily private feed you can listen to while coding, working out, or doing chores. Quality over quantity is explicitly the design constraint (also cheaper on tokens).

Concrete stack

Scheduler: Vercel cron job, or a GitHub Action if you'd rather keep the pipeline in the repo.
Generation: frontier model via OpenRouter (you already use OpenRouter for the agent stack).
Audio: hosted Kokoro TTS (DeepInfra or Replicate), fractions of a cent per minute — keeps the whole thing serverless, no persistent machine needed. OpenAI TTS is a fine fallback. Kokoro run locally on the VPS only matters if you want the two-voice / cloned-voice setup later.
Storage: Vercel Blob or Cloudflare R2 for the MP3s.
Delivery: an /rss route serving a podcast XML feed. This is the detail people skip — don't push audio as Telegram files; publish a feed and subscribe in your normal podcast app, so each daily story lands in the same queue as Weird Studies and LEMMiNO with resume, speed control, and watch-later for free.
Feedback: a keep/kill button on each story page that appends to the taste-spec file. Keep the spec as a markdown doc in the repo so the cron job reads it and your curation history is version-controlled — a git log of your own evolving taste.

Cost: roughly €5–15/month for a daily piece under the generate-then-select pattern below. Audio adds pennies.

Generation design — this is what separates good from slop

Don't ask for one story. Use generate-then-select with asymmetric cost:

A cheap model (or the same model at low effort) produces ~5 one-paragraph premises, each constrained to name its formal conceit before its monster — i.e. state the structural gimmick first.
The expensive model writes only the single best premise into a full document.
One self-critique pass against the written taste spec, revising once.

You pay frontier price for one story + one revision, not five stories.

Two failure modes to engineer against, both from how these models actually behave:

Mode collapse. A daily generator drifts toward its own median and converges on ~3 story shapes within weeks. Counter structurally: rotate mandatory constraints (e.g. Monday = found-document; Wednesday = set before 1950; Friday = contains no anomaly at all and is scary anyway), and periodically seed with a random Wikipedia article or a case from your mystery reading as obligatory raw material.
Calibration drift in self-critique. Models grade their own output generously. The critique prompt must force ranking against named exemplars ("closer to SCP-3125 or to wiki-median? justify") rather than asking "is this good."

The taste specification — the actual product

A standing markdown doc the generator receives every night. This conversation basically already wrote it. Positive constraints:

Epistemic horror over gore.
The document's form should enact the anomaly (formal conceit first).
Concrete historical texture — Soviet cybernetics, Cold War Belgium, Habsburg archives. (Your counterfactual-history vein is under-used fuel here.)
Ligotti / Borges register over Lovecraft pastiche.
Institutional indifference as scarier than institutional evil.
Exactly one unexplained anomaly embedded per document, never flagged, never explained — the "14:79 rule" (below).
Endings that resolve into mechanism or refuse resolution honestly; never a jump scare.

Negative constraints (these matter more):

No "Digital Exorcists"–style nicknames.
No boilerplate containment liturgy (Faraday cage / D-class only / three Level-4 signatures as filler).
No consciousness-is-the-real-anomaly twist more than once a month.

Make it a living file: the keep/kill feedback (plus an optional one-line why) appends to the spec so you train the selector over months. That feedback loop is the difference between "a generator" and "your generator" — curation-as-authorship turned into a mechanism.

Audio production details

SCP's clinical monotone is the easiest possible TTS target — it's what TTS does natively, unlike emotional fiction narration.
Two-voice architecture: flat institutional voice for the main document, a second voice for interview logs / researcher notes. (Needs cloned voices → revisit local Kokoro or Chatterbox/F5-TTS; not required for v1.)
Preprocessing pass before TTS: convert █████ redactions to a consistent spoken token ("redacted") or, better, a short burst of tape-noise SFX (genre-perfect); expand timestamps; insert SSML pauses at section breaks.
Lay a faint low room-tone bed under the whole thing to clone the SCP Archives production feel.
Pipeline: markdown → preprocessing script → TTS API → ffmpeg mix with noise bed → audio on the story page / into the RSS feed.

Measurement idea (worth doing)

Mix a small human-written control group into the feed — one Pseudopod or HorrorBabble episode weekly, unlabeled if logistics allow. Not ideological; diagnostic. If you reliably can't tell which is which mid-workout, that's a real finding about where the "platonist" thesis stands. If you always can, the difference tells you exactly what to fix in the spec.

Strategic side benefit

Unlike a private Hermes cron job, an expanded Latent Foundation is a public artifact with a demo URL. "A self-improving fiction pipeline: frontier-model generation against a version-controlled taste specification, automated self-critique with exemplar anchoring, TTS-to-RSS publishing, and a human-feedback loop that trains the selector" is an AI-orchestration portfolio piece — the public-legibility gap you've been circling — bought with a hobby you were going to do anyway. Writing up the taste-spec mechanism as a post doubles as a warm-up for the EU-AI-strategy essay.

Build order

The plumbing is an evening of vibe-coding. The two load-bearing artifacts are the taste specification and the generation/critique prompt chain — that's where the real work is, and where having this whole conversation as training data is the actual asset. The recommendations file already drafted (weird-fiction-recommendations.md) is a usable seed corpus for the spec: its "why it fits" annotations are a first pass at the aesthetic profile.
