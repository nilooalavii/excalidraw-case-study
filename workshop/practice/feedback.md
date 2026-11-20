# Feedback on the playful toolbar

Fictional practice material for the AI-First Design Workshop. Not Excalidraw's roadmap or research.

Comments collected in a shared doc after the review page went around. People are listed by role.

## Support team

- **Support lead:** "Image on the bar is going to cut our tickets. Thank you."
- **Support specialist:** "The pin with 'Keep tool' under it finally explains the lock. Could the tooltip say what it does in a full sentence?"

## Accessibility review

- **Accessibility specialist:** "Buttons have names and the focus ring shows. Two things: the bounce needs to stop with reduced motion on, and the selected state can't rely on color alone. Add a shape or an outline too."
- **Accessibility specialist:** "Check the label contrast on the light gray background. It looked under 4.5 to 1 in the screenshot."

## Product

- **Product manager:** "Love it for new users. I still hear power users asking for something denser, so let's keep the dense variation's file around for the compact mode later."
- **Product marketing:** "The video is great. Can it start on a blank canvas instead of an existing drawing? It reads better as a first look."

## Engineering

- **Front-end engineer:** "The motion uses transform only, so it's cheap. I'll add the reduced motion check."
- **Engineering manager:** "Please keep the old toolbar reachable with ?toolbar=original for a while, in case we need to compare."

## Customers (from a short survey of 40 people)

- 31 of 40 picked playful as the one they'd want to use every day.
- "It looks like the drawings, which makes sense." (customer, design agency)
- "Fun, but please don't make it bounce every single time." (customer, teacher)
- "Where did my keyboard letters go? I use them all day." (customer, engineer)

## Open items

- Full-sentence tooltip for "Keep tool".
- Selected state that doesn't rely on color.
- Label contrast.
- Reduced motion.
- Keyboard letters for people who want them.
