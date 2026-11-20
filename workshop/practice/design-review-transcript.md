# Design review: toolbar direction (transcript)

Fictional practice material for the AI-First Design Workshop. Not Excalidraw's roadmap or research.

A 20 minute design review, transcribed and lightly cleaned up. People are listed by role.

**Attendees:** Design lead, Product manager, Front-end engineer, Researcher, Support lead

---

**Design lead:** Thanks, everyone. We're looking at the labeled toolbar from last week's study, and the four directions the PM team asked for. I'd like to leave with one direction to take forward.

**Researcher:** Quick recap of the study. Labels fixed most of the guessing. Five of six found every tool on the first try. The two problems left are "Keep tool", which people still don't connect to drawing several shapes, and tablets, where the labeled toolbar doesn't fit.

**Product manager:** The customer calls lined up with that. New people want words. People who use it every day told us they don't want a wider toolbar. That's why we asked for four very different options instead of one.

**Front-end engineer:** From the build side, all four were cheap to try because each toolbar is its own file. Switching between them in the running app helped a lot. I could see the dense one feels fast with a keyboard, but it's busy for a first-timer.

**Support lead:** The top three tickets we get about the toolbar are "where's image", "my tool keeps switching back" and "what's the lock". If a direction fixes those three, it's a win for us whichever one it is.

**Design lead:** The playful one does well on all three. Image is on the bar, the keep-tool toggle reads as a pin with a label, and the bounce makes the switch back to selection noticeable.

**Researcher:** I'd want to test the bounce with a few more people. Motion can feel fun once and annoying the tenth time. And we should check it with reduced motion turned on.

**Product manager:** Can we do labels for new people and a compact mode later? I don't want to ship two toolbars on day one.

**Front-end engineer:** That's a setting, not a second toolbar. Doable, but I'd keep it out of the first pull request.

**Design lead:** Agreed. Let's take playful forward, keep the motion subtle, respect reduced motion, and make sure the touch targets are at least 44 pixels so the tablet issue is covered too.

**Support lead:** Can the pull request include a short video? I'd like to share it with the team before it ships.

**Design lead:** Yes. Video, screenshots of all four, and a page we can send around.

---

## Decisions

- Take the playful direction forward as the default.
- Motion stays subtle and turns off with reduced motion.
- Touch targets at least 44 pixels.
- A compact mode for experienced people is a follow-up, not part of this change.

## Action items

- Front-end engineer: make playful the default and open the pull request.
- Design lead: record a short demo video and fill in the review page.
- Researcher: run a five-person check on the motion and "Keep tool" next week.
- Support lead: share the review page with the support team.
