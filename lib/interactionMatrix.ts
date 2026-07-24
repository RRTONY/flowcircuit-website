import { Role } from './surveyData';

export interface InteractionGuide {
  from: Role;
  to: Role;
  do: string;
  dont: string;
  dynamic: string; // Description of the energy between them
}

export const interactionMatrix: InteractionGuide[] = [
  // SPARK Interactions
  {
    from: 'Spark',
    to: 'Spark',
    dynamic: "The Supernova. Infinite energy, zero gravity.",
    do: "Build on each other's wild ideas ('Yes, and...'). Set a timer for brainstorming.",
    dont: "Compete for the spotlight. Forget to write things down."
  },
  {
    from: 'Spark',
    to: 'Amplifier',
    dynamic: "The Launchpad. The idea meets the megaphone.",
    do: "Give them the core concept and let them run with the story. Trust their social instincts.",
    dont: "Overwhelm them with technical details. Micromanage the pitch."
  },
  {
    from: 'Spark',
    to: 'Filter',
    dynamic: "The Friction Point. Fire meets Ice.",
    do: "Present the 'why' before the 'what'. Ask for 'how to make this work' not 'if it will work'.",
    dont: "Take their questions as personal attacks. Ignore their warnings."
  },
  {
    from: 'Spark',
    to: 'Ground',
    dynamic: "The Disconnect. The Cloud meets the Concrete.",
    do: "Respect their need for clarity. Provide a finished concept, not a rough draft.",
    dont: "Change the plan halfway through execution. Be vague about deadlines."
  },
  {
    from: 'Spark',
    to: 'Conductor',
    dynamic: "The Channel. Raw energy meets the Grid.",
    do: "Use them to translate your vision to the rest of the team. Trust their timing.",
    dont: "Bypass the process they've set up. Disrupt the team flow unnecessarily."
  },

  // AMPLIFIER Interactions
  {
    from: 'Amplifier',
    to: 'Spark',
    dynamic: "The Fan Club. Validation meets Inspiration.",
    do: "Celebrate their genius. Ask for the 'next big thing' to sell.",
    dont: "Ask for detailed spreadsheets. Kill their vibe with logistics."
  },
  {
    from: 'Amplifier',
    to: 'Amplifier',
    dynamic: "The Echo Chamber. Lots of noise, lots of fun.",
    do: "Co-host the party. Share contacts and networks.",
    dont: "Compete for attention. Forget to actually do the work."
  },
  {
    from: 'Amplifier',
    to: 'Filter',
    dynamic: "The Oil and Water. Hype meets Reality.",
    do: "Acknowledge the risks they see. Use their data to strengthen your pitch.",
    dont: "Dismiss their concerns as 'negativity'. Oversell without checking facts."
  },
  {
    from: 'Amplifier',
    to: 'Ground',
    dynamic: "The Handoff. The Promise meets the Delivery.",
    do: "Get them excited about the *impact* of their work. Connect them to the purpose.",
    dont: "Interrupt their work with random chats. Promise things they can't deliver."
  },
  {
    from: 'Amplifier',
    to: 'Conductor',
    dynamic: "The Broadcast. The Message meets the Medium.",
    do: "Help them keep the team morale high. Be the emotional glue.",
    dont: "Create drama. Ignore the schedule for the sake of 'vibes'."
  },

  // FILTER Interactions
  {
    from: 'Filter',
    to: 'Spark',
    dynamic: "The Reality Check. The Anchor meets the Balloon.",
    do: "Validate the creativity *before* pointing out the flaws. Offer solutions, not just problems.",
    dont: "Say 'no' immediately. Crush the idea before it breathes."
  },
  {
    from: 'Filter',
    to: 'Amplifier',
    dynamic: "The Fact Check. The Audit meets the Ad.",
    do: "Provide the data they need to be credible. Help them avoid embarrassment.",
    dont: "Be a buzzkill in front of the client. Nitpick irrelevant details."
  },
  {
    from: 'Filter',
    to: 'Filter',
    dynamic: "The Peer Review. Precision meets Accuracy.",
    do: "Debate the logic. Enjoy the intellectual rigor.",
    dont: "Get stuck in analysis paralysis. Forget to make a decision."
  },
  {
    from: 'Filter',
    to: 'Ground',
    dynamic: "The Blueprint. The Spec meets the Build.",
    do: "Give them flawless, detailed instructions. Be available for questions.",
    dont: "Change the specs once construction starts. Be ambiguous."
  },
  {
    from: 'Filter',
    to: 'Conductor',
    dynamic: "The Safety Valve. The Warning meets the Control.",
    do: "Alert them to risks early. Help them optimize the process.",
    dont: "Hoard information. Wait until the last minute to raise a red flag."
  },

  // GROUND Interactions
  {
    from: 'Ground',
    to: 'Spark',
    dynamic: "The Frustration. The Doer meets the Dreamer.",
    do: "Ask for the final version. Set boundaries on changes.",
    dont: "Expect them to be organized. Get angry at their chaos (it's their job)."
  },
  {
    from: 'Ground',
    to: 'Amplifier',
    dynamic: "The Engine Room. The Work meets the Talk.",
    do: "Ask them to handle the politics so you can work. Let them shine the light on your results.",
    dont: "Resent their socializing. Assume they aren't working."
  },
  {
    from: 'Ground',
    to: 'Filter',
    dynamic: "The Construction Site. The Plan meets the Action.",
    do: "Trust their plan. Ask for clarification if something doesn't fit.",
    dont: "Cut corners. Ignore the specs."
  },
  {
    from: 'Ground',
    to: 'Ground',
    dynamic: "The Assembly Line. Efficiency meets Output.",
    do: "Divide and conquer. Coordinate schedules.",
    dont: "Step on each other's toes. Duplicate effort."
  },
  {
    from: 'Ground',
    to: 'Conductor',
    dynamic: "The Status Update. The Progress meets the Plan.",
    do: "Report blockers immediately. Be honest about timelines.",
    dont: "Hide problems. Say 'yes' when you mean 'no'."
  },

  // CONDUCTOR Interactions
  {
    from: 'Conductor',
    to: 'Spark',
    dynamic: "The Guidance. The Riverbanks meet the Water.",
    do: "Give them a sandbox to play in. Protect them from bureaucracy.",
    dont: "Stifle their creativity with too many rules. Let them derail the meeting."
  },
  {
    from: 'Conductor',
    to: 'Amplifier',
    dynamic: "The Modulation. The Volume meets the Knob.",
    do: "Channel their energy into the right goals. Use them to rally the troops.",
    dont: "Let them dominate the airwaves. Forget to ground them in reality."
  },
  {
    from: 'Conductor',
    to: 'Filter',
    dynamic: "The Calibration. The System meets the Standard.",
    do: "Value their caution. Give them the time they need to review.",
    dont: "Ignore their warnings. Let them slow down the momentum too much."
  },
  {
    from: 'Conductor',
    to: 'Ground',
    dynamic: "The Support. The Leader meets the Soldier.",
    do: "Remove obstacles from their path. Protect their time.",
    dont: "Micromanage their tasks. Change priorities constantly."
  },
  {
    from: 'Conductor',
    to: 'Conductor',
    dynamic: "The Mirror. Leadership meets Leadership.",
    do: "Align on the vision. Split the responsibilities clearly.",
    dont: "Power struggle. Send mixed messages to the team."
  }
];

export function getInteraction(from: Role, to: Role): InteractionGuide | undefined {
  return interactionMatrix.find(i => i.from === from && i.to === to);
}
