// Supplemental reading pages transcribed and organized from the attached
// LaunchPad Middle School Entrepreneurship Student Textbooks.

export type TextbookCaseStudy = {
  name: string;
  subtitle: string;
  body: string[];
  questions: string[];
};

export type TextbookPage = {
  id: string;
  chapterId: string;
  title: string;
  minutes: number;
  bigQuestion: string;
  paragraphs: string[];
  keyIdea: string;
  mindsetPractice?: string[];
  caseStudy: TextbookCaseStudy;
};

export const TEXTBOOK_PAGES: TextbookPage[] = [
  {
    id: 'p1-1',
    chapterId: 'ch1',
    title: 'Reading 1.A — From Complaint to Opportunity',
    minutes: 9,
    bigQuestion: 'How does an entrepreneur turn everyday friction into value?',
    paragraphs: [
      'Entrepreneurship often begins with a small moment of frustration: a line that moves too slowly, a backpack that never has enough pockets, a club fundraiser that does not attract buyers, or a tool that is too expensive for the people who need it. Many people notice these problems and move on. An entrepreneur pauses, names the friction, and asks whether solving it could create value for someone else.',
      'A complaint is only the first signal. To become an opportunity, it must be described in a way that can be studied. Instead of saying, “Lunch is annoying,” an entrepreneur might say, “Students who bring lunch cannot keep cold food cold until noon, so they either avoid certain foods or throw food away.” That statement identifies who experiences the problem, when it happens, what currently goes wrong, and why it matters.',
      'The entrepreneurial mindset turns frustration into inquiry. Curiosity asks, “Why does this keep happening?” Empathy asks, “Who feels this problem most strongly?” Initiative asks, “What small test could I run this week?” Resilience asks, “What can I learn if my first idea is wrong?” These habits matter because a favorite idea can distract a founder from the real customer need.',
      'One useful tool is the How Might We question. “How might we help students keep lunches cold without adding heavy equipment?” is more productive than “How can I sell a cooler?” The first version invites many possible solutions; the second version assumes the answer too early. Strong entrepreneurs delay the final answer long enough to understand the problem.',
      'Need Validation is the process of checking whether the problem is real, frequent, and important enough for people to care. Validation can include interviews, short surveys, observation, a prototype, a sign-up sheet, or a simple test sale. The goal is not to prove that the entrepreneur is brilliant. The goal is to collect evidence that makes the next decision smarter.',
      'A classroom venture can practice this immediately. Notice a repeated friction point at school. Write the problem in one sentence. Identify the people affected. Ask three students what they currently do about it. If they already have a solution they like, your opportunity may be weak. If they are frustrated and improvising, you may have found a problem worth exploring.',
    ],
    keyIdea: 'Entrepreneurs create value by turning a specific friction point into a testable opportunity, then validating the need before building too much.',
    mindsetPractice: [
      'Curiosity: Ask “why does this happen?” five times before proposing a product.',
      'Empathy: Interview the people affected and listen for emotions, workarounds, and repeated patterns.',
      'Initiative: Create one small test that can be completed with materials already available.',
    ],
    caseStudy: {
      name: "Moziah Bridges — Mo's Bows",
      subtitle: 'A personal problem becomes an opportunity',
      body: [
        'Moziah Bridges wanted bow ties that matched his personality, but the options available to him did not feel bold, youthful, or expressive enough. Instead of accepting the limited choices, he learned to sew with help from his grandmother and began making his own. His early materials were simple, but the value was clear: customers could wear something distinctive and personal.',
        'Moziah did not need a large factory to begin. He started with skills, support, scrap fabric, and local buyers. Each sale gave him feedback about style, quality, price, and customer interest. His story shows that an opportunity can begin with a problem the entrepreneur personally understands, as long as the entrepreneur also checks whether other people care about the same value.',
        'The entrepreneurial mindset in this case is not just creativity. It is self-direction, learning from a mentor, using available resources, and taking a small public step before everything is perfect.',
      ],
      questions: [
        'What specific friction point did Moziah notice in the bow ties available to him?',
        'Which resources did he already have before the business grew?',
        'How did selling locally help him validate that other people valued his solution?',
      ],
    },
  },
  {
    id: 'p1-2',
    chapterId: 'ch1',
    title: 'Reading 1.B — Entrepreneurial Mindset in Action',
    minutes: 9,
    bigQuestion: 'Which habits help an entrepreneur move from “I notice” to “I can”?',
    paragraphs: [
      'The entrepreneurial mindset is a set of habits that help people move from observation to action. It includes curiosity, empathy, creativity, calculated risk-taking, resourcefulness, and resilience. These traits are useful far beyond business. They help students solve problems in clubs, sports, families, classrooms, and communities.',
      'Curiosity helps an entrepreneur search for causes instead of stopping at symptoms. If a school store is not selling many snacks, a curious student does not simply say, “Students do not like the store.” They ask what time it opens, what products are available, whether prices feel fair, whether students know it exists, and what alternatives students already choose.',
      'Empathy keeps the entrepreneur focused on the customer. A founder may love an idea, but customers decide whether it creates value. Empathy means asking respectful questions, noticing body language, and understanding the customer’s real situation. A product that seems exciting to the founder may be inconvenient, embarrassing, too expensive, or unnecessary for the audience.',
      'Resilience and grit matter because entrepreneurship is filled with imperfect information. A prototype may break. A survey may reveal that people do not want the original idea. A pitch may receive tough feedback. The entrepreneurial response is not to quit or ignore the feedback. The response is to treat results as data and decide what to improve next.',
      'Calculated risk-taking is different from gambling. A calculated risk uses evidence to keep possible losses small while learning something important. Spending $15 to test five handmade products after ten classmates express interest is a calculated risk. Spending $300 on inventory without asking customers is a guess disguised as confidence.',
      'The LaunchPad approach asks students to practice the mindset through action: identify a problem, validate the need, brainstorm solutions, research the audience, build a small version, test it, calculate whether it can work financially, and communicate the value clearly. Each step builds confidence because students learn that progress comes from disciplined action, not from waiting for the perfect idea.',
    ],
    keyIdea: 'Entrepreneurial mindset means using curiosity, empathy, evidence, and resilience to keep learning while taking responsible action.',
    mindsetPractice: [
      'Resilience: Rewrite one piece of negative feedback as a useful design question.',
      'Calculated risk: Name what you can test cheaply before spending money.',
      'Resourcefulness: List three people, tools, spaces, or materials you can use with permission this week.',
    ],
    caseStudy: {
      name: 'Mikaila Ulmer — Me & the Bees',
      subtitle: 'Curiosity, family resources, and mission-driven value',
      body: [
        'Mikaila Ulmer became interested in bees after learning more about them and their importance to the environment. She connected that curiosity with a family lemonade recipe and created a product that had both taste value and mission value. Customers were not only buying lemonade; they were also connecting with a story about protecting pollinators.',
        'Her venture demonstrates several parts of the entrepreneurial mindset. She used family knowledge, learned about a real environmental issue, started with a product people could understand, and communicated why the product mattered. The idea grew because it combined customer value with a purpose that made the brand memorable.',
        'Mission alone is not enough to sustain a venture, and product alone may not create loyalty. Mikaila’s case shows how an entrepreneur can connect need, story, quality, and values into one clear offer.',
      ],
      questions: [
        'How did curiosity shape Mikaila’s entrepreneurial path?',
        'What resources and relationships helped her begin?',
        'How did her mission strengthen the value customers saw in the product?',
      ],
    },
  },
  {
    id: 'p2-1',
    chapterId: 'ch2',
    title: 'Reading 2.A — Needs, Wants & Pain Points',
    minutes: 9,
    bigQuestion: 'How can observation reveal an opportunity worth solving?',
    paragraphs: [
      'Entrepreneurs study what people need, what they want, and what gets in their way. A need is connected to basic functioning, safety, access, learning, health, or required tasks. A want may be connected to comfort, style, identity, enjoyment, convenience, or status. Many successful products serve both at the same time.',
      'A student may need a backpack that carries books safely, but they may want one that matches their style. A family may need dinner, but they may want dinner that is fast, affordable, and healthy. A teacher may need students to turn in work, but may want a smoother system that reduces reminders. Understanding motivation helps an entrepreneur design and explain the solution.',
      'Pain Points are the specific frustrations, delays, costs, risks, or disappointments people experience. Pain Points can be financial, such as something being too expensive; functional, such as something breaking; emotional, such as embarrassment; or time-based, such as a process taking too long. The more specific the pain point, the easier it is to design a useful test.',
      'Observation is powerful because people do not always explain their routines accurately. A customer might say a product is “fine” while still creating workarounds every day. Entrepreneurs watch where people pause, repeat steps, ask for help, abandon a task, or create homemade fixes. Those moments can reveal an unmet need.',
      'The entrepreneurial mindset asks students to suspend judgment. Instead of laughing at a workaround or immediately selling an idea, the entrepreneur asks, “What job is this person trying to get done?” and “What makes the current option frustrating?” This moves the focus from the product the entrepreneur wants to build toward the value the customer actually needs.',
      'A strong problem statement includes the customer, the situation, the pain, and the impact: “Seventh graders who carry sports gear after school cannot fit everything in one bag, so they leave materials behind or arrive late.” That sentence gives a team something concrete to research, brainstorm, and test.',
    ],
    keyIdea: 'Observation turns a broad complaint into a specific Pain Point connected to a real Need, Want, or customer motivation.',
    mindsetPractice: [
      'Empathy: Watch a routine without interrupting and record where users struggle.',
      'Problem framing: Write one problem statement using customer, situation, pain, and impact.',
      'Curiosity: Separate what customers say from what they actually do.',
    ],
    caseStudy: {
      name: 'Chester Greenwood',
      subtitle: 'Cold ears, bent wire, and soft materials',
      body: [
        'Chester Greenwood experienced a simple winter problem: his ears became painfully cold while ice skating. The need was comfort and protection in cold weather. The want was a solution that was wearable and practical. Instead of accepting the problem, he experimented with bent wire and soft materials to cover the ears.',
        'The invention worked because it matched the specific pain point. It did not try to solve every winter clothing issue. It focused on one repeated discomfort and used available materials to create a simple solution. That focus is a major entrepreneurial lesson: a narrow problem can still produce meaningful value.',
        'Greenwood’s example also shows that entrepreneurship does not require complicated technology. It requires noticing, trying, and improving. A useful solution can come from combining familiar materials in a new way.',
      ],
      questions: [
        'What specific Pain Point did Greenwood address?',
        'Was the product serving a Need, a Want, or both?',
        'What observations would help him improve the design after the first test?',
      ],
    },
  },
  {
    id: 'p2-2',
    chapterId: 'ch2',
    title: 'Reading 2.B — Brainstorming with SCAMPER',
    minutes: 10,
    bigQuestion: 'How can one problem lead to many possible solutions?',
    paragraphs: [
      'Brainstorming is not just shouting out random ideas. Strong brainstorming creates many possible directions before the team judges which one is best. SCAMPER gives entrepreneurs a structured way to transform an object, process, service, or routine: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, and Reverse or Rearrange.',
      'Substitute asks what material, person, tool, or step could be swapped. Combine asks whether two helpful features could work together. Adapt asks what solution from another setting could be borrowed. Modify asks what could be made larger, smaller, faster, safer, simpler, or more personal. Put to another use asks whether an existing item can solve a different problem. Eliminate asks what can be removed. Reverse or Rearrange asks how changing the order or direction could unlock a better experience.',
      'SCAMPER supports an entrepreneurial mindset because it reduces the fear of a blank page. Students do not need one perfect idea immediately. They need a process that produces options. Quantity matters early because the first idea is often the most obvious. Better ideas often appear after the team stretches, combines, or challenges the first answer.',
      'Imagine a school water bottle problem: bottles leak in backpacks, are forgotten in classrooms, and look similar. Substitute might lead to a stronger lid material. Combine might add a name tag and reminder clip. Adapt might borrow a luggage tag system. Modify might make the shape fit a side pocket better. Eliminate might remove unnecessary parts that break. Reverse might create a classroom return station instead of expecting students to remember every bottle.',
      'After brainstorming, entrepreneurs sort ideas by desirability, feasibility, and evidence. Desirability asks whether customers care. Feasibility asks whether the team can build or deliver it. Evidence asks what can be tested quickly. This step prevents teams from choosing only the idea that sounds fun but does not match the customer problem.',
      'SCAMPER also encourages respectful collaboration. A teammate’s unusual suggestion may become useful when combined with another idea. The team should build on ideas before criticizing them, then use customer evidence to make the final choice.',
    ],
    keyIdea: 'SCAMPER helps entrepreneurs generate multiple solutions, then choose a direction based on customer value, feasibility, and testable evidence.',
    mindsetPractice: [
      'Creative problem solving: Generate one idea for each SCAMPER letter before choosing.',
      'Collaboration: Combine two teammates’ ideas into a stronger third idea.',
      'Evidence: Pick the idea that can be tested fastest with real users.',
    ],
    caseStudy: {
      name: 'Kavita Shukla & Shubham Banerjee',
      subtitle: 'Accessible materials meet meaningful problems',
      body: [
        'Kavita Shukla connected an observation about spices with the global problem of food spoilage. Her experiments eventually led to spice-infused paper designed to keep produce fresh longer. The opportunity mattered because wasted food costs money, reduces access, and creates environmental impact. Her work shows curiosity and persistence: she explored an idea through repeated experiments rather than stopping after a single attempt.',
        'Shubham Banerjee noticed that standard Braille printers were extremely expensive, making access difficult for many families and schools. He built an early prototype using a LEGO robotics kit and everyday materials. The prototype was not a perfect final product, but it helped test whether a lower-cost approach might be possible.',
        'Both examples connect SCAMPER to entrepreneurial mindset. Kavita adapted and modified familiar materials for a new purpose. Shubham substituted lower-cost components and combined existing tools in a new way. In both cases, resourcefulness helped the entrepreneurs learn before a large investment.',
      ],
      questions: [
        'Which SCAMPER moves can you recognize in each solution?',
        'How did each founder use resourcefulness to begin testing?',
        'Which part of each idea could be validated before building a polished final product?',
      ],
    },
  },
  {
    id: 'p3-1',
    chapterId: 'ch3',
    title: 'Reading 3.A — Define the Customer',
    minutes: 9,
    bigQuestion: 'Who exactly are you designing for?',
    paragraphs: [
      'A common beginner mistake is saying, “My product is for everybody.” It feels ambitious, but it usually makes the idea weaker. Different customers have different budgets, schedules, habits, values, and reasons for caring. If a team tries to serve everyone, it may design something that feels average to all and essential to no one.',
      'A Target Audience is a specific group of people the entrepreneur wants to understand and serve. The group should be clear enough that the team can find them, ask questions, observe routines, and make decisions. “Students” is broad. “Seventh and eighth graders who stay after school for clubs and need a quick snack before pickup” is much more useful.',
      'Three types of details help define the audience. Demographics describe measurable traits such as age, grade, family role, or income range. Geographics describe where people live, study, shop, or move through the day. Psychographics describe interests, values, attitudes, motivations, and habits. Psychographics are especially important because people with the same age or grade may still make very different choices.',
      'A Customer Persona is a realistic profile that represents a segment of the target audience. The textbook’s example, Tech-Savvy Taylor, is a 13-year-old 8th grader who enjoys mobile gaming, short-form video, and personalized gear. A persona helps the team imagine decisions through the customer’s eyes, but it is still a hypothesis. It must be tested through research.',
      'The entrepreneurial mindset here is empathy plus discipline. Empathy helps students care about the customer’s real life. Discipline prevents them from inventing details just because they sound convenient. A persona should be updated when interviews or surveys reveal new evidence.',
      'Once the audience is clear, many business decisions become easier. Product features can match the customer’s routine. Price can reflect the customer’s budget and alternatives. Promotion can appear where the customer already pays attention. Place can match when and where the customer is ready to act.',
    ],
    keyIdea: 'A clear Target Audience and tested Customer Persona help entrepreneurs make better decisions about product, price, place, and promotion.',
    mindsetPractice: [
      'Empathy: Build a persona from actual observations, not stereotypes.',
      'Discipline: Mark each persona detail as evidence, assumption, or unknown.',
      'Customer focus: Use the persona to decide what feature should be removed, not only what to add.',
    ],
    caseStudy: {
      name: 'The School Snack Cart Pivot',
      subtitle: 'The original customer assumption',
      body: [
        'A group of seventh graders planned a healthy snack cart built around organic dried kale chips. Their first customer assumption was simple: classmates would want a healthy snack option. That assumption sounded reasonable, but it was still untested. The team needed to learn whether students wanted that specific snack, at that price, during that part of the school day.',
        'By focusing on actual classmates rather than an imaginary “everyone,” the team began to see the difference between a broad idea and a target audience. Some students cared about health, some cared about taste, some cared about price, and some cared about speed. These differences affected whether the snack cart would work.',
        'The case shows why entrepreneurs should define the customer before buying inventory. The clearer the audience, the easier it becomes to ask useful questions and avoid expensive assumptions.',
      ],
      questions: [
        'Who was the snack cart’s first Target Audience?',
        'Which demographics, geographics, and psychographics would help the team understand that audience?',
        'Why is a persona a starting hypothesis rather than proof?',
      ],
    },
  },
  {
    id: 'p3-2',
    chapterId: 'ch3',
    title: 'Reading 3.B — Research, Competition & Evidence',
    minutes: 10,
    bigQuestion: 'What evidence should change an entrepreneur’s plan?',
    paragraphs: [
      'Entrepreneurs reduce uncertainty through research. Primary Research creates new information directly from potential customers. It can include interviews, surveys, observations, focus groups, sign-up lists, taste tests, prototype tests, or short experiments. Primary research is powerful because it comes from the actual people the venture hopes to serve.',
      'Secondary Research uses information that already exists: articles, reports, public data, competitor websites, reviews, social media patterns, or school/community information. Secondary research can reveal trends and context, but it should be checked carefully. A national trend may not match one school community. A source from five years ago may not reflect current behavior.',
      'Good research questions are specific, neutral, and connected to decisions. “Do you like my awesome idea?” is weak because it pushes the respondent toward praise. “Which snack would you actually buy after school for $2?” is stronger because it asks about behavior, context, and price. Interviews can uncover reasons; surveys can show patterns; observations can reveal what people actually do.',
      'Competition includes more than businesses with the same product. Direct Competitors offer similar products to the same customer. Indirect Competitors solve the same underlying need in a different way. A school snack cart competes directly with other snack sellers, but indirectly with packed snacks, vending machines, waiting until home, or choosing not to eat.',
      'A Competitive Matrix helps teams compare alternatives on factors customers care about: price, convenience, quality, speed, customization, health, access, or trust. The purpose is not to copy competitors. The purpose is to understand the choices customers already have and identify a meaningful difference.',
      'The entrepreneurial mindset requires intellectual honesty. If research disproves the original idea, the founder should not hide the result. Evidence is not an insult; it is a gift that saves time and money. A pivot is a disciplined change based on learning.',
    ],
    keyIdea: 'Strong entrepreneurs combine Primary Research, Secondary Research, and competitor analysis, then let evidence guide whether to continue, improve, or pivot.',
    mindsetPractice: [
      'Curiosity: Ask one interview question that begins with “Tell me about the last time…”.',
      'Integrity: Name one piece of evidence that would change your mind.',
      'Resilience: Treat a pivot as progress, not embarrassment.',
    ],
    caseStudy: {
      name: 'The School Snack Cart Pivot',
      subtitle: 'Free samples and surveys change the plan',
      body: [
        'The snack cart team tested organic dried kale chips before purchasing a large supply. Free samples and short surveys showed that most classmates did not enjoy the taste enough to buy them regularly. Many students preferred baked apple crisps and fruit smoothies. The evidence challenged the original plan, but it arrived early enough for the team to adapt.',
        'The team’s pivot was an example of resilience and customer focus. They did not simply abandon entrepreneurship because the first idea was unpopular. They used the feedback to revise the offering. The better question became, “How can we provide a healthier snack students actually want?” rather than, “How can we force students to like kale chips?”',
        'Because the team tested before spending heavily, it protected its budget and learned more about customer preferences. That is the value of research: it turns uncertainty into smarter action.',
      ],
      questions: [
        'Which Primary Research methods did the team use?',
        'What evidence caused the pivot?',
        'How did the pivot show entrepreneurial resilience rather than failure?',
      ],
    },
  },
  {
    id: 'p4-1',
    chapterId: 'ch4',
    title: 'Reading 4.A — Goods, Services & Bootstrapping',
    minutes: 9,
    bigQuestion: 'How can an entrepreneur begin with resources already available?',
    paragraphs: [
      'Entrepreneurial offerings usually include Goods, Services, or a combination of both. Goods are tangible items customers can hold, use, store, or consume. Services are actions, skills, or experiences performed for a customer. A custom sticker business sells a good. A tutoring business sells a service. A birthday party photography package might combine a service with digital photo goods.',
      'Knowing the difference helps an entrepreneur plan. Goods often require materials, inventory, packaging, storage, and quality control. Services often require scheduling, communication, preparation, and consistent delivery. Both can create value, and both can fail if the entrepreneur misunderstands the customer need.',
      'Bootstrapping means beginning with resources already available instead of waiting for large funding. Student entrepreneurs can bootstrap with free design tools, borrowed equipment with permission, recycled materials, personal skills, school spaces, family knowledge, or a very small first batch. Bootstrapping is not about being cheap; it is about learning before spending too much.',
      'The entrepreneurial mindset behind bootstrapping is resourcefulness. A resourceful founder asks, “What can I test with what I already have?” A service can begin with a script and one pilot customer. A product can begin with a hand-built prototype. A digital idea can begin with a paper mockup. These first versions are not final products; they are learning tools.',
      'Bootstrapping also protects the entrepreneur from confusing motion with progress. Buying supplies can feel productive, but it may only create risk if the need is unvalidated. The better sequence is to identify the assumption, choose the smallest test, learn from users, and then decide what resources are worth adding.',
      'Before building, classify the offering as a Good, Service, or hybrid. Then list materials, skills, permissions, time, and people required. Finally, choose a first test that is safe, ethical, and small enough to complete quickly.',
    ],
    keyIdea: 'Bootstrapping uses available resources to test a Good or Service before committing time, money, or inventory that may not be needed.',
    mindsetPractice: [
      'Resourcefulness: List five resources you can use with permission before buying anything.',
      'Calculated risk: Identify the biggest cost you can delay until after validation.',
      'Initiative: Offer one small pilot version to a real or representative user.',
    ],
    caseStudy: {
      name: 'Zappos',
      subtitle: 'Testing online shoe demand without a warehouse',
      body: [
        'The early Zappos test explored whether customers would buy shoes online before the company invested in a giant inventory system. Instead of purchasing warehouses full of shoes first, the founder photographed shoes from local stores and used those stores to fulfill early orders. The test focused on the riskiest assumption: would people trust and use an online shoe-buying experience?',
        'This approach reduced risk. If customers had shown no interest, the founder would have learned that lesson without owning piles of unsold inventory. If customers responded positively, the evidence would justify the next investment. Bootstrapping made the learning faster and less expensive.',
        'For students, the lesson is clear: do not build the biggest version first. Build the smallest version that can test whether the customer behavior you need is likely to happen.',
      ],
      questions: [
        'Which resource did the founder avoid purchasing at the beginning?',
        'What key customer assumption did this early test examine?',
        'How could a student venture copy this logic without copying the shoe idea?',
      ],
    },
  },
  {
    id: 'p4-2',
    chapterId: 'ch4',
    title: 'Reading 4.B — MVPs & the Iterative Cycle',
    minutes: 10,
    bigQuestion: 'What is the smallest version that can test the most important assumption?',
    paragraphs: [
      'A Minimum Viable Product, or MVP, is the smallest version of a solution that can produce useful learning from real or representative users. It is not a low-quality final product. It is not an excuse to ignore safety or respect. It is a focused experiment designed to answer one important question.',
      'Different ideas require different MVPs. A physical product might begin as a cardboard model, sample batch, or 3D sketch. A service might begin as a one-page menu and a practice appointment. An app might begin as paper screens that a user taps through with their finger. A marketplace might begin with the founder manually matching buyers and sellers. The form matters less than the learning.',
      'The iterative cycle is Build, Test, Learn, Repeat. Build means creating a version concrete enough for someone to react to. Test means putting it in front of users and observing behavior. Learn means identifying what the evidence says. Repeat means improving or changing the next version based on that evidence.',
      'Feedback is most useful when it is connected to behavior. “I like it” feels positive, but it may not predict whether someone will use or buy the solution. Stronger evidence includes a customer signing up, choosing one version over another, completing a task faster, paying for a sample, or explaining the value clearly to someone else.',
      'Iteration requires humility. The entrepreneur must be willing to discover that a feature is confusing, a price is too high, or a message is unclear. This does not mean the entrepreneur failed. It means the prototype did its job: it revealed what to improve before the stakes became larger.',
      'A good MVP plan names the assumption, the test, the success signal, and the next decision. For example: “We believe students will pay $2 for a healthy smoothie after school. We will offer 20 samples and ask who would buy a full size Friday. If at least 12 students commit, we will price ingredients for a first sale.”',
    ],
    keyIdea: 'An MVP tests one important assumption; Iteration turns observed behavior and Feedback into a better next version.',
    mindsetPractice: [
      'Humility: Ask users what confused them before asking what they liked.',
      'Evidence: Define the success signal before running the test.',
      'Resilience: Use one disappointing result to plan the next iteration.',
    ],
    caseStudy: {
      name: 'Dropbox',
      subtitle: 'A demonstration video as an MVP',
      body: [
        'Dropbox used a demonstration video to show how the product would work before the full system was complete. The video helped potential users understand the experience and allowed the team to measure interest. A video could count as an MVP because the key assumption was not whether the software was already polished; the key assumption was whether people wanted the promised solution.',
        'The response gave the team evidence about demand. If viewers signed up, shared the video, or asked for access, the team had stronger reason to keep building. If no one cared, the team could rethink the problem or message before investing more development time.',
        'This case reminds student entrepreneurs that an MVP should match the question. Sometimes the smallest useful test is a prototype. Sometimes it is a demo, landing page, sample, script, or role-play.',
      ],
      questions: [
        'Why could a video count as an MVP in this case?',
        'What evidence would show meaningful customer interest?',
        'What is one MVP your team could build without creating the full final solution?',
      ],
    },
  },
  {
    id: 'p5-1',
    chapterId: 'ch5',
    title: 'Reading 5.A — Costs, Revenue & Profit',
    minutes: 10,
    bigQuestion: 'How can a business tell whether it is actually making money?',
    paragraphs: [
      'A venture can be exciting, useful, and popular but still lose money if the entrepreneur does not understand the numbers. Financial thinking is part of the entrepreneurial mindset because it helps founders make responsible decisions. Money is not the only measure of value, but a business must know whether it can cover its costs.',
      'Startup Costs are expenses needed to begin, such as tools, first equipment, signs, website setup, safety supplies, or initial materials. Ongoing expenses happen as the venture continues. Fixed Costs usually stay the same over a period, such as a booth fee or monthly software subscription. Variable Costs change with each unit sold or service delivered, such as packaging, ingredients, fuel, or transaction fees.',
      'Revenue is the money collected from sales before expenses are subtracted. Profit is what remains after costs are subtracted. Total Revenue equals Price multiplied by Units Sold. Total Costs include fixed costs plus variable costs. Profit equals Revenue minus Total Costs. These formulas help entrepreneurs separate “we sold a lot” from “we earned money.”',
      'Unit Contribution is especially useful. It equals Selling Price minus Variable Cost per Unit. If a bracelet sells for $6 and the materials plus packaging cost $2 per bracelet, the unit contribution is $4. That $4 helps cover fixed or startup costs and then contributes to profit after those costs are recovered.',
      'Entrepreneurs also need to track non-obvious costs. Time, delivery, wasted materials, returned products, extra supplies, and payment fees can change the real profit. A student who sells 30 items but forgets to count packaging may overestimate success. Careful recordkeeping is a sign of professionalism.',
      'Financial calculations support ethical decisions too. If a business cannot cover costs at a fair price, the entrepreneur may need to redesign the product, reduce waste, change suppliers, adjust the audience, or choose a different model. Guessing is risky; calculating gives the founder choices.',
    ],
    keyIdea: 'Entrepreneurs classify costs, calculate revenue, subtract total costs, and use Unit Contribution to understand whether the venture can work.',
    mindsetPractice: [
      'Responsibility: Track every cost, even small ones that are easy to ignore.',
      'Analysis: Explain the difference between high revenue and high profit.',
      'Problem solving: Name one way to improve profit without lowering quality or misleading customers.',
    ],
    caseStudy: {
      name: "Alex's Lawn Care",
      subtitle: 'Startup and Variable Costs',
      body: [
        'Alex starts a lawn care service with $120 for a used lawn mower and $15 for safety goggles and gloves. Those $135 are Startup Costs because they are needed before the service can operate. Each lawn also uses about $3 in gasoline and $1 in lawn bags, making the Variable Cost $4 per lawn.',
        'Alex charges $25 per lawn. The Unit Contribution is $25 minus $4, or $21 per lawn before considering other expenses. If Alex mows four lawns, revenue is $100, but profit is not $100 because variable costs and startup costs still matter. The numbers help Alex understand how many jobs are needed before the venture truly pays back the initial investment.',
        'The case also shows why safety and professionalism are part of entrepreneurship. Goggles, gloves, reliability, and clear communication all support value. Cutting important costs may create risk or reduce trust.',
      ],
      questions: [
        'Which of Alex’s costs are Startup, Fixed, or Variable?',
        'What is Alex’s Revenue after mowing four lawns, and why is it not the same as Profit?',
        'What non-obvious costs or responsibilities might Alex need to track next?',
      ],
    },
  },
  {
    id: 'p5-2',
    chapterId: 'ch5',
    title: 'Reading 5.B — Pricing & Break-Even',
    minutes: 10,
    bigQuestion: 'How do price and Unit Contribution determine Break-Even?',
    paragraphs: [
      'Pricing is one of the most important decisions an entrepreneur makes because it affects customers, costs, brand perception, and profit. A price that is too high may push customers toward alternatives. A price that is too low may make the business unsustainable or signal lower quality. Entrepreneurs use evidence, not guesses, to choose a responsible price.',
      'Cost-Plus Pricing starts with the cost of producing or delivering the offering and adds a planned markup. This method helps make sure the price covers known costs, but it does not automatically prove that customers will pay. Competitive Pricing compares similar alternatives. This is useful only when the comparison is fair: same audience, similar quality, similar convenience, and similar value.',
      'Value-Based Pricing considers the value customers believe they receive. A convenient service during a stressful moment may be worth more than the same service at an easy time. A personalized product may be worth more to a customer who cares about identity and uniqueness. Value-based thinking requires empathy and research because value is defined by the customer, not by the founder alone.',
      'Break-Even Point is where Total Revenue equals Total Costs. A useful formula is Fixed Costs divided by Unit Contribution. If fixed or startup costs are $135 and unit contribution is $21, the break-even point is 6.43 sales. Because a business cannot usually sell part of a lawn service or part of a bracelet, the entrepreneur rounds up to the next whole sale.',
      'Break-even is not the finish line; it is the point where the venture has recovered its costs. Profit begins after break-even. Entrepreneurs should also run “what if” scenarios: What if material costs rise? What if the team sells fewer units than expected? What if customers will only pay a lower price? These questions help founders prepare rather than panic.',
      'The entrepreneurial mindset connects numbers to decisions. If break-even is too high, the founder can reduce fixed costs, lower variable costs responsibly, increase price with added value, choose a better audience, or simplify the first version. The numbers do not make the decision alone, but they reveal the trade-offs.',
    ],
    keyIdea: 'Use cost-plus, competitive, and value-based pricing together, then divide Fixed Costs by Unit Contribution to estimate Break-Even.',
    mindsetPractice: [
      'Calculated risk: Run one best-case, realistic-case, and hard-case break-even scenario.',
      'Empathy: Ask what customers believe the offer is worth and why.',
      'Adaptability: Identify one change that would improve unit contribution without reducing trust.',
    ],
    caseStudy: {
      name: "Alex's Lawn Care",
      subtitle: 'Seven lawns to break even',
      body: [
        'Alex has $135 in Startup Costs and earns $21 in Unit Contribution per lawn. Dividing $135 by $21 gives about 6.43 lawns. Alex must round up to seven lawns because completing only part of a lawn does not fully recover the startup costs. After the seventh lawn, the original startup investment has been covered.',
        'If Alex lowers the price to $22 while variable cost stays at $4, unit contribution drops to $18 and break-even rises to 7.5, which rounds up to eight lawns. If gasoline rises and variable cost becomes $6 while price remains $25, unit contribution becomes $19 and break-even also changes. Price and cost decisions are connected.',
        'This case shows why entrepreneurs should revisit calculations as conditions change. A plan that works in week one may need adjustment after feedback, competition, or supply costs shift.',
      ],
      questions: [
        'Why must Alex round the Break-Even result up?',
        'What happens to Break-Even if Alex lowers price or Variable Cost increases?',
        'Which pricing lens would help Alex compare nearby lawn services?',
      ],
    },
  },
  {
    id: 'p6-1',
    chapterId: 'ch6',
    title: 'Reading 6.A — The 4 Ps, Brand & Ethical Marketing',
    minutes: 10,
    bigQuestion: 'How do customers understand, trust, and recognize a venture?',
    paragraphs: [
      'Marketing is how entrepreneurs help the right customers understand the value of an offering. It is not just advertising, decoration, or trying to persuade anyone at any cost. Responsible marketing connects a real solution with the people it can genuinely help.',
      'The 4 Ps organize marketing decisions. Product is what the customer receives and the problem it solves. Price is what the customer pays and how that price feels compared with alternatives. Place is where and how the customer can access the offer. Promotion is how the entrepreneur communicates the value. If one P is weak, the others may not be enough.',
      'Brand Identity is the consistent impression a venture creates through name, logo, colors, tagline, tone, behavior, and customer experience. A brand is not only what the founder says; it is what customers come to expect. A tutoring service with a calm, reliable brand should communicate differently than a playful custom sticker company.',
      'Brand Voice is the personality of the venture’s communication. It can be friendly, expert, bold, caring, energetic, or simple. The voice should match the target audience and the promise being made. A safety-focused product should avoid careless jokes. A youth fashion brand may use more expressive language while still being honest.',
      'Ethical marketing matters. Entrepreneurs should not exaggerate results, hide important information, use images or music without permission, pressure customers unfairly, or collect personal information casually. Trust is a long-term asset. Losing trust can damage a venture faster than a weak poster or imperfect logo.',
      'Marketing Channels should be selected based on where the target audience actually pays attention and what the school or community allows. For student ventures, channels may include approved flyers, announcements, demonstrations, word of mouth, class presentations, or supervised digital tools. The best channel is not the loudest; it is the one that reaches the right people clearly and respectfully.',
    ],
    keyIdea: 'The 4 Ps, Brand Identity, Brand Voice, and ethical Marketing Channels help customers understand value and decide whether to trust the venture.',
    mindsetPractice: [
      'Integrity: Check every claim in your promotion for honesty and evidence.',
      'Customer focus: Choose one channel because your audience uses it, not because you personally like it.',
      'Consistency: Match your name, visuals, voice, and promise so they feel like one venture.',
    ],
    caseStudy: {
      name: 'Brand Matrix',
      subtitle: 'A textbook application case',
      body: [
        'The textbook asks students to create a name, one-line promise, visual direction, and three words that describe the venture’s Brand Voice. This exercise matters because customers make quick judgments. A confusing name, unclear promise, or mismatched tone can make a good idea harder to trust.',
        'A classmate then explains the impression those choices create. This feedback helps the founder see whether the intended brand matches the audience’s actual reaction. If the founder wants the brand to feel reliable but classmates describe it as silly, the identity needs revision.',
        'The Brand Matrix also connects to ethical marketing. A strong brand promise should be specific enough to believe and honest enough to keep. Entrepreneurs should communicate value without making claims they cannot support.',
      ],
      questions: [
        'How should the venture’s Product affect its Brand Voice?',
        'Which Marketing Channel best fits the Target Audience and why?',
        'Why must a brand promise be specific, honest, and believable?',
      ],
    },
  },
  {
    id: 'p6-2',
    chapterId: 'ch6',
    title: 'Reading 6.B — Storytelling, Pitching & Q&A',
    minutes: 10,
    bigQuestion: 'How can a short pitch make the problem, evidence, and next step clear?',
    paragraphs: [
      'A pitch is a short, persuasive explanation of a venture’s value. It is not a memorized commercial with every detail squeezed in. A strong pitch helps the audience understand the problem, care about the customer, believe the solution has evidence behind it, and know what action is needed next.',
      'The LaunchPad structure uses Hook, Problem, Solution, and Call to Action. The Hook earns attention with a question, surprising observation, brief story, or clear statement. The Problem explains who is affected and why current options fall short. The Solution explains the offering and how it creates value. The Call to Action names the specific next step: feedback, permission, a pilot customer, supplies, a small budget, or a decision.',
      'Evidence makes a pitch credible. Evidence may include interview patterns, survey results, prototype feedback, cost calculations, competitor comparisons, or a successful small test. Without evidence, the pitch depends mostly on enthusiasm. Enthusiasm helps, but evidence gives the audience a reason to believe the entrepreneur has done the work.',
      'A Pitch Deck should support the speaker rather than replace the speaker. Each slide should have one main idea, a readable visual, and limited text. Too many words force the audience to choose between reading and listening. The entrepreneur’s job is to guide the story clearly.',
      'Delivery is also part of entrepreneurship. Eye contact, pace, posture, volume, and transitions affect whether the audience can follow the idea. Practice should include timing, but it should also include clarity. A 60-second pitch that rushes every word may be less effective than a focused pitch that leaves out unnecessary details.',
      'Q&A tests mindset. When a question is difficult, the entrepreneur should not pretend to know everything. Acknowledge plus Action works well: thank the questioner, answer what you can, identify what you still need to learn, and explain the next test or research step. This response shows honesty, resilience, and a willingness to improve.',
    ],
    keyIdea: 'A strong pitch connects Hook, Problem, Solution, evidence, and a clear Call to Action, then handles Q&A with honesty and next-step thinking.',
    mindsetPractice: [
      'Confidence: Practice until your pitch sounds clear, not robotic.',
      'Evidence: Include at least one fact from customer research or testing.',
      'Resilience: Prepare one Acknowledge plus Action response for a tough question.',
    ],
    caseStudy: {
      name: 'LaunchPad Pitch Competition',
      subtitle: 'The textbook’s final chapter challenge',
      body: [
        'The textbook asks students to write a 60-second pitch using Hook, Problem, Solution, and Call to Action, then practice with a timer and present to a partner or the class. The goal is not only public speaking. The goal is to communicate an entrepreneurial journey: what problem was noticed, what evidence was gathered, what solution was tested, and what support is needed next.',
        'The review checklist asks whether the audience can explain the problem and solution, whether customer evidence is included, whether delivery is practiced, and whether the pitch ends with a clear next step. Peer feedback should focus on clarity, evidence, and one suggestion for the next version.',
        'This final challenge brings the entrepreneurial mindset together. Students show curiosity through the problem they studied, empathy through customer understanding, resourcefulness through their prototype or plan, financial thinking through costs and pricing, and resilience through revision after feedback.',
      ],
      questions: [
        'What makes a Hook connect directly to the problem?',
        'Which customer evidence makes the solution more credible?',
        'What specific Call to Action will end your pitch?',
      ],
    },
  },
];

export const PAGES_BY_CHAPTER: Record<string, TextbookPage[]> = TEXTBOOK_PAGES.reduce(
  (acc, page) => {
    (acc[page.chapterId] ||= []).push(page);
    return acc;
  },
  {} as Record<string, TextbookPage[]>,
);
