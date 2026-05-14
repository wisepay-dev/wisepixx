import Link from "next/link";
import { BadgeCheck, PackageCheck } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type ListingCardProps = {
  listing: {
    title: string;
    slug: string;
    images: string[];
    priceCents: number;
    negotiable: boolean;
    deliveryType: string;
    ratingAverage: unknown;
    reviewCount: number;
    seller: { username: string | null; name: string | null; sellerLevel: string; kycStatus: string };
    category?: { name: string };
  };
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/anuncio/${listing.slug}`} className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="aspect-[4/3] bg-gradient-to-br from-wisepix-50 to-white">
        {listing.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-wisepix-500">
            <PackageCheck size={44} />
          </div>
        )}
      </div>
      <div className="space-y-3 p-3">
        <div>
          <p className="line-clamp-2 min-h-10 text-sm font800 font-bold text-premium-black">{listing.title}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{listing.category?.name ?? "Digital"}</p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-black text-wisepix-800">{formatCurrency(listing.priceCents)}</p>
            <p className="text-[11px] font-semibold uppercase text-slate-500">{listing.negotiable ? "Negociável" : "Preço fixo"}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-xs font-bold text-wisepix-950">
              {listing.seller.kycStatus === "APPROVED" ? <BadgeCheck size={14} className="text-wisepix-600" /> : null}
              @{listing.seller.username ?? "seller"}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">{listing.seller.sellerLevel}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
