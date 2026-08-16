/**
 * The console's icon set.
 *
 * Inline SVG rather than emoji or box-drawing characters: those render at a
 * different size, weight and colour on every platform, which is exactly the
 * "looks unfinished" tell in an admin panel. These inherit currentColor and
 * sit on the same 20x20 grid, so a row of them lines up.
 */

type IconProps = { className?: string };

function Icon({ children, className = "h-[18px] w-[18px]" }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  );
}

export function ProjectsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </Icon>
  );
}

export function ServicesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3l2.1 4.6 5 .6-3.7 3.4 1 4.9L12 14.1 7.6 16.5l1-4.9L4.9 8.2l5-.6L12 3z" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </Icon>
  );
}

export function GalleryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-6 6" />
    </Icon>
  );
}

export function DeliveryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </Icon>
  );
}

export function ReportsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </Icon>
  );
}

export function SectionsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="8" height="6" rx="1.5" />
      <rect x="14" y="14" width="7" height="6" rx="1.5" />
    </Icon>
  );
}

export function TextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 6V4h14v2" />
      <path d="M12 4v16" />
      <path d="M9 20h6" />
    </Icon>
  );
}

export function TemplateIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 20V9" />
    </Icon>
  );
}

export function ThemeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a9 9 0 100 18h1.5a2 2 0 001.6-3.2 2 2 0 011.6-3.2H19a3 3 0 003-3A9 9 0 0012 3z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="11" cy="7.5" r="1" />
      <circle cx="15.5" cy="9" r="1" />
    </Icon>
  );
}

export function BusinessIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 21V6l7-3v18" />
      <path d="M11 9h6a2 2 0 012 2v10" />
      <path d="M2 21h20" />
      <path d="M7 9v.01M7 13v.01M15 13v.01M15 17v.01" />
    </Icon>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.3 10.8l7.4-4.3" />
      <path d="M8.3 13.2l7.4 4.3" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </Icon>
  );
}

export function PeopleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0112 0" />
      <path d="M16 5.5a3.2 3.2 0 010 6" />
      <path d="M17.5 14.5A6 6 0 0121 20" />
    </Icon>
  );
}

export function BillingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 15h4" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 008.9 19a1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 8.9a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V10a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l5 5 9-11" />
    </Icon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </Icon>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </Icon>
  );
}
