import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const InstagramGradient = "url(#instagram-loading-gradient)";

const SvgWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const FromMetaWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 400;
  color: rgb(142 142 142);
  position: absolute;
  bottom: 48px;
  left: 0;
  right: 0;
`;

export function InstagramLogoIconSvg({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="instagram-loading-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        ry="12"
        fill={InstagramGradient}
      />
      <circle
        cx="24"
        cy="24"
        r="10"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      <circle cx="36" cy="14" r="3" fill="white" />
    </svg>
  );
}

function MetaInfinitySvg() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 8 A 5 5 0 0 1 7 12 A 5 5 0 0 1 12 16 A 5 5 0 0 1 17 12 A 5 5 0 0 1 12 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface InstagramLoadingSplashProps {
  logoSize?: number;
}

export function InstagramLoadingSplash({
  logoSize = 64,
}: InstagramLoadingSplashProps) {
  return (
    <SvgWrap>
      <InstagramLogoIconSvg size={logoSize} />
    </SvgWrap>
  );
}

export function FromMetaBadge() {
  const { t } = useTranslation();
  const label = t("nav.fromMeta");
  const parts = label.split(/\s+(.+)$/);
  const first = parts[0] ?? "";
  const second = parts[1] ?? "";
  return (
    <FromMetaWrap>
      <span>{first}</span>
      <MetaInfinitySvg />
      <span>{second}</span>
    </FromMetaWrap>
  );
}
