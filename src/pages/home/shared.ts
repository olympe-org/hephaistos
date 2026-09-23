// Styles and helpers shared across the home page sections

export const CONTAINER = "mx-auto w-full max-w-[1400px] px-6 lg:px-10";

export const DARK_CARD =
  "relative overflow-hidden rounded-[28px] bg-[#0b0b0d] text-white ring-1 ring-white/10 lg:rounded-[36px] dark:bg-[#161619]";

export const H2 =
  "text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em]";

// Non-breaking space (avoids an invisible character in the code)
export const NBSP = String.fromCharCode(160);

export const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
