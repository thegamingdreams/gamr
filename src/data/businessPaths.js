const catalog = [
  ['lawn-care','Neighborhood Lawn Care','local','physical','steady','outgoing',['mower','transportation'],45,'medium','medium',['busy neighbors','elderly homeowners'],['Knock on 10 doors with a parent-approved flyer','Offer a discounted first mow','Ask for one referral after each job']],
  ['pet-sitting','Pet Sitting & Dog Walking','local','service','steady','friendly',['transportation','phone'],10,'easy','low',['pet owners','traveling families'],['Create a pet safety checklist','Text 5 family friends','Offer a trial 20-minute walk']],
  ['tutoring-math','Math Tutoring','hybrid','educational','skill','patient',['laptop','phone'],0,'medium','low',['younger students','parents'],['Pick one grade level','Make a sample worksheet','Ask teachers/parents for introductions']],
  ['social-media-edits','Short-Form Video Editing','online','creative','fast','creative',['laptop','canva'],0,'medium','low',['local creators','small businesses'],['Edit 3 demo clips','Post before/after examples','DM 10 creators with a sample idea']],
  ['canva-design','Canva Design Studio','online','creative','fast','creative',['laptop','canva'],0,'easy','low',['clubs','local businesses'],['Make 5 portfolio graphics','Offer one free redesign','Package 10 posts for a fixed price']],
  ['car-wash','Mobile Car Wash','local','physical','steady','outgoing',['transportation','cleaning kit'],35,'medium','medium',['parents','neighbors','teachers'],['Buy basic supplies','Wash one family car for photos','Book a Saturday route']],
  ['resale','Sneaker/Thrift Reselling','hybrid','sales','fast','analytical',['phone','transportation'],60,'hard','medium',['online buyers','students'],['Research sold prices','Start with 3 low-risk items','Track profit after fees']],
  ['websites','Simple Websites for Local Businesses','online','tech','skill','analytical',['laptop'],0,'hard','low',['barbers','clubs','restaurants'],['Build one demo landing page','Create a $99 starter offer','Email 15 businesses']],
  ['babysitting','Babysitting Helper','local','service','steady','responsible',['transportation','phone'],0,'medium','medium',['families','neighbors'],['Get parent references','Create availability card','Start with families you know']],
  ['pressure-washing','Pressure Washing Helper','local','physical','steady','confident',['transportation','equipment'],120,'hard','medium',['homeowners','small shops'],['Borrow/rent equipment safely','Clean one driveway for proof','Offer weekend slots']],
  ['birthday-helper','Kids Party Helper','local','creative','steady','energetic',['transportation','crafts'],20,'medium','medium',['parents','event hosts'],['Create 3 party packages','Practice games list','Message parent groups with supervision']],
  ['ugc','UGC Product Videos','online','creative','fast','confident',['phone','camera'],0,'medium','low',['DTC brands','Etsy sellers'],['Film 3 sample product videos','Make a rate card','Pitch 20 small brands']],
  ['ai-prompts','AI Prompt Packs','online','tech','fast','analytical',['laptop'],0,'medium','low',['students','creators','small teams'],['Choose a niche','Build 25 useful prompts','Sell as a digital download']],
  ['printables','Printable Planner Shop','online','creative','passive','organized',['laptop','canva'],0,'medium','low',['students','parents','teachers'],['Design one planner set','List on a marketplace','Post 10 examples']],
  ['sports-coaching','Youth Sports Skills Coach','local','educational','steady','athletic',['transportation','sports gear'],0,'medium','medium',['younger athletes','parents'],['Pick one skill','Run a free mini-session','Offer 4-session bundle']],
  ['music-lessons','Beginner Music Lessons','hybrid','educational','skill','patient',['instrument','laptop'],0,'medium','low',['beginners','parents'],['Create a first lesson plan','Record a demo','Offer first lesson discount']],
  ['photography','Event Mini Photography','local','creative','steady','creative',['camera','transportation'],80,'hard','medium',['families','teams','clubs'],['Shoot 2 practice events','Make a portfolio page','Offer 30-minute mini sessions']],
  ['errand-helper','Neighborhood Errand Helper','local','service','steady','responsible',['transportation','phone'],0,'easy','medium',['busy families','seniors'],['List safe errands','Set parent-approved boundaries','Offer weekly helper slots']],
  ['discord-setup','Discord Community Setup','online','tech','skill','analytical',['laptop'],0,'medium','low',['creators','clubs','gaming groups'],['Build a demo server','Make a setup checklist','DM community owners']],
  ['custom-stickers','Custom Sticker Shop','hybrid','creative','fast','creative',['canva','printer'],40,'medium','low',['students','clubs','teams'],['Create 10 designs','Take preorders','Bundle stickers by theme']]
];

