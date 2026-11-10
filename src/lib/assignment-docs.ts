import abPdf from '@/assets/assumption-buster-student-guide.pdf.asset.json';
import abHtml from '@/content/assumption-buster.html?raw';
import rebusHtml from '@/content/rebus-studio.html?raw';
import interviewHtml from '@/content/customer-interview-lab.html?raw';
import rebusPdf from '@/assets/rebus-studio-student-guide.pdf.asset.json';
import interviewPdf from '@/assets/customer-interview-lab-student-guide.pdf.asset.json';
import fridayHtml from '@/content/friday-learning-loop.html?raw';
import fridayPdf from '@/assets/friday-learning-loop-student-guide.pdf.asset.json';
import foundersHtml from '@/content/founders-of-learning.html?raw';
import foundersPdf from '@/assets/founders-of-learning-student-guide.pdf.asset.json';
import frictionHtml from '@/content/friction-to-opportunity.html?raw';
import frictionPdf from '@/assets/friction-to-opportunity-student-guide.pdf.asset.json';
import scamperHtml from '@/content/cases-and-scamper.html?raw';
import scamperPdf from '@/assets/cases-and-scamper-student-guide.pdf.asset.json';
import redesignHtml from '@/content/redesign-challenge.html?raw';
import redesignPdf from '@/assets/redesign-challenge-student-guide.pdf.asset.json';
import { parseAssignmentDate } from './assignment-weeks';

type Doc = {
  /** Tab id inside the Hub and the page address. */
  tab: string;
  path: string;
  title: string;
  /** Date text exactly as printed in the assignment PDF's title or header. Drives week placement. */
  date: string;
  /** Optional end date for multi-day assignments (shown on the card). */
  until?: string;
  focus: string;
  description: string;
  html: string;
  pdfUrl: string;
  pdfName: string;
};

export const ASSIGNMENT_DOCS = {
  'friction-to-opportunity': {
    tab: 'assignmentCh2Tue', path: '/learning/assignments/friction-to-opportunity',
    title: 'From Friction to Opportunity', date: 'Tuesday, November 10, 2026',
    focus: 'Needs and wants · Observation · Problem framing',
    description: 'Separate needs from wants, observe a school routine using facts only, and turn one specific friction point into a problem statement and a How might we question. Click Submit to Pietro when you are finished.',
    html: frictionHtml, pdfUrl: frictionPdf.url, pdfName: 'From-Friction-to-Opportunity-Student-Guide.pdf',
  },
  'cases-and-scamper': {
    tab: 'assignmentCh2Thu', path: '/learning/assignments/cases-and-scamper',
    title: 'Cases and SCAMPER', date: 'Thursday, November 12, 2026',
    focus: 'Founder evidence · Empathy · SCAMPER',
    description: "Compare how the founders of Canva and Bevel responded to customer frustration, then use SCAMPER to generate at least five ideas for Tuesday's pain point and choose a direction. Click Submit to Pietro when you are finished.",
    html: scamperHtml, pdfUrl: scamperPdf.url, pdfName: 'Cases-and-SCAMPER-Student-Guide.pdf',
  },
  'redesign-challenge': {
    tab: 'assignmentCh2Fri', path: '/learning/assignments/redesign-challenge',
    title: 'Redesign Challenge', date: 'Friday, November 13, 2026',
    focus: 'Review · Feedback · Revision · Explanation',
    description: "Retrieve key Chapter 2 ideas, improve Thursday's redesign with specific peer feedback, plan and give a two-minute paired presentation, and finish an individual reflection. Click Submit to Pietro when you are finished.",
    html: redesignHtml, pdfUrl: redesignPdf.url, pdfName: 'Redesign-Challenge-Student-Guide.pdf',
  },
  'founders-of-learning': {
    tab: 'assignmentFounders', path: '/learning/assignments/founders-of-learning',
    title: 'Founders of Learning: Build, Teach, Improve', date: 'Monday, October 26, 2026', until: 'Friday, October 30, 2026',
    focus: 'Teaching others · Feedback & iteration',
    description: 'With your partner, plan, build, test and revise a 10-minute entrepreneurship lesson: plan Monday, build and test Tuesday, revise Thursday, final lesson ready Friday. Presentations begin next week. Click Submit to Pietro when your planning guide is finished.',
    html: foundersHtml, pdfUrl: foundersPdf.url, pdfName: 'Founders-of-Learning-Planning-Guide.pdf',
  },
  'assumption-buster': {
    tab: 'assignment1019', path: '/learning/assignments/assumption-buster',
    title: 'Assumption Buster', date: 'Monday, October 19, 2026',
    focus: 'Questioning assumptions · Evidence-based thinking',
    description: 'Spot a common assumption people make about entrepreneurs or business, test it with research, and explain what you found using evidence from our class case studies. Click Submit to Pietro when you are finished.',
    html: abHtml, pdfUrl: abPdf.url, pdfName: 'Assumption-Buster-Student-Guide.pdf',
  },
  'rebus-studio': {
    tab: 'assignmentRebus', path: '/learning/assignments/rebus-studio',
    title: 'Entrepreneurial Rebus Studio', date: 'Tuesday, October 20, 2026',
    focus: 'Creativity · Communicating ideas',
    description: 'Read the case study, design three entrepreneurship rebus puzzles, peer-test and revise them, then finish the exit ticket. Click Submit to Pietro when you are finished.',
    html: rebusHtml, pdfUrl: rebusPdf.url, pdfName: 'Rebus-Studio-Student-Guide.pdf',
  },
  'customer-interview-lab': {
    tab: 'assignmentInterview', path: '/learning/assignments/customer-interview-lab',
    title: 'Customer Interview Lab', date: 'Thursday, October 22, 2026',
    focus: 'Empathy · Turning assumptions into evidence',
    description: 'Pick an assumption about your customer, plan and run a short customer interview, record what you heard, and decide what to do next based on the evidence. Click Submit to Pietro when you are finished.',
    html: interviewHtml, pdfUrl: interviewPdf.url, pdfName: 'Customer-Interview-Lab-Student-Guide.pdf',
  },
  'friday-learning-loop': {
    tab: 'assignmentFriday', path: '/learning/assignments/friday-learning-loop',
    title: 'Friday Learning Loop: Week in Four Frames', date: 'Friday, October 23, 2026',
    focus: 'Connecting ideas · Collaboration · Reflection',
    description: 'Warm up with the Brain Smart Start rebus, then work with your team to connect what we noticed, asked, learned and decided this week, create a new rebus, swap feedback in a gallery, and finish an individual reflection. Click Submit to Pietro when you are finished.',
    html: fridayHtml, pdfUrl: fridayPdf.url, pdfName: 'Friday-Learning-Loop-Student-Guide.pdf',
  },
} satisfies Record<string, Doc>;

export type AssignmentKey = keyof typeof ASSIGNMENT_DOCS;

export const ASSIGNMENT_KEYS = Object.keys(ASSIGNMENT_DOCS) as AssignmentKey[];

/** The date each assignment was given, read from the date text taken from its PDF. */
export function assignmentDate(key: AssignmentKey): Date {
  const d = parseAssignmentDate(ASSIGNMENT_DOCS[key].date);
  if (!d) throw new Error(`Assignment "${key}" has no readable date: ${ASSIGNMENT_DOCS[key].date}`);
  return d;
}

export const ASSIGNMENT_TABS: Record<string, AssignmentKey> = Object.fromEntries(ASSIGNMENT_KEYS.map((k) => [ASSIGNMENT_DOCS[k].tab, k]));
