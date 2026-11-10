import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Search,
  Sparkles,
  UsersRound,
  BriefcaseBusiness,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Everything');
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [savedEvents, setSavedEvents] = useState<number[]>([]);

  const categories = [
    { name: 'Events', label: 'Find your people', icon: CalendarDays, tone: 'mint', count: '24 happening' },
    { name: 'Weddings', label: 'Make it memorable', icon: Heart, tone: 'gold', count: 'Plan beautifully' },
    { name: 'Jobs', label: 'Your next chapter', icon: BriefcaseBusiness, tone: 'clay', count: '186 opportunities' },
    { name: 'Market', label: 'Good things, nearby', icon: ShoppingBag, tone: 'blue', count: 'Shop local' },
    { name: 'Community', label: 'We belong together', icon: UsersRound, tone: 'rose', count: 'Meet your neighbors' },
  ];
  const events = [
    { id: 1, date: 'JUN 14', day: 'SATURDAY', name: 'Kigali Jazz Junction', place: 'Mundi Center · Kigali', kind: 'MUSIC & CULTURE', color: 'event-photo-1', time: '6:00 PM', price: 'From 8,000 RWF' },
    { id: 2, date: 'JUN 18', day: 'WEDNESDAY', name: 'Kimironko Makers Market', place: 'Kimironko · Kigali', kind: 'MARKET & FOOD', color: 'event-photo-2', time: '10:00 AM', price: 'Free entry' },
    { id: 3, date: 'JUN 21', day: 'SATURDAY', name: 'Hike & Brunch at Mount Kigali', place: 'Nyamirambo · Kigali', kind: 'OUTDOORS', color: 'event-photo-3', time: '7:30 AM', price: '12,000 RWF' },
  ];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setNotice(trimmed ? `Showing ${category === 'Everything' ? 'local finds' : category.toLowerCase()} for “${trimmed}” around Rwanda.` : `Explore ${category === 'Everything' ? 'what’s happening around Rwanda' : category.toLowerCase()} near you.`);
    document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const jumpTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toggleSaved = (id: number) => setSavedEvents((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#f7f5ee] text-[#17392d]">
      <div className="topline"><div className="container-wide topline-inner"><span>Made for Rwanda, wherever you are.</span><span className="topline-right"><MapPin size={13} /> Kigali, Rwanda <span className="topline-dot" /> Kinyarwanda <ChevronDown size={12} /></span></div></div>
      <header className="site-header">
        <div className="container-wide nav-wrap">
          <button type="button" className="brand" aria-label="Umunara home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="link-home">
            <span className="brand-symbol"><span /><span /><span /></span><span className="brand-word">UMUNARA<span className="brand-dot">.</span><small>RWANDA, TOGETHER</small></span>
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            <button onClick={() => jumpTo('events')} data-testid="nav-events">Events</button>
            <button onClick={() => jumpTo('weddings')} data-testid="nav-weddings">Weddings</button>
            <button onClick={() => jumpTo('jobs')} data-testid="nav-jobs">Jobs</button>
            <button onClick={() => jumpTo('market')} data-testid="nav-market">Market</button>
            <button onClick={() => jumpTo('community')} data-testid="nav-community">Community</button>
          </nav>
          <div className="nav-actions"><button className="login-link" onClick={() => setNotice('Sign-in is coming soon. For now, explore what Rwanda has to offer.')} data-testid="button-sign-in">Sign in</button><button className="join-button" onClick={() => setNotice('Welcome in. Account creation is coming soon.')} data-testid="button-join">Join Umunara <ArrowUpRight size={15} /></button></div>
          <button className="mobile-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="mobile-nav">{['Events','Weddings','Jobs','Market','Community'].map((item) => <button key={item} onClick={() => jumpTo(item.toLowerCase())}>{item}<ArrowRight size={16} /></button>)}</div>}
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" />
        <div className="hero-scrim" />
        <div className="hero-pattern" aria-hidden="true" />
        <div className="container-wide hero-content">
          <div className="hero-copy rise-in">
            <div className="eyebrow hero-eyebrow"><span className="eyebrow-mark" /> THE GOOD THINGS, ALL IN ONE PLACE</div>
            <h1 id="hero-title">Life is better<br />when we <em>find</em><br />it together.</h1>
            <p className="hero-description">From a weekend plan to a life-changing opportunity — find your next thing, right here in Rwanda.</p>
            <form className="search-panel" onSubmit={submitSearch}>
              <label className="search-input-wrap"><Search size={19} /><input aria-label="Search local events, jobs, and more" placeholder="What are you looking for?" value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-search" /></label>
              <label className="search-select-wrap"><span>EXPLORE</span><select aria-label="Choose a category" value={category} onChange={(event) => setCategory(event.target.value)} data-testid="select-category"><option>Everything</option><option>Events</option><option>Weddings</option><option>Jobs</option><option>Market</option><option>Community</option></select><ChevronDown size={14} /></label>
              <button className="search-button" aria-label="Search" type="submit" data-testid="button-search"><Search size={18} /><span>Search</span></button>
            </form>
            <div className="popular-searches"><span>TRY:</span>{['Events this weekend','Jobs in Kigali','Wedding venues'].map((term) => <button key={term} onClick={() => { setQuery(term); setCategory(term.startsWith('Jobs') ? 'Jobs' : term.startsWith('Wedding') ? 'Weddings' : 'Events'); }} data-testid={`search-suggestion-${term.split(' ')[0].toLowerCase()}`}>{term}</button>)}</div>
          </div>
          <div className="hero-stamp float-soft"><span className="stamp-top">A PLACE TO</span><span className="stamp-main">belong</span><span className="stamp-bottom">RWANDA, TOGETHER <Sparkles size={11} /></span></div>
          <div className="hero-caption"><span className="caption-line" /> A little closer to home.</div>
        </div>
        <div className="hero-bottom-band"><div className="container-wide band-inner"><span><strong>1 home</strong> for all the things that make life here</span><span className="band-stars">✳ &nbsp; <b>Find it. Feel it. Live it.</b></span><span className="band-right">RWANDA <span>°</span> 2025</span></div></div>
      </section>

      <section className="category-section container-wide" id="explore">
        <div className="section-heading category-heading"><div><div className="eyebrow"><span className="eyebrow-mark" /> YOUR LIFE, YOUR WAY</div><h2>Start <em>somewhere.</em></h2></div><p>Whatever today needs, there’s a place for it here.</p></div>
        {notice && <div className="search-notice" role="status"><Search size={17} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss search message"><X size={17} /></button></div>}
        <div className="category-grid">
          {categories.map(({ name, label, icon: Icon, tone, count }, index) => <button className={`category-card tone-${tone}`} onClick={() => jumpTo(name.toLowerCase())} key={name} style={{ animationDelay: `${index * 70}ms` }} data-testid={`category-${name.toLowerCase()}`}>
            <span className="category-icon"><Icon size={22} strokeWidth={1.7} /></span><span className="category-count">{count}</span><span className="category-name">{name}</span><span className="category-label">{label}</span><ArrowUpRight className="category-arrow" size={18} />
          </button>)}
        </div>
      </section>

      <section className="events-section" id="events">
        <div className="container-wide">
          <div className="section-heading events-heading"><div><div className="eyebrow"><span className="eyebrow-mark" /> OUT THERE, RIGHT NOW</div><h2>Make a day <em>of it.</em></h2><p className="section-subtitle">Good plans have a way of finding good people.</p></div><button className="text-link" onClick={() => setNotice('More local events are being added every week.')} data-testid="button-all-events">See all events <ArrowRight size={17} /></button></div>
          <div className="event-grid">{events.map((event) => <article className="event-card" key={event.id} data-testid={`card-event-${event.id}`}>
            <div className={`event-art ${event.color}`}><span className="event-date"><b>{event.date.split(' ')[1]}</b><small>{event.date.split(' ')[0]}</small></span><button className={`save-event ${savedEvents.includes(event.id) ? 'is-saved' : ''}`} aria-label={savedEvents.includes(event.id) ? 'Remove saved event' : 'Save event'} onClick={() => toggleSaved(event.id)} data-testid={`button-save-event-${event.id}`}><Heart size={17} fill={savedEvents.includes(event.id) ? 'currentColor' : 'none'} /></button><span className="art-number">0{event.id}</span></div>
            <div className="event-info"><div className="event-kind">{event.kind}</div><h3>{event.name}</h3><div className="event-place"><MapPin size={14} />{event.place}</div><div className="event-meta"><span><CalendarDays size={14} />{event.day}, {event.time}</span><b>{event.price}</b></div><button className="event-details" onClick={() => setNotice(`${event.name} — ${event.place}. ${event.day} at ${event.time}. ${event.price}.`)} data-testid={`button-event-details-${event.id}`}>Explore event <ArrowUpRight size={15} /></button></div>
          </article>)}</div>
          <div className="events-footnote"><span className="footnote-dot" /> Curated for your corner of Rwanda <span className="footnote-rule" /> New things added daily</div>
        </div>
      </section>

      <section className="wedding-section container-wide" id="weddings">
        <div className="wedding-copy"><div className="eyebrow light-eyebrow"><span className="eyebrow-mark" /> FOR THE DAYS YOU'LL NEVER FORGET</div><h2>Some days deserve<br />a little <em>extra.</em></h2><p>Find the people, places and little details that bring your celebration to life — all from one place.</p><button className="wedding-cta" onClick={() => setNotice('Your wedding planning journey starts here. Vendor directory coming soon.')} data-testid="button-wedding-guide">Explore wedding planning <ArrowRight size={17} /></button><div className="wedding-note"><span className="note-script">Made for your moment</span><span className="note-line" /></div></div>
        <div className="wedding-visual"><div className="wedding-image" /><div className="wedding-orbit orbit-one" /><div className="wedding-orbit orbit-two" /><div className="wedding-image-label"><Heart size={14} /> YOUR DAY, YOUR WAY</div><div className="wedding-aside"><span>01 / 05</span><b>VENUES · PLANNERS · FLORISTS · MORE</b></div></div>
      </section>

      <section className="life-section container-wide" id="jobs">
        <div className="life-header"><div><div className="eyebrow"><span className="eyebrow-mark" /> THE NEXT THING COULD BE BIG</div><h2>Room to <em>grow.</em></h2></div><p>Real opportunities for real people, close to home.</p></div>
        <div className="opportunity-grid">
          <div className="opportunity-main"><div className="opportunity-top"><span className="opportunity-icon"><BriefcaseBusiness size={21} /></span><span className="opportunity-count">186 OPEN ROLES</span></div><h3>Work that moves<br />you <em>forward.</em></h3><p>Find your next role with employers who are building Rwanda’s future.</p><button onClick={() => setNotice('Jobs board selected — new opportunities are on the way.')} data-testid="button-find-jobs">Find your next role <ArrowUpRight size={17} /></button><div className="opportunity-decoration">GROW<br />HERE<span>↗</span></div></div>
          <div className="opportunity-side"><div className="mini-label"><span className="small-orb" /> PEOPLE MAKING THINGS HAPPEN</div><h3>Made for the ones<br />who make <em>it happen.</em></h3><div className="people-illustration" aria-label="Illustrated community of local professionals"><span className="person p-one" /><span className="person p-two" /><span className="person p-three" /><span className="person p-four" /><span className="person p-five" /></div><div className="side-bottom"><span>Local talent. Local ambition.</span><button onClick={() => setNotice('Community profiles are coming soon.')} aria-label="Explore people" data-testid="button-explore-people"><ArrowUpRight size={17} /></button></div></div>
        </div>
      </section>

      <section className="market-section" id="market"><div className="container-wide market-inner">
        <div className="market-left"><div className="eyebrow"><span className="eyebrow-mark" /> GOOD THINGS TRAVEL</div><h2>Find your<br /><em>local.</em></h2><p>Discover the makers, finds and everyday treasures just around the corner.</p><button className="market-cta" onClick={() => setNotice('The local marketplace is taking shape. Check back soon.')} data-testid="button-browse-market">Browse the market <ArrowRight size={17} /></button><div className="market-doodle">Made nearby <ArrowDownRight size={18} /></div></div>
        <div className="market-collage"><div className="market-tile tile-linen"><div className="tile-art textile-art" /><span>01 / MADE BY HAND</span><b>Objects with a story.</b></div><div className="market-tile tile-produce"><div className="tile-art produce-art" /><span>02 / GROWN WITH CARE</span><b>Fresh from close by.</b></div><div className="market-sticker">SHOP<br /><em>local</em></div><div className="market-caption"><span className="caption-dot" />Your next favorite thing is closer than you think.</div></div>
      </div></section>

      <section className="community-section container-wide" id="community">
        <div className="community-title"><span className="community-number">05 — COMMUNITY</span><h2>There’s no place<br />like <em>our place.</em></h2><p>Meet the people making Rwanda feel like home, every single day.</p><button className="community-cta" onClick={() => setNotice('Community stories and groups are coming soon.')} data-testid="button-meet-community">Meet the community <ArrowRight size={17} /></button></div>
        <div className="community-story"><div className="story-image"><div className="story-image-inner" /><div className="story-pullquote">“Home is not just where we are.<br />It’s what we make together.”</div></div><div className="story-meta"><span>PEOPLE OF UMUNARA — 001</span><span>STORIES FROM OUR HOME <ArrowUpRight size={14} /></span></div></div>
      </section>

      <section className="newsletter-section"><div className="container-wide newsletter-inner"><div><div className="eyebrow light-eyebrow"><span className="eyebrow-mark" /> A GOOD NOTE FROM HOME</div><h2>A little more <em>Rwanda</em><br />in your inbox.</h2><p>Local finds, thoughtful plans and good news. No noise.</p></div><form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}><label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label><div className="newsletter-input"><input id="newsletter-email" type="email" placeholder="you@example.com" required aria-label="Email address" data-testid="input-newsletter-email" /><button type="submit" aria-label="Subscribe" data-testid="button-subscribe">{subscribed ? <Check size={19} /> : <ArrowRight size={19} />}</button></div><span className="newsletter-response" role="status">{subscribed ? 'You’re on the list. We’ll be in touch.' : 'Just the good stuff. Unsubscribe whenever.'}</span></form><div className="newsletter-flower" aria-hidden="true">✳</div></div></section>

      <footer className="site-footer"><div className="container-wide footer-main"><div className="footer-brand"><button className="brand footer-brand-mark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span className="brand-symbol"><span /><span /><span /></span><span className="brand-word">UMUNARA<span className="brand-dot">.</span><small>RWANDA, TOGETHER</small></span></button><p>One home for the things<br />that make life here.</p></div><div className="footer-links"><div><b>EXPLORE</b>{['Events','Weddings','Jobs','Market','Community'].map((item) => <button key={item} onClick={() => jumpTo(item.toLowerCase())}>{item}</button>)}</div><div><b>UMUNARA</b><button onClick={() => setNotice('We’re a home for everyday life in Rwanda.')}>Our story</button><button onClick={() => setNotice('We’d love to hear from you. Contact details coming soon.')}>Get in touch</button><button onClick={() => setNotice('Partnership opportunities are coming soon.')}>Partner with us</button></div></div><div className="footer-signoff"><span>MADE WITH CARE IN RWANDA</span><div className="footer-flower">✳</div><span>29°34' S / 30°03' E</span></div></div><div className="container-wide footer-bottom"><span>© 2025 UMUNARA. ALL THE GOOD THINGS.</span><span><button onClick={() => setNotice('Privacy information will be available soon.')}>PRIVACY</button><button onClick={() => setNotice('Terms of use will be available soon.')}>TERMS</button><span>EN <ChevronDown size={12} /></span></span></div></footer>
      {notice && <div className="toast-notice" role="status"><span><Check size={16} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
