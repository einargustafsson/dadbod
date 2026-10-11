import type { BodyRegion, Equipment, Exercise, MobilityMove, Pattern } from '../../types'

const INCREMENT: Record<Equipment, number> = {
  barbell: 2.5, dumbbell: 2, machine: 2.5, cable: 2.5, bodyweight: 2.5,
}

// Starting weights are entered by the user on first use, so they default to 0.
function ex(
  id: string, name: string, pattern: Pattern, region: BodyRegion,
  equipment: Equipment, isCompound: boolean,
): Exercise {
  return {
    id, name, pattern, region, equipment, isCompound,
    repMin: isCompound ? 5 : 8,
    repMax: isCompound ? 8 : 12,
    startingWeight: 0,
    increment: isCompound || equipment !== 'dumbbell' ? INCREMENT[equipment] : 1,
  }
}

export const EXERCISES: Exercise[] = [
  // Lower: squat
  ex('back-squat', 'Barbell Back Squat', 'squat', 'lower', 'barbell', true),
  ex('front-squat', 'Barbell Front Squat', 'squat', 'lower', 'barbell', true),
  ex('goblet-squat', 'Goblet Squat', 'squat', 'lower', 'dumbbell', true),
  ex('leg-press', 'Leg Press', 'squat', 'lower', 'machine', true),
  ex('hack-squat', 'Hack Squat', 'squat', 'lower', 'machine', true),
  ex('smith-squat', 'Smith Machine Squat', 'squat', 'lower', 'machine', true),
  // Lower: hinge
  ex('rdl', 'Romanian Deadlift', 'hinge', 'lower', 'barbell', true),
  ex('deadlift', 'Conventional Deadlift', 'hinge', 'lower', 'barbell', true),
  ex('trap-bar-dl', 'Trap Bar Deadlift', 'hinge', 'lower', 'barbell', true),
  ex('db-rdl', 'Dumbbell Romanian Deadlift', 'hinge', 'lower', 'dumbbell', true),
  ex('hip-thrust', 'Barbell Hip Thrust', 'hinge', 'lower', 'barbell', true),
  ex('back-extension', 'Back Extension', 'hinge', 'lower', 'bodyweight', false),
  ex('cable-pull-through', 'Cable Pull-Through', 'hinge', 'lower', 'cable', false),
  // Lower: single leg
  ex('split-squat', 'Dumbbell Split Squat', 'single-leg', 'lower', 'dumbbell', true),
  ex('bulgarian', 'Bulgarian Split Squat', 'single-leg', 'lower', 'dumbbell', true),
  ex('walking-lunge', 'Walking Lunge', 'single-leg', 'lower', 'dumbbell', true),
  ex('step-up', 'Dumbbell Step-Up', 'single-leg', 'lower', 'dumbbell', true),
  ex('reverse-lunge', 'Reverse Lunge', 'single-leg', 'lower', 'dumbbell', true),
  ex('leg-extension', 'Leg Extension', 'single-leg', 'lower', 'machine', false),
  ex('leg-curl', 'Seated Leg Curl', 'single-leg', 'lower', 'machine', false),
  ex('lying-leg-curl', 'Lying Leg Curl', 'single-leg', 'lower', 'machine', false),
  // Lower: calf & core
  ex('standing-calf', 'Standing Calf Raise', 'calf', 'lower', 'machine', false),
  ex('seated-calf', 'Seated Calf Raise', 'calf', 'lower', 'machine', false),
  ex('db-calf', 'Single-Leg Dumbbell Calf Raise', 'calf', 'lower', 'dumbbell', false),
  ex('plank', 'Weighted Plank', 'core', 'lower', 'bodyweight', false),
  ex('cable-crunch', 'Cable Crunch', 'core', 'lower', 'cable', false),
  ex('hanging-knee-raise', 'Hanging Knee Raise', 'core', 'lower', 'bodyweight', false),
  ex('pallof', 'Pallof Press', 'core', 'lower', 'cable', false),
  ex('ab-wheel', 'Ab Wheel Rollout', 'core', 'lower', 'bodyweight', false),
  // Upper: horizontal push
  ex('bench', 'Barbell Bench Press', 'h-push', 'upper', 'barbell', true),
  ex('db-bench', 'Dumbbell Bench Press', 'h-push', 'upper', 'dumbbell', true),
  ex('incline-db', 'Incline Dumbbell Press', 'h-push', 'upper', 'dumbbell', true),
  ex('machine-chest', 'Machine Chest Press', 'h-push', 'upper', 'machine', true),
  ex('pushup', 'Weighted Push-Up', 'h-push', 'upper', 'bodyweight', true),
  ex('cable-fly', 'Cable Chest Fly', 'h-push', 'upper', 'cable', false),
  // Upper: horizontal pull
  ex('bb-row', 'Barbell Row', 'h-pull', 'upper', 'barbell', true),
  ex('db-row', 'One-Arm Dumbbell Row', 'h-pull', 'upper', 'dumbbell', true),
  ex('seated-row', 'Seated Cable Row', 'h-pull', 'upper', 'cable', true),
  ex('machine-row', 'Chest-Supported Machine Row', 'h-pull', 'upper', 'machine', true),
  ex('chest-sup-row', 'Chest-Supported Dumbbell Row', 'h-pull', 'upper', 'dumbbell', true),
  // Upper: vertical push
  ex('ohp', 'Standing Overhead Press', 'v-push', 'upper', 'barbell', true),
  ex('db-ohp', 'Seated Dumbbell Shoulder Press', 'v-push', 'upper', 'dumbbell', true),
  ex('machine-ohp', 'Machine Shoulder Press', 'v-push', 'upper', 'machine', true),
  ex('landmine-press', 'Landmine Press', 'v-push', 'upper', 'barbell', true),
  // Upper: vertical pull
  ex('pullup', 'Pull-Up', 'v-pull', 'upper', 'bodyweight', true),
  ex('chinup', 'Chin-Up', 'v-pull', 'upper', 'bodyweight', true),
  ex('lat-pulldown', 'Lat Pulldown', 'v-pull', 'upper', 'cable', true),
  ex('neutral-pulldown', 'Neutral-Grip Pulldown', 'v-pull', 'upper', 'cable', true),
  ex('assisted-pullup', 'Assisted Pull-Up', 'v-pull', 'upper', 'machine', true),
  // Upper: arms
  ex('curl', 'Dumbbell Curl', 'arms', 'upper', 'dumbbell', false),
  ex('hammer-curl', 'Hammer Curl', 'arms', 'upper', 'dumbbell', false),
  ex('cable-curl', 'Cable Curl', 'arms', 'upper', 'cable', false),
  ex('pushdown', 'Triceps Pushdown', 'arms', 'upper', 'cable', false),
  ex('oh-tri-ext', 'Overhead Triceps Extension', 'arms', 'upper', 'cable', false),
  ex('skullcrusher', 'EZ-Bar Skullcrusher', 'arms', 'upper', 'barbell', false),
  // Upper: shoulder health
  ex('face-pull', 'Face Pull', 'shoulder-health', 'upper', 'cable', false),
  ex('rear-delt-fly', 'Reverse Pec Deck', 'shoulder-health', 'upper', 'machine', false),
  ex('lateral-raise', 'Dumbbell Lateral Raise', 'shoulder-health', 'upper', 'dumbbell', false),
  ex('cable-lateral', 'Cable Lateral Raise', 'shoulder-health', 'upper', 'cable', false),
  ex('band-pullapart', 'Band Pull-Apart', 'shoulder-health', 'upper', 'bodyweight', false),
  ex('ext-rotation', 'Cable External Rotation', 'shoulder-health', 'upper', 'cable', false),
]

