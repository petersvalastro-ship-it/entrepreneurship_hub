// LaunchPad Digital Textbook content, adapted from the LaunchPad Middle School
// Entrepreneurship Student Textbook (chapters 1-6 plus reference sections).

export type LaunchpadSection = {
  id: string;
  label: string;
  title: string;
  reading: string[];
  activity?: { heading: string; body: string };
  check?: string;
  caseStudies?: { name: string; body: string }[];
  takeaway?: string;
};

export type LaunchpadChapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  color: string;
  vocab: { term: string; def: string }[];
  sections: LaunchpadSection[];
};

export const VENTURE_CYCLE = [
  'Notice',
  'Understand',
  'Define',
  'Imagine',
  'Model',
  'Test',
  'Improve',
  'Explain',
];

export const LAUNCHPAD_CHAPTERS: LaunchpadChapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'The Entrepreneurial Mindset & Opportunity Recognition',
    summary:
      'Learn to see everyday friction as opportunity, and turn "someone should fix that" into evidence-based action.',
    color: '#C51C63',
    vocab: [
      { term: 'Entrepreneur', def: 'A person who identifies a problem, creates a solution, and takes action to deliver value.' },
      { term: 'Innovation', def: 'A new or improved idea, product, service, or method.' },
      { term: 'Value Creation', def: 'Making something useful, helpful, enjoyable, or worth paying for.' },
      { term: 'Entrepreneurial Mindset', def: 'A way of thinking that looks for opportunities, learns from mistakes, and takes initiative.' },
      { term: 'Friction Point', def: 'A daily annoyance, inconvenience, delay, or bottleneck.' },
      { term: 'Root Cause Analysis', def: 'A strategy for finding the underlying reason behind a problem.' },
      { term: '5 Whys Method', def: 'Asking "Why?" repeatedly to move from a symptom toward a root cause.' },
      { term: 'How Might We (HMW)', def: 'A question that reframes a problem as an open design challenge.' },
      { term: 'Need Validation', def: 'Using interviews, surveys, observations, or tests to gather evidence before building.' },
    ],
    sections: [
      {
        id: 'ch1-1',
        label: '1.1',
        title: 'What Is Entrepreneurship?',
        reading: [
          'Have you ever seen a problem at school and thought, "Someone should really fix that"? That reaction is a useful starting point. Entrepreneurship is not limited to large companies or adults with large budgets. It is a way of seeing everyday situations as opportunities to create value.',
          'An entrepreneur notices a problem, learns who experiences it, explores possible solutions, and takes action. The action may begin with a sketch, a service, a handmade prototype, a survey, or a simple digital mockup. The key is that the idea moves from thought to evidence.',
        ],
        activity: {
          heading: 'Activity: School Friction Scavenger Hunt',
          body: 'With a partner, observe the school environment for ten minutes. Record three physical or operational friction points. Write what you actually saw instead of guessing why it happened.',
        },
        check: 'What is the difference between a complaint and an opportunity? Why can friction be useful information? Give one example of value creation.',
      },
      {
        id: 'ch1-2',
        label: '1.2',
        title: 'Characteristics of Successful Entrepreneurs',
        reading: [
          'Four characteristics show up again and again: curiosity, resilience and grit, creative problem solving, and calculated risk-taking. Curiosity pushes an entrepreneur to ask "Why?" and "What if?" Empathy keeps the focus on people rather than on a favorite idea. Resilience matters because the first attempt may not work.',
          'Technical skills - coding, accounting, design, sales, and presentation - matter, but the entrepreneurial mindset affects how those skills are used. The goal is not to avoid mistakes. It is to turn results into learning. A failed prototype can reveal which material, message, feature, or process needs to change.',
        ],
        activity: {
          heading: 'Activity: Reframe the Question',
          body: 'Write one example of a school task where you usually seek the first answer. Rewrite it as an entrepreneurial question that invites alternatives.',
        },
        check: 'Explain the difference between a skillset and a mindset. Then describe how failure can become data.',
      },
      {
        id: 'ch1-3',
        label: '1.3',
        title: 'Real-World Spotlight: Young Trailblazers',
        reading: [],
        caseStudies: [
          {
            name: "Moziah Bridges - Mo's Bows",
            body: 'At age 9, Moziah Bridges wanted stylish bow ties that fit his personality. He learned to sew with help from his grandmother and used scrap fabrics. He started with a small product, sold locally, and expanded as people showed interest.',
          },
          {
            name: 'Mikaila Ulmer - Me & the Bees',
            body: 'Mikaila Ulmer became curious about honeybees after personal experiences with bee stings. She combined that curiosity with a family lemonade recipe and local honey. A youth entrepreneurship opportunity gave her a reason to test the idea, and the venture grew from a small start.',
          },
        ],
        takeaway:
          'Both stories begin with something concrete: a personal frustration, interest, or observation. Neither required a giant factory on day one. Entrepreneurs can begin with accessible materials and learn their way forward.',
        check: 'Which concrete observation started each venture, and what did each founder use that was already available to them?',
      },
      {
        id: 'ch1-4',
        label: '1.4',
        title: 'Identifying Your Strengths, Passions & Problems',
        reading: [
          'A strong starting point often sits at the intersection of what you enjoy, what you can do well, and what people need. This does not mean your first idea must be perfect. It means your interests and abilities can help you notice problems that matter to you.',
          'Tool: How Might We...? "How" assumes a solution is possible. "Might" gives permission to explore. "We" keeps the question collaborative. Instead of "The lunch line is terrible," ask, "How might we make lunch pickup faster for students?"',
        ],
        activity: {
          heading: 'Self-Assessment',
          body: '1. What activities make you lose track of time? 2. What do people ask you to help with? 3. What school or community issue bugs you repeatedly? 4. Which of your answers connects with a real need?',
        },
        check: 'Write one HMW question and identify the customer group connected to it.',
      },
      {
        id: 'ch1-5',
        label: '1.5',
        title: "The 8th Grade Mindset: From 'I Notice' to 'I Can'",
        reading: [
          'The middle-school entrepreneur is not waiting for a future title. The mindset shift is from passive observation to small, self-directed action. Four habits matter: failure as data, DIY initiative, empathy first, and seeing friction as opportunity.',
          'Need validation means gathering real evidence before spending time or money building. Start with open questions such as: "Walk me through how you handle your morning routine" and "What is the most frustrating part about organizing your backpack?" Capture exact phrases and observable behaviors. Avoid questions that pressure people to agree with your idea.',
        ],
        check: 'Why is "Would you buy my cool new backpack organizer?" weaker than a question about current behavior?',
      },
      {
        id: 'ch1-6',
        label: '1.6',
        title: 'Chapter 1 Review & Hands-On Challenge',
        reading: [
          'Review: 1. Define entrepreneurial mindset. 2. Give one friction point. 3. Use the 5 Whys method on a school problem. 4. Write an HMW question. 5. Explain why validation comes before a major build.',
        ],
        activity: {
          heading: 'Hands-On Challenge: The Bug List',
          body: 'For 48 hours, record at least ten annoyances, delays, or inconveniences. Choose your top two and write two possible solutions for each. Then write one piece of evidence you would want before building.',
        },
        check: 'Which problem on your list became more interesting after you asked "Why?"',
      },
    ],
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Identifying Opportunities, Root Causes & Solving Problems',
    summary:
      'Separate needs from wants, observe pain points carefully, and generate many solution directions before choosing one.',
    color: '#E94928',
    vocab: [
      { term: 'Need', def: 'Something required for basic safety, functioning, or well-being.' },
      { term: 'Want', def: 'Something desired for comfort, entertainment, status, convenience, or enjoyment.' },
      { term: 'Pain Point', def: 'A specific problem that creates cost, effort, delay, or frustration.' },
      { term: 'Observation', def: 'Carefully noticing what people do in a real setting.' },
      { term: 'SCAMPER', def: 'A creativity framework: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse/Rearrange.' },
    ],
    sections: [
      {
        id: 'ch2-1',
        label: '2.1',
        title: 'Needs vs. Wants in the Marketplace',
        reading: [
          'Every purchase reflects some combination of practical need, personal preference, convenience, identity, emotion, or enjoyment. Needs are connected to basic functioning and safety. Wants can make life easier, more enjoyable, more expressive, or more comfortable.',
          'A basic winter coat and a designer bomber jacket can both be valuable products, but they serve different motivations. Entrepreneurs should understand which motivation matters to the customer rather than assuming every buyer values the same feature.',
        ],
        activity: {
          heading: 'Classroom Activity',
          body: 'Choose five products you see at school. Label each primarily as a need or want, then explain the motivation behind the purchase. Discuss how one item can feel like a need to one person and a want to another.',
        },
        check: 'Why can a business successfully sell both needs and wants? What changes in the way the offering is explained?',
      },
      {
        id: 'ch2-2',
        label: '2.2',
        title: 'The Art of Observation: Spotting Pain Points',
        reading: [
          'Entrepreneurs behave like careful observers. They watch routines, notice bottlenecks, and ask what people do when the system is inconvenient. A pain point can be financial, related to time or convenience, caused by a frustrating process, or connected to quality.',
          'Suppose students lose school IDs because the plastic clips break. The visible problem is "students lose IDs." Observation adds detail: the clip fails, replacement takes time, and the same problem repeats. That pattern helps define a more useful opportunity.',
        ],
        activity: {
          heading: 'Activity: Friction Reframing Table',
          body: 'Observed friction: lost gym clothes. Root cause hypothesis: no easy organization system. Opportunity frame: "How might we organize gym lockers for middle school students?"',
        },
        check: 'What is the difference between observing a symptom and identifying a root cause?',
      },
      {
        id: 'ch2-3',
        label: '2.3',
        title: 'Brainstorming & Ideation Frameworks',
        reading: [
          'Great ideas are rarely produced by waiting for inspiration. SCAMPER gives you a repeatable set of moves. Substitute changes a material or step. Combine joins two functions. Adapt transfers an idea. Modify changes a property. Put to another use repurposes something. Eliminate simplifies. Reverse or rearrange changes the sequence.',
          'A plain shoe box can become a desk organizer by eliminating unused empty space, combining storage with charging, modifying the openings, and rearranging the way items are accessed.',
        ],
        activity: {
          heading: 'Classroom Activity',
          body: 'Pick one ordinary object. Apply at least three SCAMPER moves. Sketch your changes and label the customer problem each change is designed to address.',
        },
        check: 'Why is generating multiple directions useful before choosing one idea?',
      },
      {
        id: 'ch2-4',
        label: '2.4',
        title: 'Real-World Spotlight: Solved by Simplicity',
        reading: [],
        caseStudies: [
          {
            name: 'Chester Greenwood',
            body: 'Chester Greenwood solved a winter comfort problem by combining bent wire with soft materials to create earmuffs. The lesson is not the complexity of the invention; it is the fit between a specific problem and a practical solution.',
          },
          {
            name: 'Kavita Shukla - FreshPaper',
            body: 'Kavita Shukla connected an observation about spices with the problem of produce spoilage. Her experiments led to spice-infused paper designed to keep food fresh longer.',
          },
          {
            name: 'Shubham Banerjee - Braigo',
            body: 'Shubham Banerjee responded to the high cost of standard Braille printers by building an early prototype with a LEGO robotics kit and everyday materials.',
          },
        ],
        takeaway:
          'Across all three stories, curiosity turns into experimentation. The founders use what they can access, test an idea, and focus on a real pain point.',
        check: 'What did each founder know at the beginning? What did they still need to learn? Which part of the solution could be tested cheaply?',
      },
      {
        id: 'ch2-5',
        label: '2.5',
        title: 'Chapter 2 Review & Hands-On Challenge',
        reading: [
          'Critical thinking: 1. Is a smartphone a need or a want for a middle school student today? Explain. 2. Which SCAMPER move would you use on a product that frustrates you? Why?',
        ],
        activity: {
          heading: 'Hands-On Challenge: SCAMPER Transformation Studio',
          body: 'Choose a cardboard shoe box or another ordinary object. Select three SCAMPER moves. Redesign the object for middle school students. Draw, label, and explain the pain point. Then give a two-minute explanation: problem, SCAMPER changes, target user, and expected benefit.',
        },
        check: 'Which SCAMPER move produced the most surprising idea?',
      },
    ],
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Market Research & Knowing Your Customer',
    summary:
      'Define a real target audience, gather primary and secondary evidence, and compare the alternatives customers already have.',
    color: '#EFA835',
    vocab: [
      { term: 'Target Audience', def: 'The specific group most likely to use or buy an offering.' },
      { term: 'Customer Persona', def: 'A realistic profile representing a target customer.' },
      { term: 'Demographics', def: 'Basic characteristics such as age, grade, or income range.' },
      { term: 'Geographics', def: 'Location-based characteristics such as school, neighborhood, or city.' },
      { term: 'Psychographics', def: 'Interests, values, habits, motivations, and lifestyle patterns.' },
      { term: 'Primary Research', def: 'New information you collect yourself.' },
      { term: 'Secondary Research', def: 'Information already collected by others.' },
      { term: 'Direct Competitor', def: 'A business offering a similar product or service to the same customer.' },
      { term: 'Indirect Competitor', def: 'A different offering that solves the same underlying need.' },
      { term: 'Competitive Matrix', def: 'A table used to compare alternatives on selected factors.' },
    ],
    sections: [
      {
        id: 'ch3-1',
        label: '3.1',
        title: 'Defining Your Target Audience',
        reading: [
          'A common beginner mistake is saying, "My product is for everybody." Different people have different habits, budgets, schedules, and preferences. A target audience is specific enough that you can describe the people you want to understand and serve.',
          'Three layers help: demographics (age, grade level, income range), geographics (school, neighborhood, city, climate), and psychographics (hobbies, values, motivations, habits).',
          'Example persona: Tech-Savvy Taylor is a 13-year-old 8th grader who enjoys mobile gaming, short-form video, and personalized gear. A persona is a working model, not proof. Research is still needed.',
        ],
        check: 'How does a persona help a team make more specific design decisions?',
      },
      {
        id: 'ch3-2',
        label: '3.2',
        title: 'Primary vs. Secondary Market Research',
        reading: [
          'Before spending money on a product, entrepreneurs need facts. Primary research creates new information directly from potential customers: surveys, interviews, observations, focus groups, and product tests. A small interview can uncover details that a multiple-choice survey may miss.',
          'Secondary research uses information that already exists: articles, reports, public data, competitor websites, and existing reviews. Secondary sources are useful, but they should still be checked for date, relevance, and fit.',
        ],
        check: 'Give one primary and one secondary research method. What question would each help answer?',
      },
      {
        id: 'ch3-3',
        label: '3.3',
        title: 'Competitive Analysis: Standing Out in the Crowd',
        reading: [
          'Competition is broader than businesses that look exactly like yours. Direct competitors offer similar products to the same customer. Indirect competitors provide different ways to solve the same underlying need.',
          'A school-delivery idea may compete directly with another delivery service, but it can also compete indirectly with walking to the school store, asking a friend to bring an item, or using an existing supply.',
          'A competitive matrix compares factors that matter to the customer: price, convenience, customization, quality, access, or speed. The purpose is not to copy a competitor. It is to understand the alternatives customers already have.',
        ],
        check: 'Why should a competitive matrix include indirect alternatives?',
      },
      {
        id: 'ch3-4',
        label: '3.4',
        title: 'Real-World Spotlight: The School Snack Cart Pivot',
        reading: [],
        caseStudies: [
          {
            name: 'The School Snack Cart',
            body: 'A group of 7th graders planned a healthy snack business around organic dried kale chips. Before buying inventory, they used free samples and short surveys with classmates. The research showed the original assumption was weak: most students disliked the kale chips, while many preferred baked apple crisps and fruit smoothies.',
          },
        ],
        takeaway:
          "Because the team tested before spending heavily, they could change the inventory plan before losing money. Don't treat the first idea as the final answer - use evidence to shape the offering.",
        check: 'What did the team learn that a guess could not have told them?',
      },
      {
        id: 'ch3-5',
        label: '3.5',
        title: 'Research Studio & Chapter 3 Challenge',
        reading: [
          '5-Question Survey Builder: 1) Choose one school-relevant concept. 2) Write five short, neutral questions. 3) Survey at least ten people with teacher approval. 4) Summarize the strongest pattern you see. 5) Write one change you would make based on the evidence. Remember: avoid questions that tell the participant what answer you want.',
        ],
        activity: {
          heading: 'Hands-On Challenge',
          body: 'Design a five-question survey for a new school product idea. Collect responses, summarize the patterns, and write a one-paragraph evidence-based recommendation.',
        },
        check: 'Which finding surprised you? Which assumption did it challenge?',
      },
    ],
  },
  {
    id: 'ch4',
    number: 4,
    title: 'Designing, Bootstrapping & Testing Your Product (MVP)',
    summary:
      'Build the smallest version that tests your biggest assumption, then improve it with what real users do.',
    color: '#2E7D6F',
    vocab: [
      { term: 'Goods', def: 'Tangible products customers can touch, store, or take home.' },
      { term: 'Services', def: 'Work or expertise performed for a customer.' },
      { term: 'Bootstrapping', def: 'Building with available resources, free tools, and personal initiative.' },
      { term: 'Minimum Viable Product (MVP)', def: 'The simplest version that can test an important assumption.' },
      { term: 'Prototype', def: 'A model or simulation used to learn before the final product exists.' },
      { term: 'Iteration', def: 'A cycle of making, testing, learning, and improving.' },
      { term: 'User Test', def: 'A structured chance for a real or representative user to try something.' },
      { term: 'Feedback', def: 'Information from users that helps you decide what to keep or change.' },
    ],
    sections: [
      {
        id: 'ch4-1',
        label: '4.1',
        title: 'Goods vs. Services',
        reading: [
          'Entrepreneurial ideas generally fall into two broad categories. Goods are tangible products that can be produced, packaged, stored, and handed to a customer. Services are activities or expertise performed for a customer.',
          'Bootstrapping means using resources you already have: free digital tools, recycled materials, personal skills, community spaces, or small-scale experiments. The point is not to avoid every expense. It is to avoid spending before you know what needs to be tested.',
        ],
        activity: {
          heading: 'Activity: Free Tool Scavenger Hunt',
          body: 'Identify free or low-cost tools that could help with a logo, simple webpage, 3D model, survey, prototype, or presentation.',
        },
        check: 'Give two goods and two services that could exist in a school community.',
      },
      {
        id: 'ch4-2',
        label: '4.2',
        title: 'The Minimum Viable Product',
        reading: [
          'A Minimum Viable Product is not a cheap final product. It is a learning tool. The MVP is the smallest version that lets you test an important assumption with a real or representative user.',
          'Compare an all-at-once build with an iterative path such as skateboard -> scooter -> bicycle -> car. Each stage provides something useful while still allowing the team to learn.',
          'A finished product can hide wrong assumptions for months. A paper version of an app, a cardboard model, a service script, or a landing-page mockup can all function as MVPs.',
        ],
        check: 'What assumption would your MVP test first?',
      },
      {
        id: 'ch4-3',
        label: '4.3',
        title: 'The Iterative Prototyping Cycle',
        reading: [
          'Iterative design follows a repeatable loop: build, test, learn, repeat. The prototype should be concrete enough that another person can react to it.',
          'User test questions: What was confusing? What did you expect to happen? Which part was useful? What would you change? What did you do differently than the team expected?',
        ],
        activity: {
          heading: 'Activity: The 20-Minute Card Build',
          body: 'Use scrap paper, cardboard, tape, scissors, or digital mockups. Build a low-cost prototype, put it in front of another student, observe how they use it, ask what confused them, and record what you would change.',
        },
        check: 'Why is watching behavior often more useful than asking, "Do you like it?"',
      },
      {
        id: 'ch4-4',
        label: '4.4',
        title: 'Real-World Spotlight: How Early MVPs Tested Big Ideas',
        reading: [],
        caseStudies: [
          {
            name: 'Zappos',
            body: 'An early test checked online shoe demand without a giant inventory system. The founder used photos of shoes from local stores and fulfilled orders from those stores, testing a key assumption before a much larger build.',
          },
          {
            name: 'Dropbox',
            body: 'A short demonstration video showed how the software would work before the full system was complete. The early response helped test interest in the product concept.',
          },
        ],
        takeaway:
          'An MVP can be a demonstration, mockup, sample, paper prototype, or manual service. The form matters less than whether it answers the important question.',
        check: 'Which assumption was tested in each case? What evidence would count as meaningful?',
      },
      {
        id: 'ch4-5',
        label: '4.5',
        title: 'Prototype Studio & Chapter 4 Challenge',
        reading: [
          'Test plan: name the user, name the task, name the behavior you want to observe, and decide what evidence would change your next version. Observation log: observed action / quote or comment / confusion point / keep / change.',
          'Success check: the prototype is concrete, the user can react to it, the team records evidence, and the next change is based on learning.',
        ],
        activity: {
          heading: 'Hands-On Challenge',
          body: 'Choose a Bug List problem. Build a 30-minute physical or digital mockup. Have a partner use it. Record three observations and make one revision.',
        },
        check: 'What did the user do that surprised you? What would you build differently after the first test?',
      },
    ],
  },
  {
    id: 'ch5',
    number: 5,
    title: 'Business Financials & Pricing Strategies',
    summary:
      'Classify costs, master profit math, choose a price with more than one lens, and find your break-even point.',
    color: '#414042',
    vocab: [
      { term: 'Startup Cost', def: 'A one-time or early cost needed to get started.' },
      { term: 'Fixed Cost', def: 'A cost that usually stays the same over a period of activity.' },
      { term: 'Variable Cost', def: 'A cost that changes as you make or sell more units.' },
      { term: 'Revenue', def: 'Money a business receives from sales.' },
      { term: 'Profit', def: 'Money left after costs are subtracted from revenue.' },
      { term: 'Unit Cost', def: 'The cost to make or deliver one unit.' },
      { term: 'Markup', def: 'An amount added to cost to help set a selling price.' },
      { term: 'Cost-Plus Pricing', def: 'Pricing based on cost plus a planned markup.' },
      { term: 'Competitive Pricing', def: 'Pricing informed by what competitors charge.' },
      { term: 'Value-Based Pricing', def: 'Pricing based on the value customers perceive.' },
      { term: 'Break-Even Point', def: 'The point where total revenue equals total costs.' },
      { term: 'Unit Economics', def: 'The financial story of one unit sold.' },
    ],
    sections: [
      {
        id: 'ch5-1',
        label: '5.1',
        title: 'Startup Costs vs. Ongoing Expenses',
        reading: [
          'Business money flows become easier to understand when costs are classified. Startup costs are expenses needed to get moving, such as tools, first equipment, signage, or a domain. Ongoing expenses recur as the venture operates.',
          'A fixed cost tends to stay the same over a period, such as a booth fee. A variable cost changes as sales or production change, such as packaging or material used per unit.',
        ],
        activity: {
          heading: 'Activity',
          body: 'Choose a student venture. List at least six costs. Label each startup, fixed, or variable and explain why.',
        },
        check: 'Why is it useful to separate fixed and variable costs?',
      },
      {
        id: 'ch5-2',
        label: '5.2',
        title: 'The Core Formula of Business: Profit Math',
        reading: [
          'Formulas: Profit = Revenue - Total Costs. Total Revenue = Price x Units Sold. Unit Contribution = Selling Price - Variable Cost per Unit.',
          'Revenue is not the same as profit. A lemonade stand that collects $100 may spend money on cups, lemons, ice, signs, and permits. The entrepreneur must subtract costs to understand what remains.',
          'Example: a student sells sticker sheets for $2.50 each and spends $0.50 per sheet on paper and ink. Unit contribution before other costs is $2.00. At 40 sales, revenue is $100 and variable cost is $20.',
        ],
        check: 'What happens when revenue equals total cost? What happens when costs exceed revenue?',
      },
      {
        id: 'ch5-3',
        label: '5.3',
        title: 'Pricing Strategies: How Much Should You Charge?',
        reading: [
          'Cost-plus: start with cost and add a planned markup. This method helps make sure price covers known costs.',
          'Competitive: look at comparable offers and their prices. The comparison is useful only when the products, customers, and context are reasonably similar.',
          'Value-based: consider how much value or convenience the customer believes the offering provides. The same product can feel more or less useful in different contexts.',
        ],
        check: 'A responsible price decision uses more than one lens. What does it cost? What alternatives exist? What value does the customer experience?',
      },
      {
        id: 'ch5-4',
        label: '5.4',
        title: "Real-World Spotlight: Alex's Lawn Care",
        reading: [
          'Startup: $120 for a used lawn mower and $15 for safety goggles and gloves = $135 startup cost. Variable cost: about $3 in gasoline and $1 in lawn bags = $4 per lawn.',
          'Alex charges $25 per lawn. $25 - $4 = $21 contribution per lawn before other expenses. That contribution is used to estimate how many lawns are needed to recover startup costs.',
        ],
        takeaway:
          'Unit economics connects pricing, cost, and break-even. Changing any one of those numbers changes the financial story.',
        check: 'How many lawns must Alex mow to recover the $135 startup cost?',
      },
      {
        id: 'ch5-5',
        label: '5.5',
        title: 'Finance Studio & Chapter 5 Challenge',
        reading: [
          'Break-even: a useful approximation is Fixed Costs / Unit Contribution. For example, $135 / $21 is a little over six lawns, so the whole-number target is seven.',
          'Math practice: 1. Maria sells sticker sheets for $2.50 with $0.50 variable cost. Find unit contribution and the revenue from 40 sheets. 2. If startup cost is $50 and contribution is $10 per logo, estimate break-even sales.',
        ],
        activity: {
          heading: 'Hands-On Challenge',
          body: 'Build a three-column business budget. List startup and variable costs, choose a price, calculate unit economics, and estimate break-even. Then stress test: what if price falls, variable cost rises, or sales are lower than expected?',
        },
        check: 'Which change would move break-even the most: lower fixed costs, lower variable costs, or higher unit contribution?',
      },
    ],
  },
  {
    id: 'ch6',
    number: 6,
    title: 'Marketing, Branding, Storytelling & The Pitch',
    summary:
      'Connect the 4 Ps to a clear brand and a 60-second pitch built on Hook, Problem, Solution, and Call to Action.',
    color: '#7B1FA2',
    vocab: [
      { term: 'Marketing', def: 'Activities used to attract, inform, and retain customers.' },
      { term: '4 Ps', def: 'Product, Price, Place, and Promotion.' },
      { term: 'Brand Identity', def: 'The visual and verbal elements that shape how a venture is recognized.' },
      { term: 'Brand Voice', def: 'The tone and personality used when communicating.' },
      { term: 'Marketing Channel', def: 'A route used to reach potential customers.' },
      { term: 'Promotion', def: 'Communication that helps customers notice and understand an offering.' },
      { term: 'Elevator Pitch', def: 'A short explanation designed to create interest quickly.' },
      { term: 'Hook', def: 'The opening that earns attention.' },
      { term: 'Call to Action', def: 'The next step you ask the audience to take.' },
      { term: 'Pitch Deck', def: 'A visual presentation that explains a venture.' },
    ],
    sections: [
      {
        id: 'ch6-1',
        label: '6.1',
        title: 'The 4 Ps of Marketing',
        reading: [
          'Customers need to understand what the offering is, what it costs, where they can get it, and why they should notice it. The 4 Ps organize those decisions.',
          'Product: what are you selling, and which features, quality, packaging, and benefits matter? Price: what does the customer pay? Place: where does the customer get the offering? Promotion: how does the customer hear about it?',
        ],
        check: 'Change one of the 4 Ps in a student venture. How does that change the other three?',
      },
      {
        id: 'ch6-2',
        label: '6.2',
        title: 'Crafting Your Brand Identity',
        reading: [
          'A brand is more than a logo. It is the collection of expectations and associations people connect with a venture. Brand identity is the system you use to make those associations consistent.',
          'Name, tagline, visual identity, and brand voice should work together. A playful student venture may use playful language; a safety-focused venture may need a calmer, clearer voice.',
        ],
        activity: {
          heading: 'Activity: Brand Matrix',
          body: 'For your idea, write a name, one-line promise, visual direction, and three words that describe the voice. Then ask a classmate what impression the choices create.',
        },
        check: 'Why should the brand promise be specific enough to believe?',
      },
      {
        id: 'ch6-3',
        label: '6.3',
        title: 'Marketing Channels & Digital Citizenship',
        reading: [
          'Student entrepreneurs often start with low-cost channels: word of mouth, approved flyers and posters, demonstrations, school announcements, or digital teasers with permission. Choose channels based on where the target audience actually pays attention.',
          'Ethical marketing: do not exaggerate claims, use someone else\'s work without permission, or collect private information casually. Protect customer privacy and follow school and platform rules.',
        ],
        activity: {
          heading: 'Activity',
          body: 'Choose two channels for your venture. Write the audience, message, timing, and one metric you would watch.',
        },
        check: 'Why might a message that earns attention still be a poor marketing choice?',
      },
      {
        id: 'ch6-4',
        label: '6.4',
        title: 'The Art of the Elevator Pitch',
        reading: [
          'Facts inform people, but a clear story helps them understand why the venture matters. Use a four-part structure: Hook -> Problem -> Solution -> Call to Action.',
          'The hook opens with a question, surprising observation, or concise statement that earns attention. Name who is affected, explain why current options are not working well, and introduce the solution. Evidence from customers makes the story more credible. End with the next step you need: materials, feedback, a pilot user, permission, or a small budget.',
        ],
        check: 'Write your hook in one sentence. Does it connect directly to the problem?',
      },
      {
        id: 'ch6-5',
        label: '6.5',
        title: 'Pitch Prep & Chapter 6 Challenge',
        reading: [
          'Slide makeover: reduce a text-heavy slide to one central idea, one visual, and a short takeaway. A pitch deck supports the speaker; it should not become a wall of text.',
          'Delivery: rehearse pacing, eye contact, posture, volume, and transitions. Q&A confidence: when you do not know an answer, do not guess. Use Acknowledge + Action - thank the questioner, state what you know, name the gap, and explain what you will research or test.',
        ],
        activity: {
          heading: 'Hands-On Challenge: The Pitch Competition',
          body: 'Write a 60-second pitch using Hook, Problem, Solution, and Call to Action. Practice with a timer. Present to a partner or the class. Ask for one comment about clarity, one about evidence, and one suggestion for the next version.',
        },
        check: 'What part of the story becomes stronger when you add customer evidence?',
      },
    ],
  },
];

