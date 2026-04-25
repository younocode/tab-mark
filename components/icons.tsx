interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Icon({
  d,
  size = 14,
  stroke = 1.6,
  fill = "none",
  ...rest
}: IconProps & {
  d: React.ReactNode;
  stroke?: number;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {d}
    </svg>
  );
}

export function IconTabs(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="2" y="3" width="12" height="10" rx="1.6" />
          <path d="M2 6h12" />
          <path d="M5 3v3" />
        </>
      }
    />
  );
}

export function IconBookmark(p: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = p;
  return (
    <Icon
      {...rest}
      fill={filled ? "currentColor" : "none"}
      d={
        <path d="M4 2.5h8a.8.8 0 0 1 .8.8v10.2L8 11.2l-4.8 2.3V3.3a.8.8 0 0 1 .8-.8z" />
      }
    />
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M14 14l-3.7-3.7" />
        </>
      }
    />
  );
}

export function IconClose(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M3.5 3.5l9 9" />
          <path d="M12.5 3.5l-9 9" />
        </>
      }
    />
  );
}

export function IconSettings(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8l-1.4-1.4" />
        </>
      }
    />
  );
}

export function IconChevR(p: IconProps) {
  return <Icon {...p} d={<path d="M6 3l5 5-5 5" />} />;
}

export function IconChevD(p: IconProps) {
  return <Icon {...p} d={<path d="M3 6l5 5 5-5" />} />;
}

export function IconMore(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="3.5" cy="8" r="1" fill="currentColor" />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="12.5" cy="8" r="1" fill="currentColor" />
        </>
      }
    />
  );
}

export function IconHibernate(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M3 4h4l-4 4h4M9 8h4l-4 4h4" />
        </>
      }
    />
  );
}

export function IconRestore(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
          <path d="M2.5 2.5v3h3" />
        </>
      }
    />
  );
}

export function IconExternal(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M9.5 2.5h4v4" />
          <path d="M13.5 2.5l-6 6" />
          <path d="M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
        </>
      }
    />
  );
}

export function IconClock(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 5v3l2 1.5" />
        </>
      }
    />
  );
}

export function IconStar(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <path d="M8 2l1.7 3.7 4 .5-3 2.8.8 4-3.5-2.1-3.5 2.1.8-4-3-2.8 4-.5z" />
      }
    />
  );
}

export function IconFolder(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <path d="M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
      }
    />
  );
}

export function IconTag(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M2.5 8.5l6 6 6-6-6-6h-6z" />
          <circle cx="5.5" cy="5.5" r=".7" fill="currentColor" />
        </>
      }
    />
  );
}

export function IconCheck(p: IconProps) {
  return <Icon {...p} d={<path d="M3 8.5L6.5 12l6.5-7" />} />;
}

export function IconPlus(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M8 3v10M3 8h10" />
        </>
      }
    />
  );
}

export function IconEdit(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M11.5 2.5l2 2-7 7H4.5v-2z" />
          <path d="M10 4l2 2" />
          <path d="M4 13.5h8" />
        </>
      }
    />
  );
}

export function IconCopy(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
          <path d="M10.5 5.5V3.3a.8.8 0 0 0-.8-.8H3.3a.8.8 0 0 0-.8.8v6.4a.8.8 0 0 0 .8.8h2.2" />
        </>
      }
    />
  );
}

export function IconGlobe(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11" />
        </>
      }
    />
  );
}

export function IconPause(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M5.5 3.5v9M10.5 3.5v9" />
        </>
      }
    />
  );
}

export function IconPlay(p: IconProps) {
  return (
    <Icon
      {...p}
      fill="currentColor"
      d={<path d="M5 3l8 5-8 5V3z" />}
    />
  );
}

export function IconTrash(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5v8.5h7V4.5" />
          <path d="M6.5 7v4M9.5 7v4" />
        </>
      }
    />
  );
}

export function IconFolderOpen(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M2 4.5V12h11L14.5 6.5H5.5L4.5 4.5H2z" />
          <path d="M2 4.5V3h4l1.5 1.5" />
        </>
      }
    />
  );
}
