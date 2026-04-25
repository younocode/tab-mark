// icons.jsx — small inline SVG icons (Linear/Raycast feel)

const Icon = ({ d, size = 14, stroke = 1.6, fill = "none", ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

const IconTabs = (p) => <Icon {...p} d={<>
  <rect x="2" y="3" width="12" height="10" rx="1.6"/>
  <path d="M2 6h12"/>
  <path d="M5 3v3"/>
</>} />;

const IconBookmark = (p) => <Icon {...p} d={<>
  <path d="M4 2.5h8a.8.8 0 0 1 .8.8v10.2L8 11.2l-4.8 2.3V3.3a.8.8 0 0 1 .8-.8z"/>
</>} />;

const IconRead = (p) => <Icon {...p} d={<>
  <path d="M2.5 3.5h4.5a2 2 0 0 1 2 2v8a2 2 0 0 0-2-2H2.5z"/>
  <path d="M13.5 3.5H9a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h4.5z"/>
</>} />;

const IconHealth = (p) => <Icon {...p} d={<>
  <path d="M2 8h2.5l1.5-3 2 6 1.5-3H14"/>
</>} />;

const IconSettings = (p) => <Icon {...p} d={<>
  <circle cx="8" cy="8" r="2"/>
  <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8l-1.4-1.4"/>
</>} />;

const IconSearch = (p) => <Icon {...p} d={<>
  <circle cx="7" cy="7" r="4.5"/>
  <path d="M14 14l-3.7-3.7"/>
</>} />;

const IconClose = (p) => <Icon {...p} d={<>
  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>
</>} />;

const IconChevR = (p) => <Icon {...p} d={<path d="M6 3l5 5-5 5"/>} />;
const IconChevD = (p) => <Icon {...p} d={<path d="M3 6l5 5 5-5"/>} />;
const IconChevU = (p) => <Icon {...p} d={<path d="M3 10l5-5 5 5"/>} />;

const IconMore = (p) => <Icon {...p} d={<>
  <circle cx="3.5" cy="8" r="1" fill="currentColor"/>
  <circle cx="8" cy="8" r="1" fill="currentColor"/>
  <circle cx="12.5" cy="8" r="1" fill="currentColor"/>
</>} />;

const IconHibernate = (p) => <Icon {...p} d={<>
  <path d="M3 4h4l-4 4h4M9 8h4l-4 4h4"/>
</>} />;

const IconRestore = (p) => <Icon {...p} d={<>
  <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9"/>
  <path d="M2.5 2.5v3h3"/>
</>} />;

const IconExternal = (p) => <Icon {...p} d={<>
  <path d="M9.5 2.5h4v4"/>
  <path d="M13.5 2.5l-6 6"/>
  <path d="M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3"/>
</>} />;

const IconClock = (p) => <Icon {...p} d={<>
  <circle cx="8" cy="8" r="5.5"/>
  <path d="M8 5v3l2 1.5"/>
</>} />;

const IconStar = (p) => <Icon {...p} d={<>
  <path d="M8 2l1.7 3.7 4 .5-3 2.8.8 4-3.5-2.1-3.5 2.1.8-4-3-2.8 4-.5z"/>
</>} />;

const IconFolder = (p) => <Icon {...p} d={<>
  <path d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
</>} />;

const IconTag = (p) => <Icon {...p} d={<>
  <path d="M2.5 8.5l6 6 6-6-6-6h-6z"/>
  <circle cx="5.5" cy="5.5" r=".7" fill="currentColor"/>
</>} />;

const IconCamera = (p) => <Icon {...p} d={<>
  <rect x="2" y="4.5" width="12" height="8.5" rx="1.4"/>
  <circle cx="8" cy="8.8" r="2.2"/>
  <path d="M5.5 4.5l1-1.5h3l1 1.5"/>
</>} />;

const IconCheck = (p) => <Icon {...p} d={<path d="M3 8.5L6.5 12l6.5-7"/>} />;

const IconPlus = (p) => <Icon {...p} d={<><path d="M8 3v10M3 8h10"/></>} />;

const IconCommand = (p) => <Icon {...p} d={<>
  <path d="M5 3.5h6a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
  <path d="M3.5 5A1.5 1.5 0 1 0 5 3.5M11 3.5A1.5 1.5 0 1 0 12.5 5M12.5 11A1.5 1.5 0 1 0 11 12.5M5 12.5A1.5 1.5 0 1 0 3.5 11"/>
</>} />;

const IconGlobe = (p) => <Icon {...p} d={<>
  <circle cx="8" cy="8" r="5.5"/>
  <path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11"/>
</>} />;

Object.assign(window, {
  Icon, IconTabs, IconBookmark, IconRead, IconHealth, IconSettings,
  IconSearch, IconClose, IconChevR, IconChevD, IconChevU, IconMore,
  IconHibernate, IconRestore, IconExternal, IconClock, IconStar,
  IconFolder, IconTag, IconCamera, IconCheck, IconPlus, IconCommand, IconGlobe,
});