const variants = ['Starter','Express','Pro','Micro','Neighborhood','Creator','Student','Weekend','AI-Assisted'];
const audiences = ['students','parents','clubs','teams','creators','local shops','neighbors','teachers','coaches'];
const categories = ['service','creative','tech','educational','sales','physical'];

function expandPath(base, index) {
  const variant = variants[index % variants.length];
  const audience = audiences[index % audiences.length];
  const title = index < catalog.length ? base[1] : `${variant} ${base[1]} for ${audience}`;
  const category = index < catalog.length ? base[3] : categories[index % categories.length];
  const mode = index < catalog.length ? base[2] : ['online','local','hybrid'][index % 3];
  const startupCost = Math.max(0, base[7] + ((index % 5) * 10) - 10);
  const difficulty = ['easy','medium','hard'][(index + (base[8] === 'hard' ? 2 : 0)) % 3];
  const riskLevel = ['low','medium','medium','high'][index % 4];
  const confidenceNeeded = ['low','medium','high'][(index + (base[5] === 'confident' ? 2 : 0)) % 3];
  const requiredSkills = Array.from(new Set([base[3], base[4], category, index % 2 ? 'communication' : 'organization']));
  const toolsNeeded = Array.from(new Set([...base[6], mode === 'online' ? 'laptop' : 'phone']));
  const firstSteps = [...base[11], `Create a simple proof-of-work sample for ${audience}.`, 'Ask a trusted adult to review safety, pricing, and outreach.'];
  return {
    id: `${base[0]}-${index + 1}`,
    title,
    category,
    description: `${title} helps ${audience} solve a clear problem using a teen-friendly ${mode} workflow with small first offers and parent-approved boundaries.`,
    mode,
    startupCost,
    difficulty,
    incomePotential: startupCost > 80 || difficulty === 'hard' ? '$200-$1,500+/mo' : '$50-$600/mo',
    requiredSkills,
    recommendedPersonality: [base[5], index % 2 ? 'self-starter' : 'detail-oriented'],
    confidenceNeeded,
    toolsNeeded,
    ageFriendliness: index % 4 === 0 ? 'Best for 15-18 with adult support' : 'Friendly for ages 13-18 with permission',
    riskLevel,
    firstOffer: `A low-risk ${mode} starter package: ${base[1]} trial for $${10 + (index % 9) * 5}-$${25 + (index % 12) * 10}.`,
    targetCustomers: Array.from(new Set([...(base[10] || []), audience])),
    firstSteps,
    pricingIdeas: [`Starter: $${10 + (index % 6) * 5}`, `Bundle: $${49 + (index % 8) * 15}`, `Monthly: $${99 + (index % 10) * 25}`],
    marketingPlan: [`Post proof on a simple portfolio or family-approved social account.`, `Ask 10 warm contacts for feedback or referrals.`, `Use a clear before/after result and one specific call to action for ${audience}.`],
    warnings: ['Get parent/guardian permission before meeting customers.', 'Track expenses, time, and commitments honestly.', 'Do not promise results you cannot control.'],
    pathSpecificTasks: [`Build one ${title} sample`, `Contact 5 potential ${audience}`, 'Record one lesson learned', 'Improve your offer from customer feedback'],
    pathSpecificTools: toolsNeeded.concat(['pricing calculator','simple CRM','weekly review template']),
    pathSpecificScripts: {
      opener: `Hi! I’m testing a teen-run ${title} service for ${audience}. Could I show you a quick sample and see if it would help?`,
      followUp: `Thanks for checking it out. Would you like the starter package this week, or should I send one improvement idea first?`,
      objection: `Totally fair. I can start with a small trial so you can judge the quality before committing.`
    },
    workType: category,
    avoidTags: riskLevel === 'high' ? ['high risk','inventory'] : ['none'],
    sellingIntensity: confidenceNeeded === 'high' ? 'high' : confidenceNeeded,
    transportationNeeded: mode !== 'online'
  };
}

export const businessPaths = Array.from({ length: 180 }, (_, index) => expandPath(catalog[index % catalog.length], index));
export const businessPathCount = businessPaths.length;
