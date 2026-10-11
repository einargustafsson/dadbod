import type { Exercise } from '../../types'

export interface HowTo {
  steps: [string, string, string]
  /** The one mistake to avoid. */
  cue: string
}

export const HOWTO: Record<string, HowTo> = {
  'back-squat': {
    steps: ['Bar on your upper back, feet shoulder-width, toes slightly out.', 'Brace your core, sit down and back until thighs are at least parallel.', 'Drive through mid-foot to stand, keeping your chest up.'],
    cue: 'Knees track over toes; do not let them cave inward.',
  },
  'front-squat': {
    steps: ['Rest the bar on your front shoulders, elbows high, fingertips or crossed-arm grip.', 'Brace and squat straight down, torso upright.', 'Stand up driving elbows toward the ceiling.'],
    cue: 'If your elbows drop, the bar rolls forward. Lighten the load.',
  },
  'goblet-squat': {
    steps: ['Hold one dumbbell vertically against your chest.', 'Squat down between your knees, elbows inside them.', 'Stand up, squeezing glutes at the top.'],
    cue: 'Keep the weight close to your chest and heels flat.',
  },
  'leg-press': {
    steps: ['Feet shoulder-width on the platform, back and hips flat on the pad.', 'Lower until knees are about 90 degrees without your hips curling off the seat.', 'Press up without locking your knees.'],
    cue: 'Never let your lower back peel off the pad at the bottom.',
  },
  'hack-squat': {
    steps: ['Shoulders under the pads, feet shoulder-width and slightly forward on the platform.', 'Release the safeties and lower under control to about 90 degrees or deeper.', 'Press back up through your whole foot.'],
    cue: 'Heels stay down; do not bounce out of the bottom.',
  },
  'smith-squat': {
    steps: ['Set the bar on your upper back, feet slightly in front of the bar.', 'Sit down and back, torso mostly upright.', 'Stand up and re-rack when done by twisting the bar hooks.'],
    cue: 'Keep feet slightly forward so your knees are not pushed over your toes.',
  },
  rdl: {
    steps: ['Stand holding the bar at hip height, soft knees.', 'Push your hips straight back, sliding the bar down your thighs to mid-shin.', 'Squeeze glutes to stand tall.'],
    cue: 'Keep your back flat and the bar touching your legs; this is a hinge, not a squat.',
  },
  deadlift: {
    steps: ['Bar over mid-foot, grip just outside your knees, hips above knees.', 'Pull the slack out, brace, and push the floor away.', 'Stand tall, then lower the bar along your legs with control.'],
    cue: 'Do not round your lower back; keep the bar against your body the whole way.',
  },
  'trap-bar-dl': {
    steps: ['Step inside the bar, grab the handles, hips slightly above knees.', 'Brace and drive through your feet to stand.', 'Lower under control by pushing your hips back first.'],
    cue: 'Chest up and shoulders back; do not shrug the weight up.',
  },
  'db-rdl': {
    steps: ['Hold dumbbells in front of your thighs, soft knees.', 'Push your hips back, sliding the weights down your legs.', 'Stop when you feel a hamstring stretch, then drive hips forward.'],
    cue: 'Keep your spine neutral; go only as low as your back stays flat.',
  },
  'hip-thrust': {
    steps: ['Upper back on a bench, bar across your hips with a pad.', 'Feet flat, knees bent about 90 degrees at the top.', 'Drive hips up, squeeze glutes for a second, lower with control.'],
    cue: 'Tuck your chin and ribs; finish with glutes, not by arching your lower back.',
  },
  'back-extension': {
    steps: ['Set the pad just below your hip bones, ankles locked.', 'Lower your torso with a flat back.', 'Raise until your body is in a straight line.'],
    cue: 'Stop at a straight line; do not hyperextend at the top.',
  },
  'cable-pull-through': {
    steps: ['Face away from a low cable, rope between your legs, step forward.', 'Hinge at the hips, letting the rope travel back between your legs.', 'Snap your hips forward and squeeze glutes.'],
    cue: 'Arms stay straight; the hips do the work.',
  },
  'split-squat': {
    steps: ['Staggered stance, dumbbells at your sides, front foot flat.', 'Lower your back knee straight down toward the floor.', 'Drive through the front heel to rise.'],
    cue: 'Keep your torso upright and your front knee steady over the foot.',
  },
  bulgarian: {
    steps: ['Rear foot on a bench behind you, front foot about a long step forward.', 'Lower straight down until your front thigh is near parallel.', 'Push through your front heel to stand.'],
    cue: 'Most of the weight stays on the front leg; step further out if your knee drifts too far forward.',
  },
  'walking-lunge': {
    steps: ['Hold dumbbells at your sides.', 'Step forward and lower your back knee to just above the floor.', 'Push off the front foot and step into the next rep.'],
    cue: 'Take long enough steps so your front shin stays near vertical.',
  },
  'step-up': {
    steps: ['Place one foot fully on a knee-height bench, dumbbells at your sides.', 'Drive through that heel to stand on the bench.', 'Lower under control; finish all reps on one leg, then switch.'],
    cue: 'Do not push off the back foot; the working leg does the lifting.',
  },
  'reverse-lunge': {
    steps: ['Stand tall with dumbbells at your sides.', 'Step one foot back and lower your back knee toward the floor.', 'Push through the front heel to return to standing.'],
    cue: 'Keep your weight on the front leg and your chest up.',
  },
  'leg-extension': {
    steps: ['Adjust the pad to sit just above your ankles, knees aligned with the pivot.', 'Extend your legs until almost straight.', 'Lower slowly over about 2-3 seconds.'],
    cue: 'No swinging or slamming; pause briefly at the top.',
  },
  'leg-curl': {
    steps: ['Sit with the pad just above your heels and thighs secured.', 'Curl your heels down and back toward you.', 'Return slowly until your legs are nearly straight.'],
    cue: 'Keep your hips pressed into the seat.',
  },
  'lying-leg-curl': {
    steps: ['Lie face down, pad just above your heels, hips flat.', 'Curl your heels toward your glutes.', 'Lower under control for about 2-3 seconds.'],
    cue: 'Do not lift your hips off the pad to cheat the weight up.',
  },
  'standing-calf': {
    steps: ['Shoulders under the pads, balls of your feet on the platform.', 'Lower your heels for a full stretch.', 'Rise as high as you can and pause for a second.'],
    cue: 'Use the full range of motion; no bouncing.',
  },
  'seated-calf': {
    steps: ['Knees under the pad, balls of your feet on the platform.', 'Lower your heels for a deep stretch.', 'Press up onto your toes and pause.'],
    cue: 'Slow on the way down; the stretch matters.',
  },
  'db-calf': {
    steps: ['Stand on one foot on a step edge, a dumbbell in the same-side hand, other hand on a support.', 'Lower the heel below the step.', 'Rise onto your toes and pause.'],
    cue: 'Keep your ankle straight; do not roll outward.',
  },
  plank: {
    steps: ['Forearms on the floor, elbows under shoulders, body in a straight line.', 'Squeeze glutes and brace your abs; add a plate on your back if needed.', 'Hold for the target time, breathing steadily.'],
    cue: 'Do not let your hips sag or pike up.',
  },
  'cable-crunch': {
    steps: ['Kneel facing a high cable, rope held beside your head.', 'Curl your ribs toward your hips, rounding your spine.', 'Return slowly without letting your hips move.'],
    cue: 'Crunch with your abs; do not just bow from the hips.',
  },
  'hanging-knee-raise': {
    steps: ['Hang from a bar with a firm grip, shoulders active.', 'Raise your knees toward your chest, curling your pelvis up.', 'Lower slowly without swinging.'],
    cue: 'Curl your pelvis; do not just swing your legs.',
  },
  pallof: {
    steps: ['Stand side-on to a cable at chest height, handle at your chest.', 'Press the handle straight out in front of you.', 'Hold 2 seconds resisting the pull, then bring it back.'],
    cue: 'Your torso must not rotate; the cable is trying to twist you.',
  },
  'ab-wheel': {
    steps: ['Kneel with hands on the wheel under your shoulders.', 'Roll out slowly with a braced core and slight rounded back.', 'Pull back by squeezing your abs.'],
    cue: 'Stop before your lower back arches; shorten the range if needed.',
  },
  bench: {
    steps: ['Lie with eyes under the bar, feet flat, shoulder blades pinched together.', 'Lower the bar to your mid-chest with elbows about 45 degrees from your torso.', 'Press up and slightly back to lockout.'],
    cue: 'Keep your shoulder blades pinned; use a spotter or safety arms.',
  },
  'db-bench': {
    steps: ['Sit with dumbbells on your thighs, lie back and kick them up.', 'Lower until your upper arms are about level with the bench.', 'Press up until your arms are straight above your chest.'],
    cue: 'Control the descent; do not flare elbows out to 90 degrees.',
  },
  'incline-db': {
    steps: ['Set the bench to about 30 degrees, dumbbells at shoulder level.', 'Press them up over your upper chest.', 'Lower under control to a deep but comfortable stretch.'],
    cue: 'Keep the incline low; a steep bench turns it into a shoulder press.',
  },
  'machine-chest': {
    steps: ['Adjust the seat so the handles are at mid-chest height.', 'Press forward until your arms are almost straight.', 'Return slowly, keeping your shoulders back.'],
    cue: 'Keep your back against the pad and shoulders down.',
  },
  pushup: {
    steps: ['Hands slightly wider than shoulders, body in a straight line.', 'Lower your chest to just above the floor, elbows about 45 degrees.', 'Press up; add a plate on your back for extra load.'],
    cue: 'Keep your hips in line with your shoulders; no sagging.',
  },
  'cable-fly': {
    steps: ['Set the pulleys at chest height, one handle in each hand, slight forward lean.', 'With soft elbows, bring the handles together in front of your chest.', 'Return slowly to a comfortable stretch.'],
    cue: 'Keep a fixed elbow bend; this is a hugging motion, not a press.',
  },
  'bb-row': {
    steps: ['Hinge to about 45 degrees, bar hanging at arm length, back flat.', 'Pull the bar to your lower ribs, elbows close to your body.', 'Lower under control.'],
    cue: 'Do not use momentum or stand up as you row.',
  },
  'db-row': {
    steps: ['One hand and knee on a bench, flat back, dumbbell in the other hand.', 'Pull the dumbbell to your hip, elbow close to your side.', 'Lower fully until your shoulder stretches.'],
    cue: 'Do not twist your torso to lift the weight.',
  },
  'seated-row': {
    steps: ['Sit tall with feet braced, knees slightly bent, handle at arm length.', 'Pull the handle to your belly, squeezing shoulder blades together.', 'Return slowly without rounding forward.'],
    cue: 'Keep your chest tall and do not rock back to finish the rep.',
  },
  'machine-row': {
    steps: ['Adjust the pad so your chest is supported and handles are reachable at arm length.', 'Pull the handles toward your torso, elbows past your body.', 'Pause, then return slowly.'],
    cue: 'Keep your chest on the pad; no shrugging.',
  },
  'chest-sup-row': {
    steps: ['Lie chest-down on an incline bench, dumbbells hanging.', 'Row them to your ribs, elbows close to your body.', 'Lower to a full stretch.'],
    cue: 'Squeeze your shoulder blades; do not lift your chest off the pad.',
  },
  ohp: {
    steps: ['Bar at collarbone height, grip just outside shoulders, glutes and core tight.', 'Press the bar straight up, moving your head slightly back then through.', 'Lock out overhead and lower under control.'],
    cue: 'Do not lean back; keep your ribs down and glutes squeezed.',
  },
  'db-ohp': {
    steps: ['Sit with back support, dumbbells at shoulder height, palms forward.', 'Press them overhead until your arms are straight.', 'Lower to ear level under control.'],
    cue: 'Do not arch your lower back off the seat.',
  },
  'machine-ohp': {
    steps: ['Adjust the seat so the handles are at shoulder height.', 'Press up until your arms are almost straight.', 'Lower slowly to the start.'],
    cue: 'Keep your neck relaxed and ribs down.',
  },
  'landmine-press': {
    steps: ['Stand holding the end of an angled bar at your shoulder.', 'Press up and forward along the arc until your arm is straight.', 'Lower under control.'],
    cue: 'Brace your core; do not lean back. This press is easy on the shoulder joint.',
  },
  pullup: {
    steps: ['Hang from the bar with an overhand grip slightly wider than shoulders.', 'Pull your chest toward the bar, elbows driving down.', 'Lower fully to a straight-arm hang.'],
    cue: 'Start every rep from a full hang; no kipping.',
  },
  chinup: {
    steps: ['Hang from the bar with an underhand shoulder-width grip.', 'Pull until your chin passes the bar.', 'Lower under control to full arm extension.'],
    cue: 'Do not shrug up to your ears; pull your shoulder blades down first.',
  },
  'lat-pulldown': {
    steps: ['Thighs secured under the pad, grip slightly wider than shoulders.', 'Pull the bar to your upper chest, leaning back slightly.', 'Return slowly until your arms are straight.'],
    cue: 'Pull with your elbows, not your hands; do not yank with your torso.',
  },
  'neutral-pulldown': {
    steps: ['Use the parallel-grip handle, thighs secured.', 'Pull the handle to your upper chest, elbows toward your hips.', 'Return slowly to a full stretch.'],
    cue: 'This grip is easier on the shoulders; keep your chest up.',
  },
  'assisted-pullup': {
    steps: ['Set the assistance weight, kneel or stand on the platform.', 'Pull your chest toward the handles.', 'Lower under control to full arm extension.'],
    cue: 'Reduce the assistance over time as you get stronger.',
  },
  curl: {
    steps: ['Stand with dumbbells at your sides, palms forward.', 'Curl them to your shoulders without moving your elbows.', 'Lower slowly over about 2 seconds.'],
    cue: 'Do not swing your torso or let your elbows drift forward.',
  },
  'hammer-curl': {
    steps: ['Hold dumbbells with palms facing each other.', 'Curl up keeping your wrists neutral.', 'Lower slowly.'],
    cue: 'Keep your elbows pinned at your sides.',
  },
  'cable-curl': {
    steps: ['Stand facing a low cable with a straight or EZ bar.', 'Curl the bar to your shoulders, elbows fixed.', 'Lower under control.'],
    cue: 'Constant cable tension; do not lean back.',
  },
  pushdown: {
    steps: ['Stand facing a high cable, elbows tucked at your sides.', 'Press the handle down until your arms are straight.', 'Let it rise until your forearms are about parallel to the floor.'],
    cue: 'Elbows stay still; only your forearms move.',
  },
  'oh-tri-ext': {
    steps: ['Face away from a high cable, rope behind your head, one foot forward.', 'Extend your arms forward and up until straight.', 'Return slowly with elbows pointing forward.'],
    cue: 'Keep your upper arms fixed and do not flare the elbows.',
  },
  skullcrusher: {
    steps: ['Lie on a bench holding an EZ bar over your chest.', 'Bend your elbows to lower the bar toward your forehead.', 'Extend your arms back to the start.'],
    cue: 'Upper arms stay vertical; use moderate weight to protect your elbows.',
  },
  'face-pull': {
    steps: ['Set a rope at upper-chest to face height, step back with arms extended.', 'Pull the rope toward your face, elbows high and out.', 'Squeeze your shoulder blades, then return slowly.'],
    cue: 'Light weight and a crisp squeeze; this is a shoulder-health lift.',
  },
  'rear-delt-fly': {
    steps: ['Face the pad of the pec deck, handles at shoulder height.', 'Sweep your arms back with soft elbows.', 'Return slowly without letting the weight stack touch.'],
    cue: 'Do not shrug; lead with your elbows.',
  },
  'lateral-raise': {
    steps: ['Stand with light dumbbells at your sides, slight elbow bend.', 'Raise your arms out to shoulder height.', 'Lower slowly.'],
    cue: 'Do not go above shoulder height or swing the weights.',
  },
  'cable-lateral': {
    steps: ['Stand side-on to a low cable, handle in the far hand.', 'Raise your arm out to shoulder height.', 'Lower under control.'],
    cue: 'Keep your torso still and the movement smooth.',
  },
  'band-pullapart': {
    steps: ['Hold a light band in front of you at chest height, arms straight.', 'Pull the band apart by squeezing your shoulder blades.', 'Return slowly.'],
    cue: 'Do not shrug or arch your back; keep your ribs down.',
  },
  'ext-rotation': {
    steps: ['Stand side-on to a cable at elbow height, elbow tucked at your side with a towel under it.', 'Rotate your forearm outward, away from your belly.', 'Return slowly.'],
    cue: 'Use a light weight; the rotator cuff is small. Keep your elbow glued to your side.',
  },
}

/** Always-valid fallback: a YouTube search for the exercise's form. */
export function demoUrl(ex: Pick<Exercise, 'name'>, custom?: string): string {
  if (custom && /^https?:\/\//i.test(custom)) return custom
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${ex.name} proper form`)}`
}