export const EXERCISE_BY_ID: Record<string, Exercise> =
  Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export const MOBILITY: MobilityMove[] = [
  { id: 'w-90-90', name: '90/90 Hip Switch', kind: 'warmup', focus: 'hips', cue: 'Sit tall, rotate both knees side to side, 10 slow reps.', seconds: 60 },
  { id: 'w-worlds-greatest', name: "World's Greatest Stretch", kind: 'warmup', focus: 'hips', cue: 'Lunge, elbow to instep, rotate and reach. 5 per side.', seconds: 90 },
  { id: 'w-cat-camel', name: 'Cat-Camel', kind: 'warmup', focus: 'thoracic', cue: 'Slow spinal flexion and extension on all fours, 10 reps.', seconds: 45 },
  { id: 'w-open-book', name: 'Thoracic Open Book', kind: 'warmup', focus: 'thoracic', cue: 'Side lying, rotate top arm open, follow with eyes. 8 per side.', seconds: 75 },
  { id: 'w-wall-slide', name: 'Wall Slide', kind: 'warmup', focus: 'shoulders', cue: 'Forearms on wall, slide up while keeping ribs down. 10 reps.', seconds: 45 },
  { id: 'w-band-dislocate', name: 'Band Shoulder Dislocate', kind: 'warmup', focus: 'shoulders', cue: 'Wide grip, arms straight, circle overhead and back. 10 reps.', seconds: 45 },
  { id: 'w-ankle-rock', name: 'Ankle Rock', kind: 'warmup', focus: 'hips', cue: 'Knee over toe against a wall, 10 per side.', seconds: 60 },
  { id: 'f-single-leg-stand', name: 'Single-Leg Stand (eyes closed)', kind: 'finisher', focus: 'balance', cue: '30 seconds per leg. Hold a rack nearby if needed.', seconds: 90 },
  { id: 'f-tandem-walk', name: 'Tandem Walk', kind: 'finisher', focus: 'balance', cue: 'Heel-to-toe along a line, 3 passes of 6 m.', seconds: 90 },
  { id: 'f-sl-rdl-reach', name: 'Single-Leg Reach (no weight)', kind: 'finisher', focus: 'balance', cue: 'Hinge on one leg and reach forward. 8 per side.', seconds: 90 },
  { id: 'f-farmer-carry', name: "Farmer's Carry", kind: 'finisher', focus: 'grip-carry', cue: 'Heavy dumbbells, tall posture, 3 x 20 m.', seconds: 120 },
  { id: 'f-dead-hang', name: 'Dead Hang', kind: 'finisher', focus: 'grip-carry', cue: 'Hang from the bar, 2 x as long as comfortable (aim 30-45 s).', seconds: 90 },
  { id: 'f-suitcase-carry', name: 'Suitcase Carry', kind: 'finisher', focus: 'grip-carry', cue: 'One heavy dumbbell, resist leaning, 2 x 20 m per side.', seconds: 120 },
]
