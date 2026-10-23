# RIENG advertising placements

The supplied FTD zone `1892228828` is a Catfish (bottom anchor) format. Keep one
instance in the root layout. Its position and creative belong to the provider;
moving its tag into a content section does not make it an inline banner.

## Placement map

| Placement | Homepage | Other eligible public pages | Configuration |
| --- | --- | --- | --- |
| Player | Immediately after the live player | Below navigation | `NEXT_PUBLIC_AD_ZONE_PLAYER` |
| Feed | Between the catalogue promotion and RIENG TV | Not rendered | `NEXT_PUBLIC_AD_ZONE_FEED` |
| Footer | Above the footer | Above the footer | `NEXT_PUBLIC_AD_ZONE_FOOTER` |
| Catfish | One bottom anchor | Same persistent bottom anchor | Existing zone `1892228828` |

Until inline zones are configured, the three inline positions show clearly
labelled RIENG house promotions. They are not paid ads and do not send ad requests.
No provider creative is copied, relabelled, embedded in a restrictive iframe or
repeated to manufacture impressions.

## Activating paid inline banners

1. Ask the ad partner for three separately reportable **responsive inline banner**
   zone IDs. Request creatives sized for each slot: e.g. 728x90 desktop and
   320x100 mobile. Ask them to approve both `www.rieng254.com` and
   `www.riengradio.co.ke` if both domains are being used.
2. Set the corresponding public environment variables in the deployment project.
   The zone IDs are public tag identifiers, not credentials. Do not put the
   Catfish zone ID into these variables: the application rejects it.
3. Redeploy; Next.js includes public environment variables at build time.
4. Check actual delivered creatives, mobile width, keyboard access, navigation,
   player controls and the provider's placement-level impression reports.

Inline zones load within 200px of the viewport, once per mounted placement. They
have unique DOM IDs, share one provider script, and retain a house promotion if
blocked or unfilled. There is no timer-based refresh. Ad spaces are reserved in
the layout; the dimensions of the partner's creatives should match the agreed
responsive sizes.

The root-owned Catfish zone persists between eligible public routes. Its measured
visible bottom-fixed height supplies player clearance and footer padding; empty
or dismissed banners reserve no space. Payment, authentication and dashboard
routes remain outside the public-page allowlist in `lib/catfish.ts`.
