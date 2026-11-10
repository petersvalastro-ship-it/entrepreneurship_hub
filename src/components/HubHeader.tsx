import { useState } from 'react';
import { ChevronDown, ClipboardList, LogIn, LogOut, Menu, UserCircle, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import neiaLogo from '@/assets/neia-logo.png.asset.json';

type Props = {
  activeTab: string;
  onNavigate: (tab: string) => void;
  signedIn: boolean;
  displayName: string;
  isTeacher: boolean;
  xp: number;
  onSignIn: () => void;
  onSignOut: () => void;
  highContrast: boolean;
  onContrastChange: (value: boolean) => void;
  dyslexicFont: boolean;
  onFontChange: (value: boolean) => void;
  textSize: string;
  onTextSizeChange: (value: string) => void;
  speechActive: boolean;
  onStopSpeech: () => void;
};

const groups = [
  { label: 'Class Tools', items: [
    { id: 'brainstarts', label: 'Brain Starts' },
    { id: 'schedule', label: 'Class Schedule' },
    { id: 'whiteboard', label: 'Class Whiteboard' },
    { id: 'entryticket', label: 'Entry Ticket' },
    { id: 'feedback', label: 'Exit Ticket' },
  ] },
  { label: 'Learning', items: [
    { id: 'assignments', label: 'Assignments' },
    { id: 'casestudies', label: 'Case Studies' },
    { id: 'entrepreneurs', label: 'Entrepreneurs' },
    { id: 'textbook', label: 'LaunchPad Textbook' },
    { id: 'mastery', label: 'Mastery & Assessments' },
    { id: 'syllabus', label: 'Syllabus' },
  ] },
  { label: 'Resources', items: [
    { id: 'calculators', label: 'Formula & Math Lab' },
    { id: 'glossary', label: 'Glossary & Cards' },
    { id: 'practice', label: 'Interactive Scenarios' },
    { id: 'simulator', label: 'Venture Pitch Builder' },
  ] },
];

export default function HubHeader(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (tab: string) => {
    props.onNavigate(tab);
    setMobileOpen(false);
  };
  const initials = props.displayName?.trim().split(/\s+/).slice(0, 2).map((name) => name[0]).join('').toUpperCase();
  const isGroupActive = (group: typeof groups[number]) => group.items.some((item) => item.id === props.activeTab)
    || (group.label === 'Learning' && (props.activeTab.startsWith('assignment') || props.activeTab.startsWith('lesson:')));
  const menuProps = { className: 'hub-menu w-64 p-2', 'data-contrast': props.highContrast };

  return (
    <div className="hub-chrome contents" data-contrast={props.highContrast}>
      <header className="sticky top-0 z-50 border-b border-hub-header-foreground/10 bg-hub-header text-hub-header-foreground">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button variant="hubIdentity" onClick={() => navigate('dashboard')} className="h-auto min-w-0 gap-2.5 p-0 text-left" title="Go to Dashboard">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hub-logo">
              <img src={neiaLogo.url} alt="New England Innovation Academy logo" className="size-8 object-contain" />
            </span>
            <span className="max-w-32 whitespace-normal text-sm leading-snug font-bold sm:max-w-none sm:text-base">NEIA Entrepreneur Hub</span>
          </Button>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Button variant="hubPrimary" onClick={() => navigate('assignments')} className="h-10 gap-2 px-3 text-xs font-semibold sm:px-4 sm:text-sm" title="View all class assignments">
              <ClipboardList className="hidden sm:block" />
              <span>View Assignments</span>
              {props.signedIn && !props.isTeacher && <span className="hidden rounded-sm bg-hub-header-foreground/15 px-1.5 py-0.5 text-xs sm:inline" title="Your XP">{props.xp} XP</span>}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hubIdentity" size="icon" className="size-10 rounded-full border border-hub-header-foreground/30 bg-hub-header-foreground/10" aria-label="Profile and accessibility menu" title="Profile and accessibility">
                  {props.signedIn && initials ? <span className="text-xs font-semibold">{initials}</span> : <UserCircle />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent {...menuProps} align="end" sideOffset={12}>
                <DropdownMenuLabel className="truncate">{props.signedIn ? props.displayName : 'Your Account'}</DropdownMenuLabel>
                {props.signedIn ? <DropdownMenuItem onSelect={() => navigate('profile')}><UserCircle />My Profile</DropdownMenuItem>
                  : <DropdownMenuItem onSelect={props.onSignIn}><LogIn />Sign In / Create Account</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-hub-nav-muted">Accessibility</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={props.highContrast} onCheckedChange={props.onContrastChange} onSelect={(event) => event.preventDefault()}>High Contrast</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={props.dyslexicFont} onCheckedChange={props.onFontChange} onSelect={(event) => event.preventDefault()}>Readable Font</DropdownMenuCheckboxItem>
                <DropdownMenuLabel className="mt-1 text-xs text-hub-nav-muted">Text Size</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={props.textSize} onValueChange={props.onTextSizeChange}>
                  {[{ value: 'normal', label: 'Standard' }, { value: 'large', label: 'Large' }, { value: 'xl', label: 'Extra Large' }].map(({ value, label }) => <DropdownMenuRadioItem key={value} value={value} onSelect={(event) => event.preventDefault()}>{label}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
                {props.speechActive && <DropdownMenuItem onSelect={props.onStopSpeech}><VolumeX />Stop Audio</DropdownMenuItem>}
                {props.signedIn && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={props.onSignOut}><LogOut />Sign Out</DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <nav aria-label="Main navigation" className="border-b border-hub-nav-border bg-hub-nav text-hub-nav-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-12 items-center justify-between md:hidden">
            <Button variant="hubNav" onClick={() => setMobileOpen(!mobileOpen)} className="h-10 px-0" aria-label="Toggle navigation menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <X /> : <Menu />}Menu
            </Button>
            <span className="text-xs text-hub-nav-muted">{groups.find(isGroupActive)?.label || (props.activeTab === 'teacher' ? 'Teacher Dashboard' : props.activeTab === 'profile' ? 'Your Account' : 'Dashboard')}</span>
          </div>
          <div className={`${mobileOpen ? 'flex' : 'hidden'} flex-col items-start gap-1 pb-3 md:flex md:h-14 md:flex-row md:items-stretch md:gap-6 md:pb-0`}>
            <Button variant="hubNav" data-active={props.activeTab === 'dashboard'} aria-current={props.activeTab === 'dashboard' ? 'page' : undefined} onClick={() => navigate('dashboard')} className="h-12 px-1 md:h-auto">Dashboard</Button>
            {props.isTeacher && <Button variant="hubNav" data-active={props.activeTab === 'teacher'} aria-current={props.activeTab === 'teacher' ? 'page' : undefined} onClick={() => navigate('teacher')} className="h-12 px-1 md:h-auto">Teacher Dashboard</Button>}
            {groups.map((group) => <DropdownMenu key={group.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="hubNav" data-active={isGroupActive(group)} className="h-12 gap-1.5 px-1 md:h-auto">{group.label}<ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent {...menuProps} align="start" sideOffset={4}>
                {group.items.map((item) => <DropdownMenuItem key={item.id} onSelect={() => navigate(item.id)} className={props.activeTab === item.id ? 'bg-hub-nav-hover font-bold' : ''}>{item.label}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>)}
          </div>
        </div>
      </nav>
    </div>
  );
}