export const TOOLKIT_REFERENCE = [
  { name: '5 Whys', body: 'Move from a visible symptom toward a root cause. Stop when the answer explains the system, not just the person.' },
  { name: 'How Might We', body: 'Turn a complaint into an open design question. Example: How might we make lunch pickup faster for students?' },
  { name: 'SCAMPER', body: 'Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse/Rearrange.' },
  { name: 'Competitive Matrix', body: 'Compare alternatives using customer-relevant factors such as price, convenience, customization, quality, and access.' },
  { name: 'MVP + Iteration', body: 'Create the smallest useful test, watch what happens, learn, and change the next version.' },
  { name: '4 Ps + Pitch', body: 'Connect Product, Price, Place, and Promotion to a clear Hook, Problem, Solution, and Call to Action.' },
];

export const FINANCE_REFERENCE = [
  { name: 'Core formulas', body: 'Profit = Revenue - Total Costs. Total Revenue = Price x Units Sold. Unit Contribution = Selling Price - Variable Cost per Unit.' },
  { name: 'Break-even', body: 'Break-Even Units = Fixed Costs / Unit Contribution. Round up when a fraction of a sale is not possible.' },
  { name: 'Worked example', body: 'Startup cost $135; price $25; variable cost $4; contribution $21. $135 / $21 = 6.43, so the whole-number break-even target is 7 sales.' },
  { name: 'Pricing lenses', body: 'Cost-plus starts from cost and adds markup. Competitive pricing looks at comparable alternatives. Value-based pricing considers customer-perceived value.' },
  { name: 'Stress test', body: 'Ask what happens if price falls, variable cost rises, or sales are lower than expected.' },
];

export const SCAMPER_MOVES = [
  { move: 'Substitute', prompt: 'Replace a part, material, or step.' },
  { move: 'Combine', prompt: 'Join ideas, features, or products.' },
  { move: 'Adapt', prompt: 'Borrow an idea from another situation.' },
  { move: 'Modify', prompt: 'Change size, shape, color, speed, or another feature.' },
  { move: 'Put to Another Use', prompt: 'Use something in a new way.' },
  { move: 'Eliminate', prompt: 'Remove an unnecessary part or step.' },
  { move: 'Reverse / Rearrange', prompt: 'Change the order, direction, or sequence.' },
];

export const ALL_LAUNCHPAD_SECTION_IDS = LAUNCHPAD_CHAPTERS.flatMap((c) => c.sections.map((s) => s.id));
