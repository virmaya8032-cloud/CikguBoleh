/**
 * Tanda CikguBoleh — kini menggunakan logo rasmi CikguBoleh (logo besar),
 * dipaparkan sebagai bulatan supaya konsisten di seluruh website.
 * Kekalkan prop `size` supaya semua tempat guna tanpa perubahan.
 */
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-hero.png"
      alt="Logo CikguBoleh"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
